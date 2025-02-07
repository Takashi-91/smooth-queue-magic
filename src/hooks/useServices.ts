
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Service } from "@/types/queue";
import { useToast } from "@/hooks/use-toast";

export const useServices = (providerId: string | undefined) => {
  const [services, setServices] = useState<Service[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
  }, [providerId]);

  const fetchServices = async () => {
    try {
      let query = supabase
        .from("services")
        .select("*")
        .order("created_at", { ascending: false });

      // Only add the provider filter if providerId is provided and not the route parameter placeholder
      if (providerId && providerId !== ":providerId") {
        query = query.eq("provider_id", providerId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setServices(data || []);
    } catch (error: any) {
      console.error("Error fetching services:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch services",
      });
    }
  };

  return services;
};
