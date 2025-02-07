
import { Service } from "@/types/queue";

interface QueueStatusProps {
  position: number;
  selectedService: Service;
}

export const QueueStatus = ({ position, selectedService }: QueueStatusProps) => {
  return (
    <div className="mb-6 p-4 bg-primary/10 rounded-lg">
      <h3 className="font-medium text-lg mb-2">You're in the queue!</h3>
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
