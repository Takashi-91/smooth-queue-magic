import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CustomerCheckIn = () => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // TODO: Implement check-in logic with Supabase
    console.log("Check-in attempted for:", name);
    
    toast({
      title: "Check-in functionality coming soon",
      description: "Please check back later",
    });
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fadeIn">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Customer Check-in</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCheckIn} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white p-6"
              disabled={loading}
            >
              {loading ? "Checking in..." : "Join Queue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerCheckIn;