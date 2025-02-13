import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useQueuePosition = (customerId: number | null, providerId: string | null) => {
  const [queuePosition, setQueuePosition] = useState<number | null>(null);

  useEffect(() => {
    if (!customerId || !providerId) return;

    console.log('Subscribing to queue updates for customer ID:', customerId);
    
    const channel = supabase
      .channel('queue-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue',
        },
        (payload) => {
          console.log('Queue update received:', payload);
          updateQueuePosition();
        }
      )
      .subscribe();

    // Initial position check
    updateQueuePosition();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [customerId, providerId]);

  const updateQueuePosition = async () => {
    if (!customerId || !providerId) return;

    try {
      // First get the service provider's services
      const { data: services } = await supabase
        .from('services')
        .select('id')
        .eq('provider_id', providerId);

      if (!services) return;

      const serviceIds = services.map(service => service.id);

      // Get all active queue items for this provider's services
      const { data: queueItems } = await supabase
        .from('queue')
        .select('*')
        .in('service_id', serviceIds)
        .eq('status', 'waiting')
        .is('served_at', null)
        .is('removed_at', null)
        .order('created_at', { ascending: true });

      if (queueItems) {
        // Find position based on created_at timestamp
        const position = queueItems.findIndex(item => item.id === customerId) + 1;
        const totalAhead = position > 0 ? position - 1 : 0;
        console.log('Current queue position:', position, 'Total ahead:', totalAhead);
        setQueuePosition(position);
      }
    } catch (error) {
      console.error('Error fetching queue position:', error);
    }
  };

  return queuePosition;
};
