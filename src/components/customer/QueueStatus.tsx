
import { Service } from "@/types/queue";

interface QueueStatusProps {
  position: number;
  selectedService: Service;
  referenceNumber: string | null;
}

export const QueueStatus = ({ position, selectedService, referenceNumber }: QueueStatusProps) => {
  return (
    <div className="mb-6 p-4 bg-primary/10 rounded-lg">
      <h3 className="font-medium text-lg mb-2">You're in the queue!</h3>
      {referenceNumber && (
        <p className="text-sm font-medium mb-2">
          Your reference number: <span className="font-mono bg-background p-1 rounded">{referenceNumber}</span>
        </p>
      )}
      <p className="text-muted-foreground">
        Current position: {position}
        {position === 1 ? " (You're next!)" : ""}
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        Selected service: {selectedService?.name}
      </p>
    </div>
  );
};
