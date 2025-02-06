import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Service {
  id: number;
  name: string;
  duration: number;
  price: number;
}

interface QueueItem {
  id: number;
  customer_name: string;
  service_id: number;
  status: string;
  created_at: string;
}

const CustomerCheckIn = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
  }, []);

  // Subscribe to queue updates when customer ID is set
  useEffect(() => {
    if (!customerId) return;

    console.log('Subscribing to queue updates for customer ID:', customerId);
    
    const channel = supabase
      .channel('queue-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue',
        },
        (payload) => {
          console.log('Queue update received:', payload);
          updateQueuePosition();
        }
      )
      .subscribe();

    // Initial position check
    updateQueuePosition();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [customerId]);

  const updateQueuePosition = async () => {
    if (!customerId || !selectedService) return;

    try {
      // Get all waiting customers for the same service, ordered by creation time
      const { data: queueItems } = await supabase
        .from('queue')
        .select('*')
        .eq('service_id', selectedService.id)
        .eq('status', 'waiting')
        .order('created_at', { ascending: true });

      if (queueItems) {
        // Find position of current customer
        const position = queueItems.findIndex(item => item.id === customerId) + 1;
        console.log('Current queue position:', position);
        setQueuePosition(position);
      }
    } catch (error) {
      console.error('Error fetching queue position:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error: any) {
      console.error("Error fetching services:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch services",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("queue")
        .insert([
          {
            customer_name: customerName,
            service_id: selectedService.id,
            status: "waiting",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setCustomerId(data.id);
      toast({
        title: "Success",
        description: "You've been added to the queue",
      });
      
      // Don't reset the form after successful submission
      // so customer can see their selected service
    } catch (error: any) {
      console.error("Error submitting booking:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit booking request",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Check-In</CardTitle>
            <CardDescription>Select a service and enter your name to join the queue</CardDescription>
          </CardHeader>
          <CardContent>
            {queuePosition ? (
              <div className="mb-6 p-4 bg-primary/10 rounded-lg">
                <h3 className="font-medium text-lg mb-2">You're in the queue!</h3>
                <p className="text-muted-foreground">
                  Current position: {queuePosition}
                  {queuePosition === 1 ? " (You're next!)" : ""}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Selected service: {selectedService?.name}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Name</label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium">Select a Service</label>
                  <div className="grid gap-4">
                    {services.map((service) => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => setSelectedService(service)}
                        className={`p-4 text-left border rounded-lg transition-colors ${
                          selectedService?.id === service.id
                            ? "border-primary bg-primary/5"
                            : "hover:border-primary/50"
                        }`}
                      >
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {service.duration} minutes • R{service.price.toFixed(2)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!customerName || !selectedService || isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Join Queue"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerCheckIn;