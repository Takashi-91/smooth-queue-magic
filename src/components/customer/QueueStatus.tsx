import { Service } from "@/types/queue";

interface QueueStatusProps {
  position: number;
  selectedService: Service;
  referenceNumber: string | null;
  status?: 'waiting' | 'served' | 'removed';
  servedAt?: string;
  removedAt?: string;
}

export const QueueStatus = ({ 
  position, 
  selectedService, 
  referenceNumber,
  status = 'waiting',
  servedAt,
  removedAt
}: QueueStatusProps) => {
  const getPositionText = (pos: number) => {
    if (pos <= 0) return "Position not found";
    if (pos === 1) return `You're in position${pos} in line for this provider!`;
    return `You are number ${pos} in this provider's queue`;
  };

  const getPeopleAheadText = (pos: number) => {
    if (pos <= 1) return null;
    const peopleAhead = pos - 1;
    return `(${peopleAhead} ${peopleAhead === 1 ? 'person' : 'people'} ahead of you for this provider)`;
  };

  const getStatusMessage = () => {
    if (status === 'served') {
      return (
        <div className="text-muted-foreground">
          <p>You have been served!</p>
          <p className="text-sm mt-1">
            Completed at: {new Date(servedAt!).toLocaleString()}
          </p>
        </div>
      );
    }

    if (status === 'removed') {
      return (
        <div className="text-muted-foreground">
          <p>You have been removed from the queue</p>
          <p className="text-sm mt-1">
            Removed at: {new Date(removedAt!).toLocaleString()}
          </p>
        </div>
      );
    }

    // Default waiting status
    return (
      <div className="text-muted-foreground">
        <p>{getPositionText(position)}</p>
        {getPeopleAheadText(position) && (
          <p className="text-sm mt-1">{getPeopleAheadText(position)}</p>
        )}
      </div>
    );
  };

  return (
    <div className="mb-6 p-4 bg-primary/10 rounded-lg">
      <h3 className="font-medium text-lg mb-2">
        {status === 'waiting' ? "You're in the queue!" : "Booking Status"}
      </h3>
      {referenceNumber && (
        <p className="text-sm font-medium mb-2">
          Your reference number: <span className="font-mono bg-background p-1 rounded">{referenceNumber}</span>
        </p>
      )}
      {getStatusMessage()}
      <p className="text-sm text-muted-foreground mt-2">
        Selected service: {selectedService?.name}
      </p>
    </div>
  );
};
