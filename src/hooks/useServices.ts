
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Service } from "@/types/queue";
import { useToast } from "@/hooks/use-toast";

export const useServices = (providerId?: string) => {
  const [services, setServices] = useState<Service[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        let query = supabase
          .from("services")
          .select("*, providers(id, name, email)")
          .order('created_at', { ascending: false });

        if (providerId) {
          query = query.eq('provider_id', providerId);
        }

        const { data, error } = await query;

        if (error) throw error;

        const transformedServices: Service[] = data.map((service: any) => ({
          id: service.id,
          name: service.name,
          duration: service.duration,
          price: service.price,
          provider_id: service.provider_id,
          provider: service.providers ? {
            name: service.providers.name,
            email: service.providers.email
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
  }, [toast, providerId]);

  return services;
};
