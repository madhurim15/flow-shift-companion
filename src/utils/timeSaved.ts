import { supabase } from '@/integrations/supabase/client';

interface TimeSavedResult {
  timeSavedThisWeek: number;
  timeSavedTotal: number;
  actionsThisWeek: number;
  actionsTotal: number;
}

const FALLBACK_DURATION_MINUTES = 2; // For actions without explicit duration

export const calculateTimeSaved = async (): Promise<TimeSavedResult> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return {
      timeSavedThisWeek: 0,
      timeSavedTotal: 0,
      actionsThisWeek: 0,
      actionsTotal: 0
    };
  }

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Fetch all nudge responses
  const { data: allResponses, error: allError } = await supabase
    .from('nudge_responses')
    .select('completed_duration, created_at')
    .eq('user_id', user.id);

  if (allError) {
    console.error('Error fetching nudge responses:', allError);
    return {
      timeSavedThisWeek: 0,
      timeSavedTotal: 0,
      actionsThisWeek: 0,
      actionsTotal: 0
    };
  }

  // Fetch this week's responses
  const { data: weekResponses, error: weekError } = await supabase
    .from('nudge_responses')
    .select('completed_duration, created_at')
    .eq('user_id', user.id)
    .gte('created_at', weekAgo.toISOString());

  if (weekError) {
    console.error('Error fetching week responses:', weekError);
  }

  // Calculate total time saved
  const calculateSeconds = (responses: any[]) => {
    return responses.reduce((total, response) => {
      if (response.completed_duration) {
        return total + response.completed_duration;
      }
      // Use fallback for actions without explicit duration
      return total + (FALLBACK_DURATION_MINUTES * 60);
    }, 0);
  };

  const totalSeconds = calculateSeconds(allResponses || []);
  const weekSeconds = calculateSeconds(weekResponses || []);

  return {
    timeSavedThisWeek: Math.round(weekSeconds / 60), // Convert to minutes
    timeSavedTotal: Math.round(totalSeconds / 60), // Convert to minutes
    actionsThisWeek: weekResponses?.length || 0,
    actionsTotal: allResponses?.length || 0
  };
};

export const formatTimeSaved = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hr${hours > 1 ? 's' : ''}`;
  }
  return `${hours} hr${hours > 1 ? 's' : ''} ${remainingMinutes} min`;
};
