
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2 } from "lucide-react";

interface Service {
  id: number;
  name: string;
  duration: number;
  price: number;
}

interface ServiceListItemProps {
  service: Service;
  onUpdate: (updatedService: Service) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export const ServiceListItem = ({ service, onUpdate, onDelete }: ServiceListItemProps) => {
  const [editingService, setEditingService] = useState<Service | null>(null);

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    await onUpdate(editingService);
    setEditingService(null);
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors">
      {editingService?.id === service.id ? (
        <form onSubmit={handleUpdateService} className="w-full grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            value={editingService.name}
            onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
            required
          />
          <Input
            type="number"
            min="0"
            value={editingService.duration}
            onChange={(e) => setEditingService({ ...editingService, duration: parseInt(e.target.value) })}
            required
          />
          <Input
            type="number"
            min="0"
            step="0.01"
            value={editingService.price}
            onChange={(e) => setEditingService({ ...editingService, price: parseFloat(e.target.value) })}
            required
          />
          <div className="flex gap-2">
            <Button type="submit" variant="outline">Save</Button>
            <Button type="button" variant="ghost" onClick={() => setEditingService(null)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <>
          <div className="space-y-1">
            <h3 className="font-medium">{service.name}</h3>
            <p className="text-sm text-muted-foreground">
              {service.duration} minutes • R{service.price.toFixed(2)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditingService(service)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(service.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
