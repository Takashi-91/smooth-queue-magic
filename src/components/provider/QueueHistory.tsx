import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'served':
      return 'outline';
    case 'removed':
      return 'destructive';
    default:
      return 'default';
  }
};

const QueueHistory = ({ historyItems }: { historyItems: QueueItem[] }) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Queue History</CardTitle>
        <CardDescription>View past queue activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {historyItems.length === 0 ? (
            <p className="text-center text-muted-foreground">No history available</p>
          ) : (
            historyItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{item.customer_name}</h4>
                    <Badge variant={getStatusBadgeVariant(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Service: {item.service.name}
                  </p>
                  <div className="flex gap-4 mt-1">
                    <p className="text-xs text-muted-foreground">
                      Ref: {item.reference_number}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Joined: {formatTime(item.created_at)}
                    </p>
                    {item.served_at && (
                      <p className="text-xs text-muted-foreground">
                        Served: {formatTime(item.served_at)}
                      </p>
                    )}
                    {item.removed_at && (
                      <p className="text-xs text-muted-foreground">
                        Removed: {formatTime(item.removed_at)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QueueHistory; 