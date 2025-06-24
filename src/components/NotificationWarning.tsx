
import { Button } from '@/components/ui/button';

interface NotificationWarningProps {
  onRequestPermission: () => void;
}

const NotificationWarning = ({ onRequestPermission }: NotificationWarningProps) => {
  return (
    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
      <div className="text-sm text-amber-800">
        <strong>Browser notifications blocked</strong> - You're getting in-app reminders, but browser notifications would give you a better experience.
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onRequestPermission}
        className="mt-2 text-amber-700 hover:text-amber-900"
      >
        Enable browser notifications
      </Button>
    </div>
  );
};

export default NotificationWarning;
