
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
      const { data: queueItems } = await supabase
        .from('queue')
        .select('*')
        .eq('service_id', serviceId)
        .eq('status', 'waiting')
        .order('created_at', { ascending: true });

      if (queueItems) {
        const position = queueItems.findIndex(item => item.id === customerId) + 1;
        console.log('Current queue position:', position);
        setQueuePosition(position);
      }
    } catch (error) {
      console.error('Error fetching queue position:', error);
    }
  };

  return queuePosition;
};
