
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { QueueStatus } from "@/components/customer/QueueStatus";
import { Service } from "@/types/queue";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [referenceNumber, setReferenceNumber] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<{
    position: number;
    service: Service;
    referenceNumber: string;
  } | null>(null);

  const checkStatus = async () => {
    if (!referenceNumber.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a reference number",
      });
      return;
    }

    setIsChecking(true);
    try {
      // First, get the booking details
      const { data: queueData, error: queueError } = await supabase
        .from("queue")
        .select(`
          *,
          service:services (
            id,
            name,
            duration,
            price,
            provider_id
          )
        `)
        .eq("reference_number", referenceNumber.trim())
        .maybeSingle();

      if (queueError) throw queueError;

      if (!queueData) {
        toast({
          variant: "destructive",
          title: "Not Found",
          description: "No booking found with this reference number",
        });
        return;
      }

      // Get the position in queue
      const { data: queueItems } = await supabase
        .from("queue")
        .select("*")
        .eq("service_id", queueData.service_id)
        .eq("status", "waiting")
        .order("created_at", { ascending: true });

      const position = queueItems?.findIndex(
        (item) => item.reference_number === referenceNumber
      ) + 1;

      setBookingDetails({
        position: position || 0,
        service: queueData.service,
        referenceNumber: queueData.reference_number,
      });

    } catch (error) {
      console.error("Error checking status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to check booking status",
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center animate-fadeIn">
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">
            Queue Management Made Simple
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-8">
            Streamline your barbershop or salon with our efficient queue management system
          </p>

          {!bookingDetails ? (
            <div className="max-w-md mx-auto mb-8 p-6 bg-white rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Check Booking Status</h2>
              <div className="flex gap-2">
                <Input
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="Enter reference number"
                  className="flex-1"
                />
                <Button 
                  onClick={checkStatus}
                  disabled={isChecking}
                >
                  {isChecking ? "Checking..." : "Check"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto mb-8">
              <QueueStatus
                position={bookingDetails.position}
                selectedService={bookingDetails.service}
                referenceNumber={bookingDetails.referenceNumber}
              />
              <Button
                variant="outline"
                onClick={() => setBookingDetails(null)}
                className="w-full mt-4"
              >
                Check Another Booking
              </Button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-slideUp">
            <Button
              onClick={() => navigate("/provider/login")}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-lg text-lg transition-all duration-300 w-full sm:w-auto"
            >
              Service Provider Login
            </Button>
            <Button
              onClick={() => navigate("/customer/services")}
              variant="outline"
              className="px-8 py-6 rounded-lg text-lg border-2 border-primary text-primary hover:bg-primary/10 transition-all duration-300 w-full sm:w-auto"
            >
              Browse All Services
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
