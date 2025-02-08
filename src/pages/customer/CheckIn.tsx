
import { useState } from "react";
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
import { Service } from "@/types/queue";
import { useServices } from "@/hooks/useServices";
import { QueueStatus } from "@/components/customer/QueueStatus";
import { ServiceCard } from "@/components/customer/ServiceCard";
import { Loader2 } from "lucide-react";

const CustomerCheckIn = () => {
  const [customerName, setCustomerName] = useState("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const { toast } = useToast();

  const services = useServices();

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
            booking_status: "pending",
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
            <CardTitle>Available Services</CardTitle>
            <CardDescription>
              Select a service to join the queue
            </CardDescription>
          </CardHeader>
          <CardContent>
            {customerId && selectedService ? (
              <QueueStatus 
                position={1} 
                selectedService={selectedService} 
              />
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
                      <ServiceCard
                        key={service.id}
                        service={service}
                        isSelected={selectedService?.id === service.id}
                        onSelect={setSelectedService}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!customerName || !selectedService || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Join Queue"
                  )}
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
