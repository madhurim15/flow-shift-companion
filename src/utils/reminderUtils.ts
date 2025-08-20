
import { supabase } from '@/integrations/supabase/client';

export type ReminderType = 'morning' | 'afternoon' | 'evening' | 'night';

export interface ReminderSettings {
  id?: string;
  user_id: string;
  morning_time: string;
  afternoon_time: string;
  evening_time: string;
  night_time: string;
  notifications_enabled: boolean;
  timezone: string;
}

export const defaultReminderTimes = {
  morning_time: '09:00:00',
  afternoon_time: '14:00:00',
  evening_time: '19:00:00',
  night_time: '21:00:00'
};

export const reminderMessages = {
  morning: "Good morning! 🌅 What's one small thing that would make today feel meaningful?",
  afternoon: "Midday check-in 🌱 How's your energy? Want to try a 2-minute reset?",
  evening: "Day's winding down 🌆 How did you show up for yourself today?",
  night: "Before you rest 🌙 What's one thing you're proud of today?"
};

export const getUserReminderSettings = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('reminder_settings')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const createOrUpdateReminderSettings = async (settings: Partial<ReminderSettings>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const existingSettings = await getUserReminderSettings();
  
  if (existingSettings) {
    const { data, error } = await supabase
      .from('reminder_settings')
      .update({ ...settings, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('reminder_settings')
      .insert({
        user_id: user.id,
        ...defaultReminderTimes,
        notifications_enabled: true,
        timezone: 'UTC',
        ...settings
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

export const scheduleReminder = async (type: ReminderType, scheduledTime: Date) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('check_in_reminders')
    .insert({
      user_id: user.id,
      reminder_type: type,
      scheduled_time: scheduledTime.toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const markReminderCompleted = async (reminderId: string, moodResponse?: string) => {
  const { data, error } = await supabase
    .from('check_in_reminders')
    .update({
      completed_at: new Date().toISOString(),
      mood_response: moodResponse
    })
    .eq('id', reminderId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const checkNotificationPermission = (): NotificationPermission => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return 'denied';
  }
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  // If already granted, return true
  if (Notification.permission === 'granted') {
    return true;
  }

  // If denied, don't request again
  if (Notification.permission === 'denied') {
    return false;
  }

  // Request permission for 'default' state
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const showNotification = (type: ReminderType) => {
  if (Notification.permission === 'granted') {
    new Notification('Flowlight Check-in', {
      body: reminderMessages[type],
      icon: '/favicon.ico',
      tag: `reminder-${type}`,
      requireInteraction: true
    });
  }
};
