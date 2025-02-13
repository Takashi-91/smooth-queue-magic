import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus, X } from "lucide-react";
import { useState, useEffect } from "react";

interface AddCustomerModalProps {
  providerId: string;
  onCustomerAdded?: () => void;
}

const AddCustomerModal = ({ providerId, onCustomerAdded }: AddCustomerModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'customerAdded') {
        setIsOpen(false);
        onCustomerAdded?.();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onCustomerAdded]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>
        <div className="flex-1 h-full">
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