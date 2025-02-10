
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface NewService {
  name: string;
  duration: number;
  price: number;
}

interface NewServiceFormProps {
  onSubmit: (service: NewService) => Promise<void>;
}

export const NewServiceForm = ({ onSubmit }: NewServiceFormProps) => {
  const [newService, setNewService] = useState<NewService>({
    name: "",
    duration: 0,
    price: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(newService);
    setNewService({ name: "", duration: 0, price: 0 });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Service</CardTitle>
        <CardDescription>Create a new service for your customers</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="0"
                value={newService.duration}
                onChange={(e) => setNewService({ ...newService, duration: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (ZAR)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={newService.price}
                onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) })}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full">
            <Plus className="mr-2" />
            Add Service
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
