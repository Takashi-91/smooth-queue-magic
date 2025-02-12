import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useQueuePosition = (customerId: number | null, serviceId: number | null) => {
  const [queuePosition, setQueuePosition] = useState<number | null>(null);

  useEffect(() => {
    if (!customerId || !serviceId) return;

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
  }, [customerId, serviceId]);

  const updateQueuePosition = async () => {
    if (!customerId || !serviceId) return;

    try {
      // Get all active queue items for this service
      const { data: queueItems } = await supabase
        .from('queue')
        .select('*')
        .eq('service_id', serviceId)
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
