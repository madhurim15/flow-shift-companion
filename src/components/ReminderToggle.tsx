
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';

interface ReminderToggleProps {
  notificationsEnabled: boolean;
  onToggle: () => void;
}

const ReminderToggle = ({ notificationsEnabled, onToggle }: ReminderToggleProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-medium">Gentle Check-ins</h3>
        <p className="text-sm text-muted-foreground">
          4 gentle reminders throughout your day to pause and reflect
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="flex items-center gap-2"
      >
        {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
        {notificationsEnabled ? 'On' : 'Off'}
      </Button>
    </div>
  );
};

export default ReminderToggle;
