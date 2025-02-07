
import { useState } from "react";
import { useParams } from "react-router-dom";
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
import { useQueuePosition } from "@/hooks/useQueuePosition";
import { ServiceCard } from "@/components/customer/ServiceCard";
import { QueueStatus } from "@/components/customer/QueueStatus";

const CustomerCheckIn = () => {
  const { providerId } = useParams();
  const [customerName, setCustomerName] = useState("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const { toast } = useToast();

  const services = useServices(providerId);
  const queuePosition = useQueuePosition(customerId, selectedService?.id ?? null);

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
            <CardTitle>Check-In</CardTitle>
            <CardDescription>
              {providerId 
                ? "Select a service to join the queue" 
                : "Select a service from any provider to join the queue"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {queuePosition && selectedService ? (
              <QueueStatus 
                position={queuePosition} 
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
