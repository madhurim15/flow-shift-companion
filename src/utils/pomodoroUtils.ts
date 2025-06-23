
import { supabase } from '@/integrations/supabase/client';

export interface PomodoroSession {
  id?: string;
  user_id: string;
  session_type: string | null; // Changed from 'focus' | 'break' to match database
  planned_duration: number; // in seconds
  actual_duration?: number | null;
  completed: boolean | null;
  interrupted: boolean | null;
  interruption_reason?: string | null;
  started_at: string;
  completed_at?: string | null;
}

export const FOCUS_DURATION = 25 * 60; // 25 minutes in seconds
export const BREAK_DURATION = 5 * 60; // 5 minutes in seconds

export const focusMessages = [
  "You're creating something beautiful right now ✨",
  "Every moment of focus is a gift to your future self 🌱",
  "Your concentrated attention is powerful magic 🪄",
  "This focused time is exactly what you need 💙",
  "You're in your flow state - breathe and trust it 🌊",
  "Your mind is sharp and ready - you've got this 🎯",
  "This is your sacred focus time 🕊️",
  "Feel the calm power of your concentrated attention 🌟"
];

export const breakMessages = [
  "Rest is productive too - you're recharging beautifully 🌸",
  "This pause is preparing you for your next burst of brilliance ✨",
  "Your brain is processing everything perfectly right now 🧠",
  "Breathe deeply - you're exactly where you need to be 🌬️",
  "This gentle break is part of your success story 📚",
  "You're honoring your natural rhythms 🌊",
  "Rest is resistance against hustle culture - well done 💪",
  "Your future focused self will thank you for this pause 🙏"
];

export const startPomodoroSession = async (sessionType: 'focus' | 'break' = 'focus') => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const plannedDuration = sessionType === 'focus' ? FOCUS_DURATION : BREAK_DURATION;

  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .insert({
      user_id: user.id,
      session_type: sessionType,
      planned_duration: plannedDuration,
      completed: false,
      interrupted: false,
      started_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const completePomodoroSession = async (sessionId: string, actualDuration: number) => {
  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .update({
      completed: true,
      actual_duration: actualDuration,
      completed_at: new Date().toISOString()
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const interruptPomodoroSession = async (sessionId: string, actualDuration: number, reason?: string) => {
  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .update({
      interrupted: true,
      actual_duration: actualDuration,
      interruption_reason: reason,
      completed_at: new Date().toISOString()
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const getRandomMessage = (messages: string[]): string => {
  return messages[Math.floor(Math.random() * messages.length)];
};
