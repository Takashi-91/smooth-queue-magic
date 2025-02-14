import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link, History, LogOut } from "lucide-react";
import ServicesManagement from "@/components/provider/ServicesManagement";
import BookingRequests from "@/components/provider/BookingRequests";
import QueueHistoryModal from "@/components/provider/QueueHistoryModal";
import { Service, QueueItem } from "@/types/queue";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { startOfToday, startOfMonth, endOfMonth, isToday } from 'date-fns';
import { format } from 'date-fns';
import AddCustomerModal from "@/components/provider/AddCustomerModal";

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
      await supabase.auth.signOut();
      // Clear local state
      setUserId(null);
      setServices([]);
      setQueueItems([]);
      // Force navigation after state clear
      navigate("/provider/login", { replace: true });
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

  const getQueueStats = () => {
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());

    // Total customers this month
    const totalThisMonth = queueItems.filter(item => {
      const itemDate = new Date(item.created_at);
      return itemDate >= monthStart && itemDate <= monthEnd;
    }).length;

    // Currently waiting customers
    const currentlyWaiting = queueItems.filter(item => 
      item.status === 'waiting' && 
      !item.served_at && 
      !item.removed_at
    ).length;

    // Served customers today
    const servedToday = queueItems.filter(item => 
      item.status === 'served' && 
      item.served_at && 
      isToday(new Date(item.served_at))
    ).length;

    // Removed customers today
    const removedToday = queueItems.filter(item => 
      item.status === 'removed' && 
      item.removed_at && 
      isToday(new Date(item.removed_at))
    ).length;

    return { 
      totalThisMonth, 
      waiting: currentlyWaiting, 
      servedToday, 
      removedToday 
    };
  };

  const stats = getQueueStats();

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 md:p-6 lg:p-8 overflow-x-hidden">
      <div className="max-w-[2000px] mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Queue Manager</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Manage your queue and services
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={handleCopyCheckInLink}
              className="flex-1 sm:flex-none min-w-[120px] border-teal-600 text-teal-600 hover:bg-teal-50"
            >
              <Link className="h-4 w-4 mr-2" />
              Copy Check-in Link
            </Button>
            <AddCustomerModal 
              providerId={userId || ''} 
              onCustomerAdded={fetchQueueItems}
            />
            <QueueHistoryModal 
              historyItems={queueItems.filter(item => item.status !== 'waiting')} 
            />
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex-1 sm:flex-none min-w-[100px] border-teal-600 text-teal-600 hover:bg-teal-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <Card className="min-w-[140px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total This Month
              </CardTitle>
              <CardDescription className="text-xs">
                {format(startOfMonth(new Date()), 'MMMM yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.totalThisMonth}</div>
            </CardContent>
          </Card>
          <Card className="min-w-[140px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Waiting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-orange-500">
                {stats.waiting}
              </div>
            </CardContent>
          </Card>
          <Card className="min-w-[140px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Served Today
              </CardTitle>
              <CardDescription className="text-xs">
                {format(new Date(), 'dd MMM yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-500">
                {stats.servedToday}
              </div>
            </CardContent>
          </Card>
          <Card className="min-w-[140px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Removed Today
              </CardTitle>
              <CardDescription className="text-xs">
                {format(new Date(), 'dd MMM yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-red-500">
                {stats.removedToday}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <div className="lg:col-span-8">
            <BookingRequests 
              queueItems={queueItems.filter(item => item.status === 'waiting')} 
              onQueueUpdate={fetchQueueItems} 
            />
          </div>
          <div className="lg:col-span-4">
            <ServicesManagement 
              userId={userId} 
              services={services} 
              setServices={setServices} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
