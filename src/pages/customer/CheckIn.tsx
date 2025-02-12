import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Loader2, ArrowLeft, Copy, ArrowRight, Check } from "lucide-react";
import { useQueuePosition } from "@/hooks/useQueuePosition";

const CustomerCheckIn = () => {
  const navigate = useNavigate();
  const { providerId } = useParams();
  const [customerName, setCustomerName] = useState("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
  const [step, setStep] = useState<"select-service" | "enter-details">("select-service");
  const [isReferenceCopied, setIsReferenceCopied] = useState(false);
  const { toast } = useToast();

  const services = useServices(providerId);
  const queuePosition = useQueuePosition(customerId, selectedService?.id ?? null);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep("enter-details");
  };

  const handleBack = () => {
    setStep("select-service");
    setSelectedService(null);
  };

  const handleCopyReference = async () => {
    if (!referenceNumber) return;
    
    try {
      await navigator.clipboard.writeText(referenceNumber);
      setIsReferenceCopied(true);
      toast({
        title: "Success",
        description: "Reference number copied to clipboard",
      });
    } catch (error) {
      console.error('Failed to copy reference:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy reference number",
      });
    }
  };

  const handleCheckStatus = () => {
    navigate('/', { replace: true });
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
        .select("*, reference_number")
        .single();

      if (error) throw error;

      setCustomerId(data.id);
      setReferenceNumber(data.reference_number);
      toast({
        title: "Success",
        description: "You've been added to the queue",
      });
    } catch (error: any) {
      console.error("Error submitting booking:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to join the queue",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (customerId && selectedService) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <QueueStatus 
                position={queuePosition ?? 0}
                selectedService={selectedService}
                referenceNumber={referenceNumber}
              />
              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">Your reference number:</p>
                    <p className="font-mono text-lg">{referenceNumber}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyReference}
                    className="min-w-[100px]"
                  >
                    {isReferenceCopied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <Button
                  onClick={handleCheckStatus}
                  disabled={!isReferenceCopied}
                  className="w-full"
                >
                  Check Booking Status
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                {!isReferenceCopied && (
                  <p className="text-sm text-muted-foreground text-center">
                    Please copy your reference number before proceeding
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="border-none shadow-lg">
          <CardHeader>
            {step === "enter-details" && (
              <Button
                variant="ghost"
                className="w-fit -ml-2 mb-2"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Services
              </Button>
            )}
            <CardTitle className="text-3xl font-bold">
              {step === "select-service" ? "Available Services" : "Complete Booking"}
            </CardTitle>
            <CardDescription>
              {step === "select-service"
                ? "Select a service to begin booking"
                : "Enter your details to confirm your booking"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "select-service" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    isSelected={selectedService?.id === service.id}
                    onSelect={handleServiceSelect}
                  />
                ))}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Name</label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!customerName || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Confirm Booking"
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
