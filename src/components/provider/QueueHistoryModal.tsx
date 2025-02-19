import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { History, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QueueItem } from "@/types/queue";
import { format, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mixpanel } from "@/lib/mixpanel";

interface QueueHistoryModalProps {
  historyItems: QueueItem[];
  removed_at:string;
  served_at:string;
}

const QueueHistoryModal = ({ historyItems }: QueueHistoryModalProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filterType, setFilterType] = useState<'served' | 'removed' | 'all'>('all');

  useEffect(() => {
    mixpanel.track("History_Viewed", {
      timestamp: new Date().toISOString()
    });
  }, []);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    mixpanel.track("History_Date_Selected", {
      selected_date: date?.toISOString(),
      timestamp: new Date().toISOString()
    });
  };

  const handleFilterChange = (value: typeof filterType) => {
    setFilterType(value);
    mixpanel.track("History_Filter_Changed", {
      filter_type: value,
      timestamp: new Date().toISOString()
    });
  };

  const filteredHistory = historyItems.filter(item => {
    const itemDate = new Date(item.served_at || item.removed_at || item.created_at);
    const isCorrectDate = selectedDate ? isWithinInterval(itemDate, {
      start: startOfDay(selectedDate),
      end: endOfDay(selectedDate)
    }) : true;

    const matchesStatus = filterType === 'all' 
      ? true 
      : item.status === filterType;

    return isCorrectDate && matchesStatus;
  });

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'served':
        return 'outline';
      case 'removed':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50">
          <History className="h-4 w-4 mr-2" />
          History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Queue History</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="w-full sm:w-auto">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border w-full sm:w-auto"
              disabled={(date) => date > new Date()}
            />
          </div>
          <div className="w-full sm:w-[140px]">
            <Select
              value={filterType}
              onValueChange={handleFilterChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="served">Served</SelectItem>
                <SelectItem value="removed">Removed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {filteredHistory.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No history available for selected date
              </p>
            ) : (
              filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{item.customer_name}</h4>
                      <Badge variant={getStatusBadgeVariant(item.status)}>
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Service: {item.service.name}
                    </p>
                    <div className="flex gap-3 mt-1">
                      <p className="text-xs text-muted-foreground">
                        Ref: {item.reference_number}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Joined: {formatTime(item.created_at)}
                      </p>
                      {item.served_at && (
                        <p className="text-xs text-muted-foreground">
                          Served: {formatTime(item.served_at)}
                        </p>
                      )}
                      {item.removed_at && (
                        <p className="text-xs text-muted-foreground">
                          Removed: {formatTime(item.removed_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default QueueHistoryModal; 