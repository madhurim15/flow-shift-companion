import { useState } from 'react';
import { Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import PomodoroTimer from '@/components/PomodoroTimer';

const PomodoroModal = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gentle-hover">
          <Timer className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pomodoro Timer</DialogTitle>
        </DialogHeader>
        <PomodoroTimer />
      </DialogContent>
    </Dialog>
  );
};

export default PomodoroModal;