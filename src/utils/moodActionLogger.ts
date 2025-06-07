
import { supabase } from '@/integrations/supabase/client';

export const logMoodAction = async (mood: string, actionTaken?: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to log mood actions');
  }

  const { data, error } = await supabase
    .from('mood_logs')
    .insert({
      user_id: user.id,
      mood: mood,
      action_taken: actionTaken
    })
    .select()
    .single();

  if (error) {
    console.error('Error logging mood action:', error);
    throw error;
  }

  return data;
};
