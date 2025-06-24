
import { Button } from '@/components/ui/button';

interface ReminderTimesProps {
  reminderSettings: any;
  onTestNotification: () => void;
}

const ReminderTimes = ({ reminderSettings, onTestNotification }: ReminderTimesProps) => {
  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground">
        <strong>Your daily check-in times:</strong>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex justify-between">
          <span>Morning:</span>
          <span>{reminderSettings?.morning_time?.slice(0, 5) || '09:00'}</span>
        </div>
        <div className="flex justify-between">
          <span>Afternoon:</span>
          <span>{reminderSettings?.afternoon_time?.slice(0, 5) || '14:00'}</span>
        </div>
        <div className="flex justify-between">
          <span>Evening:</span>
          <span>{reminderSettings?.evening_time?.slice(0, 5) || '19:00'}</span>
        </div>
        <div className="flex justify-between">
          <span>Night:</span>
          <span>{reminderSettings?.night_time?.slice(0, 5) || '21:00'}</span>
        </div>
      </div>
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onTestNotification}
        className="w-full text-xs"
      >
        Test reminder
      </Button>
    </div>
  );
};

export default ReminderTimes;
