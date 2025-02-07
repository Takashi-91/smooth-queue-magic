
import { Service } from "@/types/queue";

interface ServiceCardProps {
  service: Service;
  isSelected: boolean;
  onSelect: (service: Service) => void;
}

export const ServiceCard = ({ service, isSelected, onSelect }: ServiceCardProps) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(service)}
      className={`p-4 text-left border rounded-lg transition-colors ${
        isSelected
          ? "border-primary bg-primary/5"
          : "hover:border-primary/50"
      }`}
    >
      <div className="font-medium">{service.name}</div>
      <div className="text-sm text-muted-foreground">
        {service.duration} minutes • R{service.price.toFixed(2)}
      </div>
    </button>
  );
};
