
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
import { Check, X, Clock, User } from "lucide-react";

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
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Booking Requests
        </CardTitle>
        <CardDescription>Manage customer booking requests</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {queueItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">{item.customer_name}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Service: {item.service?.name}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(item.created_at).toLocaleString()}
                </p>
                <div className="text-xs inline-flex items-center rounded-full px-2 py-1 font-medium ring-1 ring-inset 
                  ${item.booking_status === 'pending' ? 'text-yellow-600 bg-yellow-50 ring-yellow-600/20' : 
                    item.booking_status === 'approved' ? 'text-green-600 bg-green-50 ring-green-600/20' :
                    'text-red-600 bg-red-50 ring-red-600/20'}">
                  {item.booking_status}
                </div>
              </div>
              {item.booking_status === 'pending' && (
                <div className="flex gap-2 mt-4 sm:mt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBookingResponse(item.id, 'approved')}
                    className="w-full sm:w-auto"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBookingResponse(item.id, 'declined')}
                    className="w-full sm:w-auto"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                </div>
              )}
            </div>
          ))}
          {queueItems.length === 0 && (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">
                No booking requests at the moment.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingRequests;
