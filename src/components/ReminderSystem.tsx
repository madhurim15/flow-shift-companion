
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Bell, BellOff, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  getUserReminderSettings, 
  createOrUpdateReminderSettings,
  requestNotificationPermission,
  showNotification,
  reminderMessages,
  type ReminderType
} from '@/utils/reminderUtils';

const ReminderSystem = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderSettings, setReminderSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadReminderSettings();
    setupReminderChecks();
  }, []);

  const loadReminderSettings = async () => {
    try {
      const settings = await getUserReminderSettings();
      setReminderSettings(settings);
      setNotificationsEnabled(settings?.notifications_enabled || false);
    } catch (error) {
      console.error('Error loading reminder settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupReminderChecks = () => {
    // Check every minute if it's time for a reminder
    const interval = setInterval(() => {
      checkForReminders();
    }, 60000);

    return () => clearInterval(interval);
  };

  const checkForReminders = async () => {
    if (!notificationsEnabled) return;
    
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    const reminderTimes = {
      morning: reminderSettings?.morning_time?.slice(0, 5) || '09:00',
      afternoon: reminderSettings?.afternoon_time?.slice(0, 5) || '14:00',
      evening: reminderSettings?.evening_time?.slice(0, 5) || '19:00',
      night: reminderSettings?.night_time?.slice(0, 5) || '21:00'
    };

    // Check if current time matches any reminder time
    for (const [type, time] of Object.entries(reminderTimes)) {
      if (currentTime === time) {
        showNotification(type as ReminderType);
        break;
      }
    }
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        toast({
          title: "Notifications blocked",
          description: "Please enable notifications in your browser settings for gentle check-ins.",
          variant: "destructive"
        });
        return;
      }
    }

    const newEnabled = !notificationsEnabled;
    setNotificationsEnabled(newEnabled);
    
    try {
      await createOrUpdateReminderSettings({
        notifications_enabled: newEnabled
      });
      
      toast({
        title: newEnabled ? "Gentle reminders enabled ✨" : "Reminders turned off",
        description: newEnabled 
          ? "We'll gently check in with you 4 times a day"
          : "You can always turn them back on when you're ready"
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast({
        title: "Couldn't update settings",
        description: "Please try again in a moment",
        variant: "destructive"
      });
    }
  };

  const testNotification = () => {
    showNotification('morning');
    toast({
      title: "Test notification sent!",
      description: "Check if you received it (may need to allow notifications first)"
    });
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
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
          onClick={toggleNotifications}
          className="flex items-center gap-2"
        >
          {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          {notificationsEnabled ? 'On' : 'Off'}
        </Button>
      </div>

      {notificationsEnabled && (
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
            onClick={testNotification}
            className="w-full text-xs"
          >
            Test notification
          </Button>
        </div>
      )}

      <div className="pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground">
          These gentle nudges help you stay connected with yourself throughout the day ✨
        </p>
      </div>
    </Card>
  );
};

export default ReminderSystem;
