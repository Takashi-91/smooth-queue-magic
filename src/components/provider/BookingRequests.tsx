
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, X } from "lucide-react";

interface QueueItem {
  id: number;
  customer_name: string;
  service_id: number;
  booking_status: string;
  created_at: string;
  service: {
    name: string;
  };
}

interface BookingRequestsProps {
  queueItems: QueueItem[];
}

const BookingRequests = ({ queueItems }: BookingRequestsProps) => {
  const { toast } = useToast();

  const handleBookingResponse = async (queueId: number, status: 'approved' | 'declined') => {
    try {
      const { error } = await supabase
        .from("queue")
        .update({
          booking_status: status,
          provider_response_at: new Date().toISOString(),
        })
        .eq("id", queueId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Booking ${status} successfully`,
      });
    } catch (error: any) {
      console.error("Error updating booking:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${status} booking`,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Requests</CardTitle>
        <CardDescription>Manage customer booking requests</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {queueItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="space-y-1">
                <h3 className="font-medium">{item.customer_name}</h3>
                <p className="text-sm text-muted-foreground">
                  Service: {item.service?.name} • Status: {item.booking_status}
                </p>
                <p className="text-xs text-muted-foreground">
                  Requested at: {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
              {item.booking_status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBookingResponse(item.id, 'approved')}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBookingResponse(item.id, 'declined')}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                </div>
              )}
            </div>
          ))}
          {queueItems.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No booking requests at the moment.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingRequests;
