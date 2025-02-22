import { Service } from "@/types/queue";
import { Clock, CreditCard, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { mixpanel } from "@/lib/mixpanel";

interface ServiceCardProps {
  service: Service;
  isSelected: boolean;
  onSelect: (service: Service) => void;
}

export const ServiceCard = ({ service, isSelected, onSelect }: ServiceCardProps) => {
  const handleServiceSelect = (service: Service) => {
    // Track service selection
    mixpanel.track("Booking Started", {
      service_name: service.name,
      service_id: service.id,
      service_provider: service.provider?.name,
      service_price: service.price,
      service_duration: service.duration
    });
    
    onSelect(service);
  };

  return (
    <button
      type="button"
      onClick={() => handleServiceSelect(service)}
      className={cn(
        "w-full p-6 text-left border rounded-xl transition-all duration-200",
        "hover:shadow-lg hover:scale-[1.02] hover:border-primary/50",
        "focus:outline-none focus:ring-2 focus:ring-primary/50",
        "bg-card relative overflow-hidden group",
        isSelected && "border-primary bg-primary/5"
      )}
    >
      <div className="relative z-10">
        <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
        
        <div className="space-y-3">
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            <span>{service.duration} minutes</span>
          </div>
          
          <div className="flex items-center text-muted-foreground">
            <CreditCard className="h-4 w-4 mr-2" />
            <span>R{service.price.toFixed(2)}</span>
          </div>

          {service.provider && (
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">
                Provided by {service.provider.name}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="h-4 w-4 mr-2" />
                <span>{service.provider.email}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className={cn(
        "absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 transition-opacity duration-200",
        "group-hover:opacity-100",
        isSelected && "opacity-100"
      )} />
    </button>
  );
};
