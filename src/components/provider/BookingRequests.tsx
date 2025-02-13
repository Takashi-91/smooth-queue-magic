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
        <div className="space-y-4">
          {waitingCustomers.length === 0 ? (
            <p className="text-center text-muted-foreground">No customers waiting</p>
          ) : (
            waitingCustomers.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{item.customer_name}</h4>
                    <Badge variant="secondary">waiting</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Service: {item.service.name} ({item.service.duration} mins)
                  </p>
                  <div className="flex gap-4 mt-1">
                    <p className="text-xs text-muted-foreground">
                      Ref: {item.reference_number}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Joined: {formatTime(item.created_at)}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Est. Start: {calculateEstimatedTime(index)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleServeCustomer(item.id)}
                    className="text-teal-600 border-teal-600 hover:bg-teal-50"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Serve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveCustomer(item.id)}
                    className="bg-red-600 hover:bg-red-700"
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
