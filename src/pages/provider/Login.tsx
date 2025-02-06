import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ProviderLogin = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // TODO: Implement Supabase authentication
    console.log("Login attempted with:", email);
    
    toast({
      title: "Login functionality coming soon",
      description: "Please check back later",
    });
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fadeIn">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Service Provider Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white p-6"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Continue with Email"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderLogin;