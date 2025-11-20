import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { SystemMonitoring } from '@/plugins/system-monitoring';
import { useEnhancedInterventions } from './useEnhancedInterventions';

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

  const { 
    startSession, 
    updateSessionDuration, 
    endSession,
    isDebugMode 
  } = useEnhancedInterventions();

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

  // Legacy method - now handled by enhanced interventions
  const startAppSession = useCallback((appPackage: string, appName?: string) => {
    // This is now handled by the enhanced intervention system
    return null;
  }, []);

  // Legacy method - now handled by enhanced interventions
  const endAppSession = useCallback((appPackage: string) => {
    // This is now handled by the enhanced intervention system
  }, []);

  // Legacy method - now handled by enhanced interventions
  const checkForIntervention = useCallback(() => {
    // This is now handled by the enhanced intervention system
  }, []);

  // Legacy method - now handled by enhanced interventions
  const triggerIntervention = useCallback(() => {
    // This is now handled by the enhanced intervention system
  }, []);

  // Legacy method - now handled by enhanced interventions
  const respondToIntervention = useCallback(() => {
    // This is now handled by the enhanced intervention system
  }, []);

  // Legacy method - now handled by enhanced interventions
  const getBehavioralInsights = useCallback(() => {
    // This is now handled by the enhanced intervention system
    return [];
  }, []);

  // Initialize monitoring (would integrate with native app monitoring APIs)
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // In a real implementation, this would set up native app usage monitoring
      setState(prev => ({ ...prev, isMonitoring: true }));
    }
  }, []);

  // Listen to SystemMonitoring events (MonitoringBootstrap handles initialization)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let appChangeListener: { remove: () => void } | undefined;
    let durationListener: { remove: () => void } | undefined;

    (async () => {
      try {
        // Wait for MonitoringBootstrap to initialize SystemMonitoring first
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('[useSystemWideMonitoring] Adding event listeners (MonitoringBootstrap handles initialization)');

        // Only add listeners - DON'T call requestPermissions or startMonitoring
        appChangeListener = await SystemMonitoring.addListener('appChanged', async ({ package: pkg, appName }) => {
          try {
            console.log(`[SystemWideMonitoring] App changed to: ${appName} (${pkg})`);
            
            // End previous session
            if (state.currentSession?.app_package_name && state.currentSession.app_package_name !== pkg) {
              endSession(state.currentSession.app_package_name);
            }
            
            // Start new session
            startSession(pkg, appName || 'Unknown App');
            
            setState(prev => ({
              ...prev,
              currentSession: {
                app_package_name: pkg,
                app_name: appName,
                session_start: new Date()
              }
            }));
          } catch (e) {
            console.error('Error handling appChanged event', e);
          }
        });

        // Listen for duration updates
        durationListener = await SystemMonitoring.addListener('durationUpdate', async ({ package: pkg, appName, durationSeconds }) => {
          try {
            console.log(`[SystemWideMonitoring] Duration update: ${appName} - ${durationSeconds}s`);
            
            // Update session duration for intervention logic
            updateSessionDuration(pkg, durationSeconds);
            
            // Update daily stats
            setState(prev => ({
              ...prev,
              dailyUsageStats: {
                ...prev.dailyUsageStats,
                [pkg]: durationSeconds
              }
            }));
          } catch (e) {
            console.error('Error handling durationUpdate event', e);
          }
        });

        setState(prev => ({ ...prev, isMonitoring: true }));

      } catch (e) {
        console.error('SystemMonitoring listener setup failed', e);
        setState(prev => ({ ...prev, isMonitoring: false }));
      }
    })();

    return () => {
      try { appChangeListener?.remove(); } catch {}
      try { durationListener?.remove(); } catch {}
      // Don't call stopMonitoring() here - let MonitoringBootstrap control it
    };
  }, []); // Empty dependencies - run once only

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