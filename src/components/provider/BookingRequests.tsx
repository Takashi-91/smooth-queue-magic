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
  status: string;
  created_at: string;
  reference_number: string;
  service: {
    name: string;
  };
  served_at: string | null;
  removed_at: string | null;
}

interface BookingRequestsProps {
  queueItems: QueueItem[];
}

const BookingRequests = ({ queueItems }: BookingRequestsProps) => {
  const { toast } = useToast();

  const handleQueueAction = async (queueId: number, action: 'serve' | 'remove') => {
    try {
      const updates = {
        status: action === 'serve' ? 'served' : 'removed',
        [action === 'serve' ? 'served_at' : 'removed_at']: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("queue")
        .update(updates)
        .eq("id", queueId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Customer ${action === 'serve' ? 'served' : 'removed'} successfully`,
      });
    } catch (error: any) {
      console.error(`Error ${action}ing customer:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${action} customer`,
      });
    }
  };

  const activeQueueItems = queueItems.filter(
    item => !item.served_at && !item.removed_at
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Queue Management</CardTitle>
        <CardDescription>Manage customer queue</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeQueueItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="space-y-1">
                <h3 className="font-medium">{item.customer_name}</h3>
                <p className="text-sm text-muted-foreground">
                  Service: {item.service?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Ref: {item.reference_number} • Joined at: {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQueueAction(item.id, 'serve')}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Serve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQueueAction(item.id, 'remove')}
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          ))}
          {activeQueueItems.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No customers in queue.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingRequests;
