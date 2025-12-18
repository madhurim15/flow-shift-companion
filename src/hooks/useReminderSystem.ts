
import { useState, useEffect, useCallback } from 'react';
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
import { Capacitor } from '@capacitor/core';
import { SystemMonitoring } from '@/plugins/system-monitoring';

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
      // Initialize local notifications on mobile (but don't auto-request permissions)
      if (Capacitor.isNativePlatform()) {
        await localNotifications.initLocalNotifications();
        // Do NOT auto-request permissions here - let user explicitly opt-in
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

  const scheduleTodaysNotifications = useCallback(async () => {
    if (!notificationsEnabled || !reminderSettings) return;

    // Format times as HH:mm (strip seconds if present)
    const formatTime = (time: string | null, defaultTime: string) => {
      if (!time) return defaultTime;
      return time.slice(0, 5);
    };

    const morning = formatTime(reminderSettings.morning_time, '09:00');
    const afternoon = formatTime(reminderSettings.afternoon_time, '13:00');
    const evening = formatTime(reminderSettings.evening_time, '18:00');
    const night = formatTime(reminderSettings.night_time, '21:00');

    console.log('Scheduling daily notifications:', { morning, afternoon, evening, night });

    try {
      if (Capacitor.isNativePlatform()) {
        // Use native AlarmManager-based scheduler for reliable daily reminders
        await SystemMonitoring.setDailyReminderTimes({
          morning,
          afternoon,
          evening,
          night
        });
        console.log('✅ Native daily reminders scheduled via AlarmManager');
      } else {
        // Web fallback - just log
        console.log('Web platform - daily reminders not supported');
      }
    } catch (error) {
      console.error('Failed to schedule notifications:', error);
      // Fallback to showing permission request on web
      if (!Capacitor.isNativePlatform() && checkNotificationPermission() === 'default') {
        setBrowserPermissionWarning(true);
      }
    }
  }, [notificationsEnabled, reminderSettings]);

  const requestBrowserPermission = async () => {
    if (Capacitor.isNativePlatform()) {
      const granted = await localNotifications.requestPermissions();
      setBrowserPermissionWarning(!granted);
      return granted;
    } else {
      const granted = await requestNotificationPermission();
      setBrowserPermissionWarning(!granted);
      return granted;
    }
  };

  const toggleNotifications = async () => {
    try {
      const newState = !notificationsEnabled;
      await createOrUpdateReminderSettings({ notifications_enabled: newState });
      setNotificationsEnabled(newState);

      if (newState) {
        await requestBrowserPermission();
        await scheduleTodaysNotifications();
      }

      toast({
        title: newState ? '✅ Notifications enabled' : '🔕 Notifications disabled',
        description: newState
          ? "You'll receive gentle check-in reminders"
          : 'No more check-in reminders',
      });
    } catch (error) {
      console.error('Error toggling notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification settings',
        variant: 'destructive',
      });
    }
  };

  const testNotification = async () => {
    if (Capacitor.isNativePlatform()) {
      await localNotifications.scheduleHighPriorityReminder(
        'FlowFocus ✨',
        reminderMessages.morning,
        1
      );
    } else {
      await showNotification('morning');
    }
    toast({ title: 'Test reminder sent!', description: 'Check if you received it' });
  };

  const handleNudgeResponse = async (responseType: NudgeResponseType, data?: any) => {
    try {
      if (currentReminderType) {
        await logNudgeResponse({
          reminder_type: currentReminderType,
          response_type: responseType,
          response_data: data
        });
      }
      setShowNudgeModal(false);
      toast({
        title: 'Noted ✔️',
        description: 'Thanks for checking in',
      });
    } catch (error) {
      console.error('Failed to log nudge response:', error);
    }
  };

  const closeNudgeModal = () => setShowNudgeModal(false);

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
