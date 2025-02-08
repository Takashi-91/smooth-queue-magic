
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Provider } from "@/types/queue";
import { useToast } from "@/hooks/use-toast";

export const useProvider = (providerId: string | undefined) => {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!providerId) {
      setIsLoading(false);
      return;
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(providerId)) {
      console.error("Invalid UUID format for providerId");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid provider ID format",
      });
      setIsLoading(false);
      return;
    }

    const fetchProvider = async () => {
      try {
        const { data, error } = await supabase
          .from("providers")
          .select("*")
          .eq("id", providerId)
          .maybeSingle();

        if (error) throw error;
        setProvider(data);
      } catch (error: any) {
        console.error("Error fetching provider:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch provider information",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProvider();
  }, [providerId, toast]);

  return { provider, isLoading };
};
