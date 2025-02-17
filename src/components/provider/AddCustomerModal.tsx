import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { mixpanel } from "@/lib/mixpanel";

interface AddCustomerModalProps {
  providerId: string;
  onCustomerAdded?: () => void;
}

const AddCustomerModal = ({ providerId, onCustomerAdded }: AddCustomerModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalOpenTime, setModalOpenTime] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      const openTime = new Date().getTime();
      setModalOpenTime(openTime);
      
      // Track modal opening
      mixpanel.track("Add_Customer_Modal_Opened", {
        provider_id: providerId,
        timestamp: new Date(openTime).toISOString(),
        source: "provider_dashboard"
      });
    } else {
      // Track modal closing without confirmation
      if (modalOpenTime) {
        const duration = new Date().getTime() - modalOpenTime;
        mixpanel.track("Add_Customer_Modal_Closed", {
          provider_id: providerId,
          duration_ms: duration,
          completed: false,
          timestamp: new Date().toISOString()
        });
      }
      setModalOpenTime(null);
    }
  }, [isOpen, providerId]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'customerAdded' && modalOpenTime) {
        const duration = new Date().getTime() - modalOpenTime;
        
        // Track successful customer addition
        mixpanel.track("Add_Customer_Confirmed", {
          provider_id: providerId,
          duration_ms: duration,
          timestamp: new Date().toISOString(),
          completed: true
        });

        // Track modal completion
        mixpanel.track("Add_Customer_Modal_Closed", {
          provider_id: providerId,
          duration_ms: duration,
          completed: true,
          timestamp: new Date().toISOString()
        });

        setIsOpen(false);
        onCustomerAdded?.();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onCustomerAdded, providerId, modalOpenTime]);

  const handleOpenModal = () => {
    setIsOpen(true);
    mixpanel.track("Add_Customer_Button_Clicked", {
      provider_id: providerId,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="border-teal-600 text-teal-600 hover:bg-teal-50"
          onClick={handleOpenModal}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl h-[70vh] p-0 pt-4">
        <DialogHeader className="px-6 mb-2">
          <DialogTitle>Add New Customer</DialogTitle>
        </DialogHeader>
        <div className="flex-1">
          <iframe
            src={`/customer/services/${providerId}`}
            className="w-full h-full border-none"
            title="Add Customer"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomerModal; 