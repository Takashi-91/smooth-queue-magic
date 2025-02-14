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
import { Check, X, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { addMinutes, format } from "date-fns";

interface QueueItem {
  id: number;
  customer_name: string;
  service_id: number;
  status: string;
  created_at: string;
  reference_number: string;
  service: {
    name: string;
    duration: number;
  };
  served_at: string | null;
  removed_at: string | null;
}

const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'waiting':
      return 'secondary';
    case 'served':
      return 'outline';
    case 'removed':
      return 'destructive';
    default:
      return 'default';
  }
};

const BookingRequests = ({ queueItems, onQueueUpdate }: { queueItems: QueueItem[], onQueueUpdate: () => void }) => {
  const { toast } = useToast();
  
  // Only show waiting customers
  const waitingCustomers = queueItems.filter(item => item.status === 'waiting');

  const calculateEstimatedTime = (index: number) => {
    const now = new Date();
    let totalMinutes = 0;
    
    // Sum up duration of all customers ahead in queue
    for (let i = 0; i <= index; i++) {
      totalMinutes += waitingCustomers[i].service.duration;
    }
    
    const estimatedTime = addMinutes(now, totalMinutes);
    return format(estimatedTime, 'h:mm a');
  };

  const handleServeCustomer = async (queueItemId: number) => {
    try {
      const { error } = await supabase
        .from('queue')
        .update({
          status: 'served',
          served_at: new Date().toISOString(),
        })
        .eq('id', queueItemId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Customer has been served",
      });
      onQueueUpdate();
    } catch (error) {
      console.error('Error serving customer:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update customer status",
      });
    }
  };

  const handleRemoveCustomer = async (queueItemId: number) => {
    try {
      const { error } = await supabase
        .from('queue')
        .update({
          status: 'removed',
          removed_at: new Date().toISOString(),
        })
        .eq('id', queueItemId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Customer has been removed from queue",
      });
      onQueueUpdate();
    } catch (error) {
      console.error('Error removing customer:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove customer",
      });
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Queue</CardTitle>
        <CardDescription>Manage customers currently waiting</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 sm:space-y-3">
          {queueItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No customers in queue
            </p>
          ) : (
            queueItems.map((item, index) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg gap-2 sm:gap-4"
              >
                <div className="w-full sm:w-auto">
                  <div className="flex items-center justify-between sm:justify-start gap-2 mb-1">
                    <h4 className="font-medium">{item.customer_name}</h4>
                    <Badge>{item.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Service: {item.service.name}
                  </p>
                  <div className="flex flex-col xs:flex-row gap-2 xs:gap-4 mt-1 text-xs text-muted-foreground">
                    <p>Ref: {item.reference_number}</p>
                    <p className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Est. Start: {calculateEstimatedTime(index)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleServeCustomer(item.id)}
                    className="flex-1 sm:flex-none text-teal-600 border-teal-600 hover:bg-teal-50"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Serve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveCustomer(item.id)}
                    className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingRequests;
