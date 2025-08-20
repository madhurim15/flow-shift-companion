
import { useState, useEffect } from 'react';
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
import { logNudgeResponse } from '@/utils/nudgeResponseUtils';
import type { NudgeResponseType } from '@/data/nudgeResponses';

export const useReminderSystem = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reminderSettings, setReminderSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [browserPermissionWarning, setBrowserPermissionWarning] = useState(false);
  const [showNudgeModal, setShowNudgeModal] = useState(false);
  const [currentReminderType, setCurrentReminderType] = useState<ReminderType | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadReminderSettings();
    const cleanup = setupReminderChecks();
    return cleanup;
  }, []);

  const loadReminderSettings = async () => {
    try {
      let settings = await getUserReminderSettings();
      
      if (!settings) {
        console.log('No settings found, creating default settings');
        settings = await createOrUpdateReminderSettings({
          notifications_enabled: true
        });
        console.log('Created default reminder settings:', settings);
      }
      
      setReminderSettings(settings);
      setNotificationsEnabled(settings.notifications_enabled);
      
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
      setNotificationsEnabled(true);
    } finally {
      setLoading(false);
    }
  };

  const setupReminderChecks = () => {
    const interval = setInterval(() => {
      checkForReminders();
    }, 60000);

    return () => clearInterval(interval);
  };

  const checkForReminders = async () => {
    if (!notificationsEnabled) return;
    
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    
    const reminderTimes = {
      morning: reminderSettings?.morning_time?.slice(0, 5) || '09:00',
      afternoon: reminderSettings?.afternoon_time?.slice(0, 5) || '14:00',
      evening: reminderSettings?.evening_time?.slice(0, 5) || '19:00',
      night: reminderSettings?.night_time?.slice(0, 5) || '21:00'
    };

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
      showNotification(type);
    }
    
    // Always show the nudge modal for enhanced user experience
    setCurrentReminderType(type);
    setShowNudgeModal(true);
    
    if (!browserPermissionWarning && browserPermission !== 'granted') {
      setBrowserPermissionWarning(true);
    }
  };

  const handleNudgeResponse = async (responseType: NudgeResponseType, responseData?: any) => {
    if (!currentReminderType) return;

    try {
      await logNudgeResponse({
        reminder_type: currentReminderType,
        response_type: responseType,
        response_data: responseData
      });

      // Handle different response types
      if (responseType === 'mood_check') {
        // This will be handled by the parent component (Index page)
        // which will trigger the mood selection flow
      }

      toast({
        title: "Response logged ✨",
        description: "Thank you for engaging with your wellness check-in",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error logging nudge response:', error);
    }
  };

  const closeNudgeModal = () => {
    setShowNudgeModal(false);
    setCurrentReminderType(null);
  };

  const toggleNotifications = async () => {
    const newEnabled = !notificationsEnabled;
    
    try {
      await createOrUpdateReminderSettings({
        notifications_enabled: newEnabled
      });
      
      setNotificationsEnabled(newEnabled);
      
      if (newEnabled) {
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

  return {
    notificationsEnabled,
    reminderSettings,
    loading,
    browserPermissionWarning,
    showNudgeModal,
    currentReminderType,
    toggleNotifications,
    requestBrowserPermission,
    testNotification,
    handleNudgeResponse,
    closeNudgeModal
  };
};
