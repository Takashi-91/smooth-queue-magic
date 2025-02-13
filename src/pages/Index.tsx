import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { QueueStatus } from "@/components/customer/QueueStatus";
import { Service } from "@/types/queue";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingDetails {
  position: number;
  service: Service;
  referenceNumber: string;
  status: 'waiting' | 'served' | 'removed';
  servedAt?: string;
  removedAt?: string;
}

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [referenceNumber, setReferenceNumber] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);

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

      // Check if customer has been served or removed
      if (queueData.served_at) {
        setBookingDetails({
          position: -1,
          service: queueData.service,
          referenceNumber: queueData.reference_number,
          status: 'served',
          servedAt: queueData.served_at
        });
        return;
      }

      if (queueData.removed_at) {
        setBookingDetails({
          position: -1,
          service: queueData.service,
          referenceNumber: queueData.reference_number,
          status: 'removed',
          removedAt: queueData.removed_at
        });
        return;
      }

      // Get the position in queue only if customer is still waiting
      const { data: services } = await supabase
        .from('services')
        .select('id')
        .eq('provider_id', queueData.service.provider_id);

      if (!services) throw new Error("Could not fetch provider services");

      const serviceIds = services.map(service => service.id);

      const { data: queueItems } = await supabase
        .from("queue")
        .select("*")
        .in("service_id", serviceIds)
        .eq("status", "waiting")
        .is("served_at", null)
        .is("removed_at", null)
        .order("created_at", { ascending: true });

      const position = queueItems?.findIndex(
        (item) => item.reference_number === referenceNumber
      ) + 1;

      setBookingDetails({
        position: position || 0,
        service: queueData.service,
        referenceNumber: queueData.reference_number,
        status: 'waiting'
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
    <div 
      className="min-h-screen bg-cover bg-center relative" 
      style={{ backgroundImage: "url(/Land.jpeg)" }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            Hairhub Queue Manager
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white">
            Streamline your barbershop or salon with our efficient queue management system
          </p>
        </div>

        {!bookingDetails ? (
          <div className="mt-10 max-w-md mx-auto p-6 bg-white bg-opacity-90 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Check Booking Status</h2>
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="Enter your reference number"
                  className="pl-10 h-12"
                />
              </div>
              <Button 
                onClick={checkStatus}
                disabled={isChecking}
                className={cn(
                  "w-full transition-all duration-300",
                  "bg-teal-600 hover:bg-teal-700",
                  "flex items-center justify-center gap-2 h-12"
                )}
              >
                {isChecking ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Checking...
                  </div>
                ) : (
                  "Check Status"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-10 max-w-md mx-auto p-6 bg-white bg-opacity-90 rounded-lg shadow-lg">
            <QueueStatus
              position={bookingDetails.position}
              selectedService={bookingDetails.service}
              referenceNumber={bookingDetails.referenceNumber}
              status={bookingDetails.status}
              servedAt={bookingDetails.servedAt}
              removedAt={bookingDetails.removedAt}
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
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 inset-x-0 py-6 text-center text-sm text-white">
        <p>© {new Date().getFullYear()} Queue Manager. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
