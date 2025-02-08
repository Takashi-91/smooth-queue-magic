
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Service } from "@/types/queue";
import { useToast } from "@/hooks/use-toast";

export const useServices = (providerId: string | undefined) => {
  const [services, setServices] = useState<Service[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!providerId) return;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(providerId)) {
      console.error("Invalid UUID format for providerId");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid provider ID format",
      });
      return;
    }

    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("provider_id", providerId)
          .order("created_at", { ascending: false });

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

    fetchServices();
  }, [providerId, toast]);

  return services;
};
