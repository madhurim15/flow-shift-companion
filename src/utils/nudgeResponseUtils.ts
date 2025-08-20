import { supabase } from '@/integrations/supabase/client';
import type { ReminderType } from '@/utils/reminderUtils';
import type { NudgeResponseType } from '@/data/nudgeResponses';

export interface NudgeResponseData {
  id?: string;
  user_id: string;
  reminder_type: ReminderType;
  response_type: NudgeResponseType;
  response_data?: any;
  completed_duration?: number;
  effectiveness_rating?: number;
}

export const logNudgeResponse = async (data: Omit<NudgeResponseData, 'user_id'>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: response, error } = await supabase
    .from('nudge_responses')
    .insert({
      user_id: user.id,
      ...data
    })
    .select()
    .single();

  if (error) throw error;
  return response;
};

export const updateNudgeResponse = async (
  responseId: string, 
  updates: Partial<Pick<NudgeResponseData, 'completed_duration' | 'effectiveness_rating' | 'response_data'>>
) => {
  const { data, error } = await supabase
    .from('nudge_responses')
    .update(updates)
    .eq('id', responseId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserNudgeResponseStats = async (days: number = 30) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('nudge_responses')
    .select('*')
    .eq('user_id', user.id)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getMostPreferredResponses = async (reminderType?: ReminderType) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  let query = supabase
    .from('nudge_responses')
    .select('response_type, reminder_type')
    .eq('user_id', user.id);

  if (reminderType) {
    query = query.eq('reminder_type', reminderType);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Count frequency of each response type
  const responseFrequency: Record<string, number> = {};
  data.forEach(item => {
    const key = reminderType ? item.response_type : `${item.reminder_type}_${item.response_type}`;
    responseFrequency[key] = (responseFrequency[key] || 0) + 1;
  });

  // Sort by frequency and return top responses
  return Object.entries(responseFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
};