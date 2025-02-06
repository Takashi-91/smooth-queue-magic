import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ProviderDashboard = () => {
  const [queue, setQueue] = useState([]);
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-secondary">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
            <Button
              variant="outline"
              onClick={() => {
                toast({
                  title: "Logout functionality coming soon",
                  description: "Please check back later",
                });
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="animate-fadeIn">
            <CardHeader>
              <CardTitle>Current Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No customers in queue</p>
            </CardContent>
          </Card>
          
          <Card className="animate-fadeIn">
            <CardHeader>
              <CardTitle>Services</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No services added yet</p>
            </CardContent>
          </Card>
          
          <Card className="animate-fadeIn">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" onClick={() => toast({ title: "Coming soon" })}>
                Add Customer
              </Button>
              <Button className="w-full" variant="outline" onClick={() => toast({ title: "Coming soon" })}>
                Manage Services
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ProviderDashboard;