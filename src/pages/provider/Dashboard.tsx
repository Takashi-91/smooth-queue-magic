
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "lucide-react";
import ServicesManagement from "@/components/provider/ServicesManagement";
import BookingRequests from "@/components/provider/BookingRequests";

interface Service {
  id: number;
  name: string;
  duration: number;
  price: number;
}

interface QueueItem {
  id: number;
  customer_name: string;
  service_id: number;
  booking_status: string;
  created_at: string;
  service: Service;
}

const ProviderDashboard = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchServices();
      fetchQueueItems();
      subscribeToQueueUpdates();
    }
  }, [userId]);

  const subscribeToQueueUpdates = () => {
    const channel = supabase
      .channel('queue-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue',
        },
        () => {
          fetchQueueItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/provider/login");
    } else {
      setUserId(session.user.id);
    }
  };

  const fetchServices = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq('provider_id', userId)
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

  const fetchQueueItems = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("queue")
        .select(`
          *,
          service:services!inner(*)
        `)
        .eq('service.provider_id', userId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setQueueItems(data || []);
    } catch (error: any) {
      console.error("Error fetching queue items:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch queue items",
      });
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/provider/login");
    } catch (error: any) {
      console.error("Error logging out:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out",
      });
    }
  };

  const handleCopyCheckInLink = async () => {
    if (!userId) return;
    
    const checkInUrl = `${window.location.origin}/customer/services/${userId}`;
    try {
      await navigator.clipboard.writeText(checkInUrl);
      toast({
        title: "Success",
        description: "Check-in link copied to clipboard",
      });
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy link to clipboard",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Provider Dashboard</h1>
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleCopyCheckInLink}>
              <Link className="h-4 w-4 mr-2" />
              Copy Check-in Link
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        <BookingRequests queueItems={queueItems} />
        <ServicesManagement userId={userId} services={services} setServices={setServices} />
      </div>
    </div>
  );
};

export default ProviderDashboard;
