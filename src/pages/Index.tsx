import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log("Landing page mounted");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center animate-fadeIn">
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">
            Queue Management Made Simple
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-8">
            Streamline your barbershop or salon with our efficient queue management system
          </p>
          <div className="space-x-4 animate-slideUp">
            <Button
              onClick={() => navigate("/provider/login")}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-lg text-lg transition-all duration-300"
            >
              Service Provider Login
            </Button>
            <Button
              onClick={() => navigate("/customer/check-in")}
              variant="outline"
              className="px-8 py-6 rounded-lg text-lg border-2 border-primary text-primary hover:bg-primary/10 transition-all duration-300"
            >
              Customer Check-in
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;