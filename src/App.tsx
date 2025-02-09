
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProviderLogin from "./pages/provider/Login";
import SignUp from "./pages/auth/SignUp";
import ProviderDashboard from "./pages/provider/Dashboard";
import CustomerCheckIn from "./pages/customer/CheckIn";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/provider/login" element={<ProviderLogin />} />
          <Route path="/auth/signup" element={<SignUp />} />
          <Route path="/provider/dashboard" element={<ProviderDashboard />} />
          <Route path="/customer/services" element={<CustomerCheckIn />} />
          <Route path="/customer/services/:providerId" element={<CustomerCheckIn />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
