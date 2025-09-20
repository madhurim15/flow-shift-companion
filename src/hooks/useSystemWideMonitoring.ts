import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useLocalNotifications } from './useLocalNotifications';

export interface AppUsageSession {
  id?: string;
  app_package_name: string;
  app_name?: string;
  app_category?: string;
  session_start: Date;
  session_end?: Date;
  duration_seconds?: number;
  psychological_state?: 'seeking_stimulation' | 'avoidance' | 'emotional_regulation' | 'impulse_driven';
  intervention_triggered?: boolean;
}

export interface PsychologicalIntervention {
  id?: string;
  app_package_name: string;
  detected_state: string;
  intervention_type: 'gentle_nudge' | 'alternative_offer' | 'reflection_prompt';
  intervention_message: string;
  user_response?: 'dismissed' | 'accepted_alternative' | 'reflected';
  alternative_chosen?: 'mood_check' | 'journal' | 'breathing' | 'physical_break';
  effectiveness_rating?: number;
}

export interface BehavioralPattern {
  id?: string;
  pattern_type: 'rapid_switching' | 'endless_scrolling' | 'late_night_usage' | 'impulse_shopping';
  detected_frequency: number;
  last_detected: Date;
  improvement_trend?: number;
  successful_interventions: number;
}

interface SystemWideMonitoringState {
  isMonitoring: boolean;
  currentSession?: AppUsageSession;
  dailyUsageStats: Record<string, number>;
  activeInterventions: PsychologicalIntervention[];
  detectedPatterns: BehavioralPattern[];
  interventionCooldowns: Record<string, number>;
}

export const useSystemWideMonitoring = () => {
  const [state, setState] = useState<SystemWideMonitoringState>({
    isMonitoring: false,
    dailyUsageStats: {},
    activeInterventions: [],
    detectedPatterns: [],
    interventionCooldowns: {}
  });

  const { scheduleHighPriorityReminder } = useLocalNotifications();

  // Psychology-first intervention messages
  const interventionMessages = {
    seeking_stimulation: {
      gentle_nudge: "Your mind seems restless - what are you really looking for? 💙",
      alternative_offer: "Feeling understimulated? Want to try a 2-minute creative break instead? 🎨",
      reflection_prompt: "Take a breath - what would truly satisfy this need right now? ✨"
    },
    avoidance: {
      gentle_nudge: "Feeling overwhelmed? Want to try a 2-minute reset instead? 🌱", 
      alternative_offer: "When we avoid, we often need comfort. Want to journal what you're feeling? 📝",
      reflection_prompt: "What are you avoiding right now? Sometimes naming it helps. 🤗"
    },
    emotional_regulation: {
      gentle_nudge: "Your heart seems heavy. Want to check in with yourself? 💜",
      alternative_offer: "When emotions are big, movement helps. Want to try a gentle stretch? 🧘‍♀️",
      reflection_prompt: "What emotion is asking for your attention right now? 🌸"
    },
    impulse_driven: {
      gentle_nudge: "Shopping at night often means we need comfort - want to journal instead? ✨",
      alternative_offer: "Before you buy, want to take 3 deep breaths and ask what you really need? 💨",
      reflection_prompt: "What feeling is this purchase trying to fill? 💭"
    }
  };

  // App category detection logic
  const detectPsychologicalState = useCallback((appPackage: string, usageDuration: number, timeOfDay: number): string => {
    // Instagram, TikTok, Facebook - seeking stimulation or avoidance
    if (['com.instagram.android', 'com.zhiliaoapp.musically', 'com.facebook.katana'].includes(appPackage)) {
      if (timeOfDay > 22 || timeOfDay < 6) return 'emotional_regulation';
      if (usageDuration > 900) return 'avoidance'; // 15+ minutes
      return 'seeking_stimulation';
    }
    
    // YouTube - avoidance or emotional regulation
    if (appPackage === 'com.google.android.youtube') {
      if (timeOfDay > 23 || timeOfDay < 7) return 'emotional_regulation';
      if (usageDuration > 1200) return 'avoidance'; // 20+ minutes
      return 'seeking_stimulation';
    }
    
    // Shopping apps - impulse driven
    if (appPackage.includes('shop') || appPackage.includes('amazon') || appPackage.includes('ebay')) {
      if (timeOfDay > 20) return 'impulse_driven';
      return 'emotional_regulation';
    }

    // Chrome/browsers - seeking stimulation or avoidance
    if (appPackage === 'com.android.chrome' || appPackage.includes('browser')) {
      if (usageDuration > 1800) return 'avoidance'; // 30+ minutes
      return 'seeking_stimulation';
    }

    return 'seeking_stimulation';
  }, []);

  // Track app usage session
  const startAppSession = useCallback(async (appPackage: string, appName?: string) => {
    if (!Capacitor.isNativePlatform()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const sessionStart = new Date();
    const session: AppUsageSession = {
      app_package_name: appPackage,
      app_name: appName,
      session_start: sessionStart
    };

    setState(prev => ({ ...prev, currentSession: session }));

    // Get app category and threshold from database
    const { data: appCategory } = await supabase
      .from('app_categories')
      .select('*')
      .eq('app_package_name', appPackage)
      .single();

    if (appCategory) {
      session.app_category = appCategory.category;
    }

    return session;
  }, []);

  // End app usage session and analyze for interventions
  const endAppSession = useCallback(async (appPackage: string) => {
    if (!state.currentSession || state.currentSession.app_package_name !== appPackage) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const sessionEnd = new Date();
    const duration = Math.floor((sessionEnd.getTime() - state.currentSession.session_start.getTime()) / 1000);
    const timeOfDay = sessionEnd.getHours();

    // Detect psychological state
    const psychState = detectPsychologicalState(appPackage, duration, timeOfDay);
    
    // Save session to database
    const { data: sessionData, error } = await supabase
      .from('app_usage_sessions')
      .insert({
        user_id: user.id,
        app_package_name: appPackage,
        app_name: state.currentSession.app_name,
        app_category: state.currentSession.app_category,
        session_start: state.currentSession.session_start.toISOString(),
        session_end: sessionEnd.toISOString(),
        duration_seconds: duration,
        psychological_state: psychState,
        intervention_triggered: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving app session:', error);
      return;
    }

    // Check if intervention should be triggered
    await checkForIntervention(appPackage, duration, psychState, sessionData.id);

    setState(prev => ({ 
      ...prev, 
      currentSession: undefined,
      dailyUsageStats: {
        ...prev.dailyUsageStats,
        [appPackage]: (prev.dailyUsageStats[appPackage] || 0) + duration
      }
    }));
  }, [state.currentSession, detectPsychologicalState]);

  // Check if intervention should be triggered
  const checkForIntervention = useCallback(async (
    appPackage: string, 
    duration: number, 
    psychState: string,
    sessionId: string
  ) => {
    // Check cooldown
    const now = Date.now();
    const lastIntervention = state.interventionCooldowns[appPackage] || 0;
    const cooldownPeriod = 2 * 60 * 60 * 1000; // 2 hours

    if (now - lastIntervention < cooldownPeriod) return;

    // Get app thresholds
    const { data: appCategory } = await supabase
      .from('app_categories')
      .select('*')
      .eq('app_package_name', appPackage)
      .single();

    const threshold = appCategory?.mindful_threshold_minutes * 60 || 15 * 60; // default 15 minutes

    if (duration >= threshold) {
      await triggerIntervention(appPackage, psychState, sessionId);
    }
  }, [state.interventionCooldowns]);

  // Trigger psychology-first intervention
  const triggerIntervention = useCallback(async (
    appPackage: string, 
    psychState: string,
    sessionId: string
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Select intervention type and message
    const interventionType = Math.random() < 0.5 ? 'gentle_nudge' : 'alternative_offer';
    const messages = interventionMessages[psychState as keyof typeof interventionMessages] || interventionMessages.seeking_stimulation;
    const message = messages[interventionType as keyof typeof messages];

    // Create intervention record
    const { data: intervention } = await supabase
      .from('psychological_interventions')
      .insert({
        user_id: user.id,
        app_package_name: appPackage,
        detected_state: psychState,
        intervention_type: interventionType,
        intervention_message: message
      })
      .select()
      .single();

    // Mark session as intervention triggered
    await supabase
      .from('app_usage_sessions')
      .update({ intervention_triggered: true })
      .eq('id', sessionId);

    // Send notification
    await scheduleHighPriorityReminder(
      "FlowLight Gentle Nudge",
      message,
      0
    );

    // Update state
    if (intervention) {
      setState(prev => ({
        ...prev,
        activeInterventions: [...prev.activeInterventions, intervention as PsychologicalIntervention],
        interventionCooldowns: {
          ...prev.interventionCooldowns,
          [appPackage]: Date.now()
        }
      }));
    }
  }, [interventionMessages, scheduleHighPriorityReminder]);

  // Respond to intervention
  const respondToIntervention = useCallback(async (
    interventionId: string,
    response: 'dismissed' | 'accepted_alternative' | 'reflected',
    alternative?: 'mood_check' | 'journal' | 'breathing' | 'physical_break'
  ) => {
    const { error } = await supabase
      .from('psychological_interventions')
      .update({
        user_response: response,
        alternative_chosen: alternative
      })
      .eq('id', interventionId);

    if (error) {
      console.error('Error updating intervention response:', error);
      return;
    }

    // Remove from active interventions
    setState(prev => ({
      ...prev,
      activeInterventions: prev.activeInterventions.filter(i => i.id !== interventionId)
    }));

    // If user accepted alternative, redirect them to FlowLight
    if (response === 'accepted_alternative' && alternative) {
      // This would trigger the appropriate FlowLight feature
      return { redirectTo: alternative };
    }
  }, []);

  // Get behavioral insights
  const getBehavioralInsights = useCallback(async (days: number = 7) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: sessions } = await supabase
      .from('app_usage_sessions')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    return sessions || [];
  }, []);

  // Initialize monitoring (would integrate with native app monitoring APIs)
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // In a real implementation, this would set up native app usage monitoring
      setState(prev => ({ ...prev, isMonitoring: true }));
    }
  }, []);

  return {
    ...state,
    startAppSession,
    endAppSession,
    triggerIntervention,
    respondToIntervention,
    getBehavioralInsights,
    detectPsychologicalState
  };
};