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
import { addMinutes, format, parseISO } from "date-fns";
import { mixpanel } from "@/lib/mixpanel";

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
  start_time: string | null;
  finish_time: string | null;
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

  const calculateEstimatedTimes = (waitingCustomers: QueueItem[]) => {
    let currentTime = new Date();
    const estimates: { [key: number]: { start: Date; finish: Date } } = {};

    waitingCustomers.forEach((customer, index) => {
      if (index === 0) {
        // First customer starts now
        estimates[customer.id] = {
          start: currentTime,
          finish: addMinutes(currentTime, customer.service.duration)
        };
      } else {
        // Each subsequent customer starts when previous customer finishes
        const previousCustomer = waitingCustomers[index - 1];
        const previousFinishTime = estimates[previousCustomer.id].finish;
        
        estimates[customer.id] = {
          start: previousFinishTime,
          finish: addMinutes(previousFinishTime, customer.service.duration)
        };
      }
    });

    return estimates;
  };

  // Calculate estimates for all waiting customers
  const estimatedTimes = calculateEstimatedTimes(waitingCustomers);

  const formatEstimatedTime = (queueItemId: number): { start: string; finish: string } | { start: 'N/A'; finish: 'N/A' } => {
    const estimate = estimatedTimes[queueItemId];
    if (!estimate) return { start: 'N/A', finish: 'N/A' };

    return {
      start: format(estimate.start, 'h:mm a'),
      finish: format(estimate.finish, 'h:mm a')
    };
  };

  const handleServeCustomer = async (queueItemId: number) => {
    const startTime = new Date().getTime();
    
    mixpanel.track("Serve_Customer_Started", {
      queue_item_id: queueItemId,
      timestamp: new Date().toISOString()
    });

    try {
      const { error } = await supabase
        .from('queue')
        .update({
          status: 'served',
          served_at: new Date().toISOString(),
        })
        .eq('id', queueItemId);

      if (error) throw error;

      const duration = new Date().getTime() - startTime;
      
      mixpanel.track("Serve_Customer_Success", {
        queue_item_id: queueItemId,
        duration_ms: duration,
        timestamp: new Date().toISOString()
      });

      toast({
        title: "Success",
        description: "Customer has been served",
      });
      onQueueUpdate();
    } catch (error) {
      mixpanel.track("Serve_Customer_Failed", {
        queue_item_id: queueItemId,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      console.error('Error serving customer:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update customer status",
      });
    }
  };

  const handleRemoveCustomer = async (queueItemId: number) => {
    const startTime = new Date().getTime();
    
    mixpanel.track("Remove_Customer_Started", {
      queue_item_id: queueItemId,
      timestamp: new Date().toISOString()
    });

    try {
      const { error } = await supabase
        .from('queue')
        .update({
          status: 'removed',
          removed_at: new Date().toISOString(),
        })
        .eq('id', queueItemId);

      if (error) throw error;

      const duration = new Date().getTime() - startTime;
      
      mixpanel.track("Remove_Customer_Success", {
        queue_item_id: queueItemId,
        duration_ms: duration,
        timestamp: new Date().toISOString()
      });

      toast({
        title: "Success",
        description: "Customer has been removed from queue",
      });
      onQueueUpdate();
    } catch (error) {
      mixpanel.track("Remove_Customer_Failed", {
        queue_item_id: queueItemId,
        error: error.message,
        timestamp: new Date().toISOString()
      });
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
            queueItems.map((item) => {
              const times = formatEstimatedTime(item.id);
              return (
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
                      Service: {item.service.name} ({item.service.duration} mins)
                    </p>
                    <div className="flex flex-col xs:flex-row gap-2 xs:gap-4 mt-1 text-xs text-muted-foreground">
                      <p>Ref: {item.reference_number}</p>
                      <div className="flex flex-col xs:flex-row gap-1 xs:gap-3">
                        <p className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Start: {times.start}
                        </p>
                        <p className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Finish: {times.finish}
                        </p>
                      </div>
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
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingRequests;
