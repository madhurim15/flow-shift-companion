import { supabase } from '@/integrations/supabase/client';

export type PsychologicalState = 'seeking_stimulation' | 'avoidance' | 'emotional_regulation' | 'impulse_driven';
export type InterventionType = 'gentle_nudge' | 'alternative_offer' | 'reflection_prompt';
export type AlternativeAction = 'mood_check' | 'journal' | 'breathing' | 'physical_break' | 'gratitude' | 'walk';

export interface InterventionData {
  id?: string;
  user_id: string;
  app_package_name: string;
  detected_state: PsychologicalState;
  intervention_type: InterventionType;
  intervention_message: string;
  user_response?: 'dismissed' | 'accepted_alternative' | 'reflected';
  alternative_chosen?: AlternativeAction;
  effectiveness_rating?: number;
}

// Psychology-first intervention messages based on detected state and context
export const getInterventionMessage = (
  state: PsychologicalState, 
  type: InterventionType, 
  appName?: string, 
  timeOfDay?: number,
  durationMinutes?: number,
  dismissalCount?: number
): string => {
  // Add behavior context if available
  const behaviorContext = durationMinutes 
    ? `You've been using ${appName || 'this app'} for ${durationMinutes} minute${durationMinutes === 1 ? '' : 's'}. `
    : '';

  // Adjust tone based on dismissal count (progressive accountability)
  const toneLevel = dismissalCount || 0;

  const messages: Record<PsychologicalState, Record<InterventionType, string[]>> = {
    seeking_stimulation: {
      gentle_nudge: [
        `${behaviorContext}Your mind is restless - but endless scrolling won't give you what you're really seeking. What would truly satisfy this need? 💙`,
        `${behaviorContext}I see you searching for something. What if we paused for just a moment? 🌱`
      ],
      alternative_offer: [
        `${behaviorContext}Your mind seems restless tonight 🌙 What are you really looking for?`,
        `${behaviorContext}Scrolling endlessly won't get you anywhere in life. You have goals to accomplish, real life to live, not reel life 💪`
      ],
      reflection_prompt: [
        `${behaviorContext}What's driving this need for stimulation right now? 🤔`,
        `${behaviorContext}I care about you too much to let this continue. This pattern isn't serving your best self. Let's break it together 🌱`
      ]
    },
    avoidance: {
      gentle_nudge: [
        `${behaviorContext}What are you avoiding right now? Sometimes facing it for just 2 minutes helps more than hours of distraction 🌱`,
        `${behaviorContext}I see you, friend. Running to this app again? 💙`
      ],
      alternative_offer: [
        `${behaviorContext}You've been here before. What's really going on? 🤔`,
        `${behaviorContext}Scrolling endlessly won't solve what you're avoiding. Your future self needs you to choose differently right now 💜`
      ],
      reflection_prompt: [
        `${behaviorContext}This pattern of avoidance - is it helping or just postponing? 💭`,
        `${behaviorContext}I care about you too much to stay quiet. What are you really running from? 🌱`
      ]
    },
    emotional_regulation: {
      gentle_nudge: [
        `${behaviorContext}Automatic habit triggered again? Let's pause 🌱`,
        `${behaviorContext}You're in the loop. Time to break free 💙`
      ],
      alternative_offer: [
        `${behaviorContext}This is becoming a pattern. What would it feel like to choose something different? 💭`,
        `${behaviorContext}Real life is waiting for you, not reel life. You have the power to choose differently 💪`
      ],
      reflection_prompt: [
        `${behaviorContext}What triggered this automatic reach for your phone? 🤔`,
        `${behaviorContext}I notice this pattern keeps repeating. Your best self is calling - will you answer? 🌟`
      ]
    },
    impulse_driven: {
      gentle_nudge: [
        `${behaviorContext}Quick impulse check - do you really need this right now? 💙`,
        `${behaviorContext}Pause. What's the real need underneath this impulse? 🌱`
      ],
      alternative_offer: [
        `${behaviorContext}Scrolling endlessly won't fulfill the real need underneath. What do you actually need - connection, comfort, validation? Let's name it 💜`,
        `${behaviorContext}This impulse won't serve your goals. Your future self is counting on you 💪`
      ],
      reflection_prompt: [
        `${behaviorContext}What would truly satisfy you more than this impulse? 🤔`,
        `${behaviorContext}I care about your wellbeing. Is this impulse aligned with who you want to be? 🌟`
      ]
    }
  };

  const stateMessages = messages[state];
  const typeMessages = stateMessages[type];
  
  // Use tone level to select message (0-1 = gentle, 2+ = firmer)
  const messageIndex = Math.min(toneLevel, typeMessages.length - 1);
  return typeMessages[messageIndex];
};

// Get suggested alternatives based on psychological state and time
export const getSuggestedAlternatives = (
  state: PsychologicalState,
  timeOfDay?: number
): { action: AlternativeAction; title: string; description: string; duration: string }[] => {
  const isNightTime = timeOfDay ? (timeOfDay > 22 || timeOfDay < 6) : false;
  const isEarlyMorning = timeOfDay ? (timeOfDay >= 6 && timeOfDay < 9) : false;

  const baseAlternatives = {
    seeking_stimulation: [
      { action: 'journal' as AlternativeAction, title: 'Quick Check-in', description: 'What am I really looking for?', duration: '2 mins' },
      { action: 'breathing' as AlternativeAction, title: 'Reset Breath', description: 'Calm the mental chatter', duration: '1 min' },
      { action: 'mood_check' as AlternativeAction, title: 'Mood Pulse', description: 'How am I actually feeling?', duration: '30 secs' }
    ],
    avoidance: [
      { action: 'journal' as AlternativeAction, title: 'Gentle Naming', description: 'What am I avoiding?', duration: '3 mins' },
      { action: 'breathing' as AlternativeAction, title: 'Comfort Breathing', description: 'Breathe through the discomfort', duration: '2 mins' },
      { action: 'mood_check' as AlternativeAction, title: 'Feeling Check', description: 'Name the emotion kindly', duration: '1 min' }
    ],
    emotional_regulation: [
      { action: 'breathing' as AlternativeAction, title: 'Emotional Breathing', description: 'Breathe with the feeling', duration: '3 mins' },
      { action: 'journal' as AlternativeAction, title: 'Feeling Journal', description: 'Give emotions space on paper', duration: '5 mins' },
      { action: 'mood_check' as AlternativeAction, title: 'Heart Check-in', description: 'How is my heart right now?', duration: '1 min' }
    ],
    impulse_driven: [
      { action: 'breathing' as AlternativeAction, title: 'Pause & Breathe', description: 'Three deep breaths first', duration: '1 min' },
      { action: 'journal' as AlternativeAction, title: 'Real Need Check', description: 'What do I actually need?', duration: '3 mins' },
      { action: 'mood_check' as AlternativeAction, title: 'Impulse Check', description: 'What feeling is driving this?', duration: '2 mins' }
    ]
  };

  let alternatives = baseAlternatives[state];

  // Add time-specific alternatives
  if (isNightTime) {
    alternatives.push({ 
      action: 'gratitude' as AlternativeAction, 
      title: 'Bedtime Gratitude', 
      description: 'End with something beautiful', 
      duration: '2 mins' 
    });
  }

  if (isEarlyMorning) {
    alternatives.push({ 
      action: 'walk' as AlternativeAction, 
      title: 'Morning Movement', 
      description: 'Gentle start to the day', 
      duration: '5 mins' 
    });
  }

  return alternatives;
};

// Log intervention response
export const logInterventionResponse = async (data: Omit<InterventionData, 'user_id'>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: response, error } = await supabase
    .from('psychological_interventions')
    .insert({
      user_id: user.id,
      ...data
    })
    .select()
    .single();

  if (error) throw error;
  return response;
};

// Update intervention with user response
export const updateInterventionResponse = async (
  interventionId: string,
  response: 'dismissed' | 'accepted_alternative' | 'reflected',
  alternative?: AlternativeAction,
  effectivenessRating?: number
) => {
  const { data, error } = await supabase
    .from('psychological_interventions')
    .update({
      user_response: response,
      alternative_chosen: alternative,
      effectiveness_rating: effectivenessRating
    })
    .eq('id', interventionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get user's intervention effectiveness insights
export const getInterventionInsights = async (days: number = 30) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('psychological_interventions')
    .select('*')
    .eq('user_id', user.id)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Detect behavioral patterns
export const detectBehavioralPattern = (
  sessions: any[],
  timeWindow: number = 24 * 60 * 60 * 1000 // 24 hours
): 'rapid_switching' | 'endless_scrolling' | 'late_night_usage' | 'impulse_shopping' | null => {
  if (!sessions.length) return null;

  const now = Date.now();
  const recentSessions = sessions.filter(s => 
    now - new Date(s.created_at).getTime() < timeWindow
  );

  // Detect rapid app switching (3+ different apps in 30 minutes)
  const thirtyMinutesAgo = now - (30 * 60 * 1000);
  const recentApps = new Set(
    recentSessions
      .filter(s => new Date(s.created_at).getTime() > thirtyMinutesAgo)
      .map(s => s.app_package_name)
  );

  if (recentApps.size >= 3) return 'rapid_switching';

  // Detect endless scrolling (single app usage > 45 minutes)
  const longSession = recentSessions.find(s => 
    s.duration_seconds && s.duration_seconds > 45 * 60 &&
    ['social', 'entertainment'].includes(s.app_category)
  );

  if (longSession) return 'endless_scrolling';

  // Detect late night usage (after 11 PM)
  const lateNightSession = recentSessions.find(s => {
    const hour = new Date(s.session_start).getHours();
    return hour >= 23 || hour < 6;
  });

  if (lateNightSession) return 'late_night_usage';

  // Detect impulse shopping (multiple shopping apps in short time)
  const shoppingSessions = recentSessions.filter(s => 
    s.app_category === 'shopping'
  );

  if (shoppingSessions.length >= 2) return 'impulse_shopping';

  return null;
};

// Update behavioral pattern in database
export const updateBehavioralPattern = async (
  patternType: 'rapid_switching' | 'endless_scrolling' | 'late_night_usage' | 'impulse_shopping',
  successful = false
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: existing } = await supabase
    .from('behavioral_patterns')
    .select('*')
    .eq('user_id', user.id)
    .eq('pattern_type', patternType)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from('behavioral_patterns')
      .update({
        detected_frequency: existing.detected_frequency + 1,
        last_detected: new Date().toISOString(),
        successful_interventions: successful 
          ? existing.successful_interventions + 1 
          : existing.successful_interventions
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('behavioral_patterns')
      .insert({
        user_id: user.id,
        pattern_type: patternType,
        detected_frequency: 1,
        last_detected: new Date().toISOString(),
        successful_interventions: successful ? 1 : 0
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};