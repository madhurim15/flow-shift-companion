
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
import { useLocalNotifications } from '@/hooks/useLocalNotifications';
import { 
  scheduleDailyNotifications, 
  shouldRescheduleToday, 
  setLastScheduledDate,
  type DailySchedule 
} from '@/utils/dailyNotificationScheduler';
import { Capacitor } from '@capacitor/core';

export const useReminderSystem = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reminderSettings, setReminderSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [browserPermissionWarning, setBrowserPermissionWarning] = useState(false);
  const [showNudgeModal, setShowNudgeModal] = useState(false);
  const [currentReminderType, setCurrentReminderType] = useState<ReminderType | null>(null);
  const { toast } = useToast();
  const localNotifications = useLocalNotifications();

  useEffect(() => {
    initializeNotificationSystem();
  }, []);

  useEffect(() => {
    // Re-schedule notifications when settings change
    if (reminderSettings && notificationsEnabled) {
      scheduleTodaysNotifications();
    }
  }, [reminderSettings, notificationsEnabled]);

  const initializeNotificationSystem = async () => {
    try {
      // Initialize local notifications on mobile
      if (Capacitor.isNativePlatform()) {
        await localNotifications.initLocalNotifications();
      }

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
      
      // Handle browser permission warning only for web
      if (!Capacitor.isNativePlatform()) {
        const browserPermission = checkNotificationPermission();
        if (settings.notifications_enabled && browserPermission !== 'granted') {
          setBrowserPermissionWarning(true);
        }
      }
      
      console.log('Initialized notification system:', { 
        platform: Capacitor.getPlatform(),
        dbEnabled: settings.notifications_enabled,
        isNative: Capacitor.isNativePlatform()
      });
    } catch (error) {
      console.error('Error initializing notification system:', error);
      setNotificationsEnabled(true);
    } finally {
      setLoading(false);
    }
  };

  const scheduleTodaysNotifications = async () => {
    if (!notificationsEnabled || !reminderSettings) return;
    
    // Only schedule if we haven't already scheduled today
    if (!shouldRescheduleToday()) {
      console.log('Already scheduled notifications for today');
      return;
    }

    const schedule: DailySchedule = {
      morning: reminderSettings.morning_time?.slice(0, 5) || '09:00',
      afternoon: reminderSettings.afternoon_time?.slice(0, 5) || '14:00',
      evening: reminderSettings.evening_time?.slice(0, 5) || '19:00',
      night: reminderSettings.night_time?.slice(0, 5) || '21:00'
    };

    const success = await scheduleDailyNotifications(schedule);
    if (success) {
      setLastScheduledDate(new Date().toDateString());
      console.log('Successfully scheduled today\'s notifications');
    }
  };

  const sendReminder = async (type: ReminderType) => {
    // Mobile-first approach: Try native notifications first
    if (Capacitor.isNativePlatform() && localNotifications.isEnabled) {
      const success = await localNotifications.scheduleHighPriorityReminder(
        'FlowLight ✨',
        reminderMessages[type],
        0 // Send immediately
      );
      
      if (success) {
        console.log(`Sent native notification for ${type} reminder`);
      }
    } else {
      // Fallback to browser notifications on web
      const browserPermission = checkNotificationPermission();
      
      if (browserPermission === 'granted') {
        showNotification(type);
      } else if (!browserPermissionWarning) {
        setBrowserPermissionWarning(true);
      }
    }
    
    // Always show the nudge modal for enhanced user experience
    setCurrentReminderType(type);
    setShowNudgeModal(true);
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
        // Request native permissions on mobile
        if (Capacitor.isNativePlatform()) {
          await localNotifications.requestPermissions();
        } else {
          // Handle browser permissions on web
          const browserPermission = checkNotificationPermission();
          if (browserPermission !== 'granted') {
            setBrowserPermissionWarning(true);
          }
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
    if (Capacitor.isNativePlatform()) {
      // Request native permissions on mobile
      const granted = await localNotifications.requestPermissions();
      if (granted) {
        toast({
          title: "Notifications enabled! 🎉",
          description: "You'll now receive gentle reminders"
        });
      } else {
        toast({
          title: "Notification permission needed",
          description: "Please enable notifications in your device settings",
          variant: "destructive"
        });
      }
    } else {
      // Handle browser permissions on web
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
