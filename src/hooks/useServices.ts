
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
          .select(`
            *,
            provider:providers(name)
          `)
          .eq('providers.is_public', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform the data to match the Service type
        const transformedServices: Service[] = (data || []).map(service => ({
          ...service,
          provider: service.provider ? { name: service.provider.name } : undefined
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
