import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Bell, BellOff, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  getUserReminderSettings, 
  createOrUpdateReminderSettings,
  requestNotificationPermission,
  checkNotificationPermission,
  showNotification,
  reminderMessages,
  type ReminderType
} from '@/utils/reminderUtils';

const ReminderSystem = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true); // Default to true
  const [reminderSettings, setReminderSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [browserPermissionWarning, setBrowserPermissionWarning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadReminderSettings();
    setupReminderChecks();
  }, []);

  const loadReminderSettings = async () => {
    try {
      let settings = await getUserReminderSettings();
      
      if (!settings) {
        // Auto-create default settings with reminders enabled
        console.log('No settings found, creating default settings');
        settings = await createOrUpdateReminderSettings({
          notifications_enabled: true
        });
        console.log('Created default reminder settings:', settings);
      }
      
      setReminderSettings(settings);
      setNotificationsEnabled(settings.notifications_enabled);
      
      // Check browser permission but don't block functionality
      const browserPermission = checkNotificationPermission();
      if (settings.notifications_enabled && browserPermission !== 'granted') {
        setBrowserPermissionWarning(true);
      }
      
      console.log('Loaded settings:', { 
        dbEnabled: settings.notifications_enabled,
        browserPermission,
        warningShown: browserPermission !== 'granted' && settings.notifications_enabled
      });
    } catch (error) {
      console.error('Error loading reminder settings:', error);
      // Even if database fails, keep reminders enabled by default
      setNotificationsEnabled(true);
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
        await sendReminder(type as ReminderType);
        break;
      }
    }
  };

  const sendReminder = async (type: ReminderType) => {
    const browserPermission = checkNotificationPermission();
    
    if (browserPermission === 'granted') {
      // Send browser notification
      showNotification(type);
    } else {
      // Fallback to in-app toast notification
      toast({
        title: "Gentle Check-in ✨",
        description: reminderMessages[type],
        duration: 10000, // Show for 10 seconds
      });
      
      // Show warning about browser notifications if not already shown
      if (!browserPermissionWarning) {
        setBrowserPermissionWarning(true);
      }
    }
  };

  const toggleNotifications = async () => {
    const newEnabled = !notificationsEnabled;
    
    try {
      await createOrUpdateReminderSettings({
        notifications_enabled: newEnabled
      });
      
      setNotificationsEnabled(newEnabled);
      
      if (newEnabled) {
        // Check browser permission when enabling
        const browserPermission = checkNotificationPermission();
        if (browserPermission !== 'granted') {
          setBrowserPermissionWarning(true);
        }
        
        toast({
          title: "Gentle reminders enabled ✨",
          description: "We'll gently check in with you 4 times a day"
        });
      } else {
        setBrowserPermissionWarning(false);
        toast({
          title: "Reminders turned off",
          description: "You can always turn them back on when you're ready"
        });
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast({
        title: "Couldn't update settings",
        description: "Please try again in a moment",
        variant: "destructive"
      });
    }
  };

  const requestBrowserPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setBrowserPermissionWarning(false);
      toast({
        title: "Browser notifications enabled! 🎉",
        description: "You'll now receive gentle reminders"
      });
    } else {
      toast({
        title: "Browser notifications blocked",
        description: "You'll still get in-app reminders, but enabling browser notifications gives you the best experience",
        variant: "destructive"
      });
    }
  };

  const testNotification = async () => {
    await sendReminder('morning');
    toast({
      title: "Test reminder sent!",
      description: "Check if you received it"
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

      {browserPermissionWarning && notificationsEnabled && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="text-sm text-amber-800">
            <strong>Browser notifications blocked</strong> - You're getting in-app reminders, but browser notifications would give you a better experience.
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={requestBrowserPermission}
            className="mt-2 text-amber-700 hover:text-amber-900"
          >
            Enable browser notifications
          </Button>
        </div>
      )}

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
            Test reminder
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
