import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pencil, Trash2, Plus } from "lucide-react";

interface Service {
  id: number;
  name: string;
  duration: number;
  price: number;
}

interface ServicesManagementProps {
  userId: string | null;
  services: Service[];
  setServices: (services: Service[]) => void;
}

const ServicesManagement = ({ userId, services, setServices }: ServicesManagementProps) => {
  const [newService, setNewService] = useState({
    name: "",
    duration: 0,
    price: 0,
  });
  const [editingService, setEditingService] = useState<Service | null>(null);
  const { toast } = useToast();

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to create services",
      });
      return;
    }

    try {
      const { data: providerData, error: providerError } = await supabase
        .from("providers")
        .select("id")
        .eq("id", userId)
        .single();

      if (providerError) {
        throw new Error("Provider not found. Please try logging out and back in.");
      }

      const { data, error } = await supabase
        .from("services")
        .insert([{
          ...newService,
          provider_id: userId
        }])
        .select()
        .single();

      if (error) throw error;

      setServices([data, ...services]);
      setNewService({ name: "", duration: 0, price: 0 });
      toast({
        title: "Success",
        description: "Service created successfully",
      });
    } catch (error: any) {
      console.error("Error creating service:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create service",
      });
    }
  };

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    try {
      const { data, error } = await supabase
        .from("services")
        .update({
          name: editingService.name,
          duration: editingService.duration,
          price: editingService.price,
        })
        .eq("id", editingService.id)
        .select()
        .single();

      if (error) throw error;

      setServices(services.map(s => s.id === data.id ? data : s));
      setEditingService(null);
      toast({
        title: "Success",
        description: "Service updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating service:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update service",
      });
    }
  };

  const handleDeleteService = async (id: number) => {
    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setServices(services.filter(s => s.id !== id));
      toast({
        title: "Success",
        description: "Service deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting service:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete service",
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Add New Service</CardTitle>
          <CardDescription>Create a new service for your customers</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateService} className="space-y-4">
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

      <Card>
        <CardHeader>
          <CardTitle>Your Services</CardTitle>
          <CardDescription>Manage your existing services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
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
                        onClick={() => handleDeleteService(service.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {services.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No services added yet. Create your first service above.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ServicesManagement;
