import { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';

const CalendarModal = () => {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <CalendarIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Calendar</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
          
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>📅 Basic calendar view</p>
            <p className="text-xs">
              Google Calendar integration will be available once configured with your Google Client ID.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarModal;