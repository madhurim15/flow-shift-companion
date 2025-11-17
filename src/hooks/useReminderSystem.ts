
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
import { 
  scheduleDailyNotifications, 
  shouldRescheduleToday, 
  setLastScheduledDate,
  type DailySchedule 
} from '@/utils/dailyNotificationScheduler';
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
      
      // Enable midnight rescheduler if notifications are enabled
      if (settings.notifications_enabled && Capacitor.isNativePlatform()) {
        try {
          await SystemMonitoring.scheduleMidnightReschedule();
          console.log('Midnight rescheduler activated on app init');
        } catch (error) {
          console.error('Failed to activate midnight rescheduler:', error);
        }
      }
    } catch (error) {
      console.error('Error initializing notification system:', error);
      setNotificationsEnabled(true);
    } finally {
      setLoading(false);
    }
  };

  const scheduleTodaysNotifications = useCallback(async () => {
    if (!notificationsEnabled || !reminderSettings) return;
    
    // Only schedule if we haven't already scheduled today
    if (!shouldRescheduleToday()) {
      console.log('Already scheduled notifications for today');
      return;
    }

    const schedule: DailySchedule = {
      morning: reminderSettings.morning_time?.slice(0, 5) || '09:00',
      afternoon: reminderSettings.afternoon_time?.slice(0, 5) || '13:00',
      evening: reminderSettings.evening_time?.slice(0, 5) || '18:00',
      night: reminderSettings.night_time?.slice(0, 5) || '21:00'
    };

    console.log('Scheduling daily notifications:', schedule);

    if (Capacitor.isNativePlatform()) {
      try {
        await localNotifications.scheduleLocalNotifications(schedule);
        console.log('✅ Native notifications scheduled for today');
        setLastScheduledDate();
      } catch (error) {
        console.error('Failed to schedule native notifications:', error);
      }
    } else {
      try {
        await scheduleDailyNotifications(schedule);
        console.log('✅ Browser notifications scheduled for today');
        setLastScheduledDate();
      } catch (error) {
        console.error('Failed to schedule browser notifications:', error);
        // Fallback to showing permission request
        if (checkNotificationPermission() === 'default') {
          setBrowserPermissionWarning(true);
        }
      }
    }
  }, [notificationsEnabled, reminderSettings, localNotifications]);

  const testNotification = async () => {
    await sendReminder('morning');
    toast({
      title: "Test reminder sent!",
      description: "Check if you received it"
    });
  };

  // Listen for midnight reschedule events on native platforms
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    
    let listenerHandle: any;
    
    const setupListener = async () => {
      try {
        listenerHandle = await SystemMonitoring.addListener('midnightReschedule', () => {
          console.log('Received midnight reschedule event');
          scheduleTodaysNotifications();
        });
      } catch (error) {
        console.error('Failed to setup midnight reschedule listener:', error);
      }
    };
    
    setupListener();
    
    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, [reminderSettings, notificationsEnabled]);

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
