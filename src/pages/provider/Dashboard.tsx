
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link as LinkIcon, LogOut, Layout } from "lucide-react";
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
    fetchServices();
    fetchQueueItems();
    subscribeToQueueUpdates();
  }, []);

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
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
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
    try {
      const { data, error } = await supabase
        .from("queue")
        .select(`
          *,
          service:services(*)
        `)
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
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-lg shadow-lg animate-fade-in">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Provider Dashboard</h1>
            <p className="text-muted-foreground">Manage your services and bookings</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button 
              variant="outline" 
              onClick={handleCopyCheckInLink}
              className="w-full sm:w-auto justify-center"
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Copy Check-in Link
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="w-full sm:w-auto justify-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <BookingRequests queueItems={queueItems} />
          </div>
          <div className="space-y-8">
            <ServicesManagement userId={userId} services={services} setServices={setServices} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
