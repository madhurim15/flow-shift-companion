import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { reminderMessages, type ReminderType } from '@/utils/reminderUtils';

export interface DailySchedule {
  morning: string;
  afternoon: string;
  evening: string;
  night: string;
}

const NOTIFICATION_IDS = {
  morning: 1001,
  afternoon: 1002,
  evening: 1003,
  night: 1004
};

export const scheduleDailyNotifications = async (schedule: DailySchedule): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    console.log('Not on native platform, skipping daily notification scheduling');
    return false;
  }

  try {
    // Clear any existing notifications
    await clearTodaysNotifications();

    const notifications: any[] = [];

    // Schedule each reminder type as a repeating daily notification
    Object.entries(schedule).forEach(([type, timeString]) => {
      const reminderType = type as ReminderType;
      const [hours, minutes] = timeString.split(':').map(Number);

      const notification: any = {
        id: NOTIFICATION_IDS[reminderType],
        title: 'FlowLight ✨',
        body: reminderMessages[reminderType],
        schedule: {
          repeats: true,
          every: 'day',
          on: {
            hour: hours,
            minute: minutes
          }
        },
        extra: {
          type: 'daily_reminder',
          reminderType,
          timestamp: Date.now()
        }
      };

      // Use high priority channel for Android
      if (Capacitor.getPlatform() === 'android') {
        notification.channelId = 'flowlight_high';
      }

      notifications.push(notification);
      console.log(`Scheduled ${reminderType} daily repeating reminder at ${timeString}`);
    });

    await LocalNotifications.schedule({
      notifications
    });
    console.log(`Successfully scheduled ${notifications.length} repeating daily notifications`);

    return true;
  } catch (error) {
    console.error('Failed to schedule daily notifications:', error);
    return false;
  }
};

export const clearTodaysNotifications = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const ids = Object.values(NOTIFICATION_IDS);
    await LocalNotifications.cancel({ notifications: ids.map(id => ({ id })) });
    console.log('Cleared existing daily notifications');
  } catch (error) {
    console.error('Failed to clear existing notifications:', error);
  }
};

export const getLastScheduledDate = (): string | null => {
  return localStorage.getItem('flowlight_last_scheduled_date');
};

export const setLastScheduledDate = (date: string): void => {
  localStorage.setItem('flowlight_last_scheduled_date', date);
};

export const shouldRescheduleToday = (): boolean => {
  const today = new Date().toDateString();
  const lastScheduled = getLastScheduledDate();
  return lastScheduled !== today;
};