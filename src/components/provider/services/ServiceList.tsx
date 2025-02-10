
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ServiceListItem } from "./ServiceListItem";

interface Service {
  id: number;
  name: string;
  duration: number;
  price: number;
}

interface ServiceListProps {
  services: Service[];
  onUpdate: (updatedService: Service) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export const ServiceList = ({ services, onUpdate, onDelete }: ServiceListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Services</CardTitle>
        <CardDescription>Manage your existing services</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.map((service) => (
            <ServiceListItem
              key={service.id}
              service={service}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
          {services.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No services added yet. Create your first service above.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
