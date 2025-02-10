
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { NewServiceForm } from "./services/NewServiceForm";
import { ServiceList } from "./services/ServiceList";

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
  const { toast } = useToast();

  const handleCreateService = async (newService: Omit<Service, "id">) => {
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

  const handleUpdateService = async (updatedService: Service) => {
    try {
      const { data, error } = await supabase
        .from("services")
        .update({
          name: updatedService.name,
          duration: updatedService.duration,
          price: updatedService.price,
        })
        .eq("id", updatedService.id)
        .select()
        .single();

      if (error) throw error;

      setServices(services.map(s => s.id === data.id ? data : s));
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
      <NewServiceForm onSubmit={handleCreateService} />
      <ServiceList
        services={services}
        onUpdate={handleUpdateService}
        onDelete={handleDeleteService}
      />
    </>
  );
};

export default ServicesManagement;
