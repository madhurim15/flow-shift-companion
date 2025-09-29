import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface InterventionLevel {
  level: number;
  threshold: number; // seconds
  type: 'gentle' | 'concern' | 'stronger' | 'pattern';
  cooldown: number; // seconds between nudges at this level
}

export interface AppSession {
  packageName: string;
  appName: string;
  startTime: number;
  currentDuration: number;
  dismissalCount: number;
  lastInterventionTime: number;
  currentLevel: number;
  psychologicalState: 'seeking_stimulation' | 'avoidance' | 'emotional_regulation' | 'impulse_driven';
}

export interface InterventionMessage {
  title: string;
  message: string;
  alternatives: Array<{
    id: string;
    title: string;
    description: string;
    duration: string;
  }>;
}

// Hardcoded app thresholds and psychological states (no Supabase dependency)
const APP_CONFIGS = {
  'com.google.android.youtube': {
    thresholds: [15 * 60, 25 * 60, 35 * 60, 45 * 60], // 15, 25, 35, 45 minutes
    debugThresholds: [30, 60, 120, 180], // 30s, 1min, 2min, 3min for testing
    psychState: 'avoidance' as const,
    category: 'entertainment'
  },
  'com.instagram.android': {
    thresholds: [15 * 60, 25 * 60, 35 * 60, 45 * 60], // Updated to 15 minutes
    debugThresholds: [25, 45, 90, 150],
    psychState: 'seeking_stimulation' as const,
    category: 'social'
  },
  'com.zhiliaoapp.musically': { // TikTok
    thresholds: [8 * 60, 15 * 60, 25 * 60, 35 * 60],
    debugThresholds: [20, 40, 75, 120],
    psychState: 'avoidance' as const,
    category: 'social'
  },
  'com.facebook.katana': {
    thresholds: [12 * 60, 22 * 60, 32 * 60, 42 * 60],
    debugThresholds: [30, 55, 100, 140],
    psychState: 'emotional_regulation' as const,
    category: 'social'
  },
  'com.android.chrome': {
    thresholds: [20 * 60, 35 * 60, 50 * 60, 65 * 60],
    debugThresholds: [40, 70, 120, 180],
    psychState: 'seeking_stimulation' as const,
    category: 'browsing'
  },
  // Default for unknown apps
  'default': {
    thresholds: [15 * 60, 30 * 60, 45 * 60, 60 * 60],
    debugThresholds: [30, 60, 120, 180],
    psychState: 'seeking_stimulation' as const,
    category: 'other'
  }
};

// Progressive intervention messages based on level and dismissals
const getInterventionMessage = (
  psychState: string,
  level: number,
  dismissalCount: number,
  timeOfDay: number,
  appName: string
): InterventionMessage => {
  const isNightTime = timeOfDay > 22 || timeOfDay < 6;
  
  const messagesByLevel = {
    1: { // Gentle curiosity
      seeking_stimulation: {
        0: { title: "Just Checking In", message: "Your mind seems restless - what are you really looking for? 💙" },
        1: { title: "Still Here?", message: "No worries, just checking in. What's keeping you engaged? ✨" },
        2: { title: "Curious", message: "I notice you're staying with this - what's pulling you here? 🤔" }
      },
      avoidance: {
        0: { title: "Gentle Check", message: isNightTime ? "Late scrolling often means big feelings - want to check in? 🌙" : "Feeling overwhelmed? Want to try a 2-minute reset instead? 🌱" },
        1: { title: "Understanding", message: "When we scroll to avoid, our feelings are asking for attention 🤗" },
        2: { title: "It's OK", message: "This feels important to you. What would help right now? 💜" }
      },
      emotional_regulation: {
        0: { title: "Heart Check", message: "Your heart seems heavy. Want to check in with yourself? 💜" },
        1: { title: "Big Feelings", message: isNightTime ? "Night emotions can feel so big - you're not alone 🌙" : "Big feelings deserve gentle attention 🌸" },
        2: { title: "I See You", message: "What emotion is asking for your attention right now? 🌸" }
      },
      impulse_driven: {
        0: { title: "Pause Moment", message: "This impulse energy - let's pause and check in 💙" },
        1: { title: "What's Needed", message: "What if this urge is pointing to a real need? 💭" },
        2: { title: "Real Hunger", message: "What's the real hunger underneath this urge? 🌱" }
      }
    },
    2: { // Concern check-in
      seeking_stimulation: {
        0: { title: "How Are You?", message: "Feeling scattered? Sometimes our attention seeks what our heart needs 🌱" },
        1: { title: "Energy Check", message: "This scrolling energy - what if we channeled it into something creative? ✨" },
        2: { title: "Real Need", message: "If this app disappeared, what would you want to do instead? 🤔" }
      },
      avoidance: {
        0: { title: "Deeper Check", message: "What are you avoiding right now? Sometimes naming it helps 🌸" },
        1: { title: "Feeling Space", message: "What if we gave that feeling 2 minutes of kind attention instead? 💙" },
        2: { title: "Underneath", message: "If this feeling could speak, what would it say? 💭" }
      },
      emotional_regulation: {
        0: { title: "Emotional Check", message: "When emotions are intense, slowing down can help 🌱" },
        1: { title: "Color & Shape", message: "If you could give this feeling a color and shape, what would it be? 🎨" },
        2: { title: "Friend Advice", message: "What would you tell a friend feeling exactly this way? 🤗" }
      },
      impulse_driven: {
        0: { title: "Before Deciding", message: "Before acting on impulse, want to breathe together? 💨" },
        1: { title: "Real Satisfaction", message: "If money weren't involved, what would truly satisfy this need? ✨" },
        2: { title: "Impulse Check", message: "What feeling is this impulse trying to fill? 💭" }
      }
    },
    3: { // Stronger alternative
      seeking_stimulation: {
        0: { title: "Creative Alternative", message: "Your mind is active - how about a quick journal check-in instead? 📝" },
        1: { title: "Focus Reset", message: "Want to try a 2-minute creative break instead? 🎨" },
        2: { title: "True Satisfaction", message: "Take a breath - what would truly satisfy this need right now? ✨" }
      },
      avoidance: {
        0: { title: "Comfort Alternative", message: "When we avoid, we often need comfort. Want to journal what you're feeling? 📝" },
        1: { title: "Movement Help", message: "Sometimes movement helps when emotions feel stuck. Gentle stretch? 🧘‍♀️" },
        2: { title: "Kind Attention", message: "What's one small, kind thing you could do for yourself right now? ✨" }
      },
      emotional_regulation: {
        0: { title: "Movement Support", message: "When emotions are big, movement helps. Want to try a gentle stretch? 🧘‍♀️" },
        1: { title: "Friend to Self", message: "Sometimes talking to yourself like a friend helps. Want to try? 💙" },
        2: { title: "Breathe Together", message: "What if we breathed through this feeling together? 💨" }
      },
      impulse_driven: {
        0: { title: "Three Breaths", message: "Before you decide, want to take 3 deep breaths and ask what you really need? 💨" },
        1: { title: "Journal Instead", message: "Sometimes we buy when we need to feel something. Want to journal instead? 📝" },
        2: { title: "Mood Check First", message: "What if we tried a 2-minute mood check first? 💙" }
      }
    },
    4: { // Pattern recognition
      seeking_stimulation: {
        0: { title: "Pattern Recognition", message: `You've been on ${appName} for a while now. This pattern isn't serving your wellbeing. Let's break it together. 🌱` },
        1: { title: "Breaking Cycles", message: "I notice this has become a cycle. Your future self will thank you for pausing now. ✨" },
        2: { title: "Wellbeing Matters", message: "Your mental wellbeing matters more than this scroll. What would truly nourish you right now? 💙" }
      },
      avoidance: {
        0: { title: "Avoidance Pattern", message: "This scrolling pattern is protecting you from something difficult. That's human, but you're stronger than you know. 💜" },
        1: { title: "Courage to Feel", message: "Avoiding is exhausting. What if we faced this feeling with compassion? 🌸" },
        2: { title: "Breaking Free", message: "You deserve to feel free from this cycle. What small step would help right now? ✨" }
      },
      emotional_regulation: {
        0: { title: "Emotional Overflow", message: "Your emotions are overflowing into endless scrolling. You deserve better support than this. 💙" },
        1: { title: "Real Comfort", message: "This app can't give you the comfort your heart needs. What would? 🌱" },
        2: { title: "Worth More", message: "You're worth more than this endless cycle. How can we honor your feelings differently? 💜" }
      },
      impulse_driven: {
        0: { title: "Impulse Cycle", message: "This impulse pattern is running your life. You have the power to choose differently. 💪" },
        1: { title: "Breaking Chains", message: "These impulses are chains. What would freedom feel like? ✨" },
        2: { title: "Real Power", message: "Your real power is in the pause. What do you actually need right now? 🌱" }
      }
    }
  };

  const stateMessages = messagesByLevel[level as keyof typeof messagesByLevel]?.[psychState as keyof typeof messagesByLevel[1]] || messagesByLevel[1].seeking_stimulation;
  const messageData = stateMessages[Math.min(dismissalCount, 2) as keyof typeof stateMessages] || stateMessages[0];

  const alternatives = [
    { id: 'breathing', title: 'Breathe', description: '3 deep breaths', duration: '1 min' },
    { id: 'journal', title: 'Journal', description: 'Quick check-in', duration: '2 mins' },
    { id: 'mood_check', title: 'Mood Check', description: 'How am I feeling?', duration: '30 secs' },
    { id: 'walk', title: 'Move', description: 'Gentle movement', duration: '2 mins' }
  ];

  if (level >= 3) {
    alternatives.push({ id: 'snooze', title: 'Snooze 5min', description: 'Pause nudges', duration: '5 mins' });
  }

  return {
    title: messageData.title,
    message: messageData.message,
    alternatives
  };
};

export const useEnhancedInterventions = () => {
  const [currentSession, setCurrentSession] = useState<AppSession | null>(null);
  const [isShowingIntervention, setIsShowingIntervention] = useState(false);
  const [currentIntervention, setCurrentIntervention] = useState<InterventionMessage | null>(null);
  const { toast } = useToast();

  const isDebugMode = typeof window !== 'undefined' && (
    new URLSearchParams(window.location.search).get('debug') === '1' ||
    localStorage.getItem('debug-panel-enabled') === 'true'
  );

  // Get app configuration with debug support
  const getAppConfig = useCallback((packageName: string) => {
    const config = APP_CONFIGS[packageName as keyof typeof APP_CONFIGS] || APP_CONFIGS.default;
    return {
      ...config,
      thresholds: isDebugMode ? config.debugThresholds : config.thresholds
    };
  }, [isDebugMode]);

  // Start new session
  const startSession = useCallback((packageName: string, appName: string) => {
    const config = getAppConfig(packageName);
    const newSession: AppSession = {
      packageName,
      appName,
      startTime: Date.now(),
      currentDuration: 0,
      dismissalCount: 0,
      lastInterventionTime: 0,
      currentLevel: 0,
      psychologicalState: config.psychState
    };
    
    setCurrentSession(newSession);
    console.log(`[EnhancedInterventions] Started session for ${appName} (${packageName})`);
  }, [getAppConfig]);

  // Update session duration
  const updateSessionDuration = useCallback((packageName: string, duration: number) => {
    if (!currentSession || currentSession.packageName !== packageName) return;

    setCurrentSession(prev => prev ? { ...prev, currentDuration: duration } : null);
    
    // Check if we should trigger intervention
    const config = getAppConfig(packageName);
    const now = Date.now();
    
    // Find current level based on duration
    let newLevel = 0;
    for (let i = 0; i < config.thresholds.length; i++) {
      if (duration >= config.thresholds[i]) {
        newLevel = i + 1;
      }
    }

    if (newLevel > currentSession.currentLevel) {
      // Level up - check cooldown
      const timeSinceLastIntervention = now - currentSession.lastInterventionTime;
      const cooldownDuration = Math.max(60000, 300000 / (currentSession.dismissalCount + 1)); // 5min to 1min based on dismissals
      
      if (timeSinceLastIntervention > cooldownDuration) {
        triggerIntervention(newLevel);
      }
    }
  }, [currentSession, getAppConfig]);

  // Trigger intervention
  const triggerIntervention = useCallback((level: number) => {
    if (!currentSession || isShowingIntervention) return;

    const timeOfDay = new Date().getHours();
    const intervention = getInterventionMessage(
      currentSession.psychologicalState,
      level,
      currentSession.dismissalCount,
      timeOfDay,
      currentSession.appName
    );

    setCurrentIntervention(intervention);
    setIsShowingIntervention(true);
    
    setCurrentSession(prev => prev ? {
      ...prev,
      currentLevel: level,
      lastInterventionTime: Date.now()
    } : null);

    // Show toast notification
    toast({
      title: intervention.title,
      description: intervention.message,
      duration: 8000
    });

    console.log(`[EnhancedInterventions] Triggered level ${level} intervention:`, intervention.title);
  }, [currentSession, isShowingIntervention, toast]);

  // Handle intervention response
  const respondToIntervention = useCallback((response: 'dismissed' | 'accepted' | 'snoozed', alternativeId?: string) => {
    if (!currentSession) return;

    setIsShowingIntervention(false);
    setCurrentIntervention(null);

    if (response === 'dismissed') {
      // Increase dismissal count and reduce future cooldowns
      setCurrentSession(prev => prev ? {
        ...prev,
        dismissalCount: prev.dismissalCount + 1
      } : null);
      
      console.log(`[EnhancedInterventions] Intervention dismissed. Count: ${currentSession.dismissalCount + 1}`);
    } else if (response === 'snoozed') {
      // Snooze for 5 minutes
      setCurrentSession(prev => prev ? {
        ...prev,
        lastInterventionTime: Date.now() + (5 * 60 * 1000) // 5 minutes from now
      } : null);
      
      toast({
        title: "Snoozed",
        description: "Nudges paused for 5 minutes",
        duration: 3000
      });
    } else if (response === 'accepted') {
      // User engaged with alternative - reward with longer cooldown
      setCurrentSession(prev => prev ? {
        ...prev,
        dismissalCount: Math.max(0, prev.dismissalCount - 1), // Reduce dismissal count
        lastInterventionTime: Date.now() + (15 * 60 * 1000) // 15 minutes cooldown
      } : null);
      
      toast({
        title: "Great choice!",
        description: `Taking a moment for ${alternativeId} 🌱`,
        duration: 4000
      });
    }
  }, [currentSession, toast]);

  // End session
  const endSession = useCallback((packageName: string) => {
    if (currentSession && currentSession.packageName === packageName) {
      console.log(`[EnhancedInterventions] Ended session for ${currentSession.appName}`);
      setCurrentSession(null);
      setIsShowingIntervention(false);
      setCurrentIntervention(null);
    }
  }, [currentSession]);

  return {
    currentSession,
    isShowingIntervention,
    currentIntervention,
    startSession,
    updateSessionDuration,
    endSession,
    respondToIntervention,
    triggerIntervention,
    isDebugMode
  };
};