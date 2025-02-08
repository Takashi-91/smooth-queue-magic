
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Service } from "@/types/queue";
import { useToast } from "@/hooks/use-toast";

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from("services")
          .select("*, providers(id, name)")
          .order('created_at', { ascending: false });

        if (error) throw error;

        const transformedServices: Service[] = data.map((service: any) => ({
          id: service.id,
          name: service.name,
          duration: service.duration,
          price: service.price,
          provider_id: service.provider_id,
          provider: service.providers ? {
            name: service.providers.name
          } : undefined
        }));

        setServices(transformedServices);
      } catch (error: any) {
        console.error("Error fetching services:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch services",
        });
      }
    };

    fetchServices();
  }, [toast]);

  return services;
};
