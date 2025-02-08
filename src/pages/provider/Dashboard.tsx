import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pencil, Trash2, Plus, Check, X, Link } from "lucide-react";

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
  const [newService, setNewService] = useState({
    name: "",
    duration: 0,
    price: 0,
  });
  const [editingService, setEditingService] = useState<Service | null>(null);
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

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to create services",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("services")
        .insert([{
          ...newService,
          provider_id: userId
        }])
        .select()
        .single();

      if (error) throw error;

      setServices([data, ...services]);
      setNewService({ name: "", duration: 0, price: 0 });
      toast({
        title: "Success",
        description: "Service created successfully",
      });
    } catch (error: any) {
      console.error("Error creating service:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create service",
      });
    }
  };

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    try {
      const { data, error } = await supabase
        .from("services")
        .update({
          name: editingService.name,
          duration: editingService.duration,
          price: editingService.price,
        })
        .eq("id", editingService.id)
        .select()
        .single();

      if (error) throw error;

      setServices(services.map(s => s.id === data.id ? data : s));
      setEditingService(null);
      toast({
        title: "Success",
        description: "Service updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating service:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update service",
      });
    }
  };

  const handleDeleteService = async (id: number) => {
    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setServices(services.filter(s => s.id !== id));
      toast({
        title: "Success",
        description: "Service deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting service:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete service",
      });
    }
  };

  const handleBookingResponse = async (queueId: number, status: 'approved' | 'declined') => {
    try {
      const { error } = await supabase
        .from("queue")
        .update({
          booking_status: status,
          provider_response_at: new Date().toISOString(),
        })
        .eq("id", queueId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Booking ${status} successfully`,
      });
    } catch (error: any) {
      console.error("Error updating booking:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${status} booking`,
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
    
    const checkInUrl = `${window.location.origin}/customer/check-in/${userId}`;
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

        <Card>
          <CardHeader>
            <CardTitle>Booking Requests</CardTitle>
            <CardDescription>Manage customer booking requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {queueItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <h3 className="font-medium">{item.customer_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Service: {item.service?.name} • Status: {item.booking_status}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Requested at: {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                  {item.booking_status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBookingResponse(item.id, 'approved')}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBookingResponse(item.id, 'declined')}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {queueItems.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No booking requests at the moment.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add New Service</CardTitle>
            <CardDescription>Create a new service for your customers</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateService} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Service Name</Label>
                  <Input
                    id="name"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="0"
                    value={newService.duration}
                    onChange={(e) => setNewService({ ...newService, duration: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (ZAR)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                <Plus className="mr-2" />
                Add Service
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Services</CardTitle>
            <CardDescription>Manage your existing services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  {editingService?.id === service.id ? (
                    <form onSubmit={handleUpdateService} className="w-full grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Input
                        value={editingService.name}
                        onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                        required
                      />
                      <Input
                        type="number"
                        min="0"
                        value={editingService.duration}
                        onChange={(e) => setEditingService({ ...editingService, duration: parseInt(e.target.value) })}
                        required
                      />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editingService.price}
                        onChange={(e) => setEditingService({ ...editingService, price: parseFloat(e.target.value) })}
                        required
                      />
                      <div className="flex gap-2">
                        <Button type="submit" variant="outline">Save</Button>
                        <Button type="button" variant="ghost" onClick={() => setEditingService(null)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <h3 className="font-medium">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {service.duration} minutes • R{service.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingService(service)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteService(service.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {services.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No services added yet. Create your first service above.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProviderDashboard;
