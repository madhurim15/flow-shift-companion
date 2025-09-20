import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSystemWideMonitoring } from './useSystemWideMonitoring';
import { detectBehavioralPattern, updateBehavioralPattern } from '@/utils/systemWideInterventionUtils';

interface DoomScrollingPattern {
  visitCount: number;
  lastVisit: number;
  totalTimeSpent: number;
  rapidReturns: number;
  lastInterventionTime: number;
  dailyInterventionCount: number;
  lastInterventionDate: string;
}

interface DoomScrollingDetectionResult {
  isLikelyDoomScrolling: boolean;
  shouldShowIntervention: boolean;
  pattern: DoomScrollingPattern;
  triggerIntervention: () => void;
  dismissIntervention: () => void;
  resetPattern: () => void;
}

const STORAGE_KEY = 'flowlight_doom_scrolling_pattern';
const INTERVENTION_COOLDOWN = 1 * 60 * 60 * 1000; // 1 hour (reduced from 2)
const RAPID_RETURN_THRESHOLD = 3 * 60 * 1000; // 3 minutes (reduced from 5)
const MIN_VISITS_FOR_DETECTION = 4; // Reduced from 8
const MIN_CONTINUOUS_TIME = 15 * 60 * 1000; // 15 minutes continuous usage
const MAX_INTERVENTIONS_PER_DAY = 4; // Increased from 2

export const useDoomScrollingDetection = (): DoomScrollingDetectionResult => {
  const { getBehavioralInsights, triggerIntervention: systemWideIntervention } = useSystemWideMonitoring();
  const [pattern, setPattern] = useState<DoomScrollingPattern>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const defaultPattern = {
      visitCount: 0,
      lastVisit: 0,
      totalTimeSpent: 0,
      rapidReturns: 0,
      lastInterventionTime: 0,
      dailyInterventionCount: 0,
      lastInterventionDate: new Date().toDateString()
    };
    
    if (stored) {
      const parsedPattern = JSON.parse(stored);
      // Reset daily count if it's a new day
      const today = new Date().toDateString();
      if (parsedPattern.lastInterventionDate !== today) {
        parsedPattern.dailyInterventionCount = 0;
        parsedPattern.lastInterventionDate = today;
      }
      return { ...defaultPattern, ...parsedPattern };
    }
    
    return defaultPattern;
  });

  const [sessionStartTime] = useState(Date.now());
  const [shouldShowIntervention, setShouldShowIntervention] = useState(false);
  const { toast } = useToast();

  // Track page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User left the tab - update session time
        const sessionTime = Date.now() - sessionStartTime;
        updatePattern(prev => ({
          ...prev,
          totalTimeSpent: prev.totalTimeSpent + sessionTime
        }));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [sessionStartTime]);

  // Track session on component mount
  useEffect(() => {
    const now = Date.now();
    const isRapidReturn = pattern.lastVisit > 0 && (now - pattern.lastVisit) < RAPID_RETURN_THRESHOLD;
    
    updatePattern(prev => ({
      ...prev,
      visitCount: prev.visitCount + 1,
      lastVisit: now,
      rapidReturns: isRapidReturn ? prev.rapidReturns + 1 : prev.rapidReturns
    }));
  }, []);

  const updatePattern = useCallback((updater: (prev: DoomScrollingPattern) => DoomScrollingPattern) => {
    setPattern(prev => {
      const updated = updater(prev);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Enhanced doom scrolling detection with time-based and system-wide monitoring
  const isLikelyDoomScrolling = useCallback(() => {
    // Local pattern detection (within FlowLight app)
    const localDetection = pattern.visitCount >= MIN_VISITS_FOR_DETECTION && 
      (pattern.rapidReturns >= 2 || pattern.visitCount >= 6);
    
    // Time-based detection (continuous usage)
    const continuousUsage = pattern.totalTimeSpent > MIN_CONTINUOUS_TIME;
    
    return localDetection || continuousUsage;
  }, [pattern]);

  const currentlyDoomScrolling = isLikelyDoomScrolling();

  // Enhanced intervention checking with system-wide monitoring
  useEffect(() => {
    const checkForSystemWideIntervention = async () => {
      const now = Date.now();
      const timeSinceLastIntervention = now - pattern.lastInterventionTime;
      const today = new Date().toDateString();
      
      // Check if we've hit daily limit
      if (pattern.lastInterventionDate === today && 
          pattern.dailyInterventionCount >= MAX_INTERVENTIONS_PER_DAY) {
        return;
      }
      
      if (currentlyDoomScrolling && 
          timeSinceLastIntervention > INTERVENTION_COOLDOWN && 
          !shouldShowIntervention) {
        
        // Get recent behavioral data from system-wide monitoring
        const recentSessions = await getBehavioralInsights(1); // Last day
        const detectedPattern = detectBehavioralPattern(recentSessions);
        
        // Update behavioral pattern if detected
        if (detectedPattern) {
          await updateBehavioralPattern(detectedPattern);
        }
        
        // Trigger psychology-first intervention
        await systemWideIntervention(
          'com.lovable.flowlight', // FlowLight app package
          'avoidance', // Doom scrolling is typically avoidance behavior
          'session_' + Date.now()
        );
        
        // Delay intervention slightly to not interrupt immediate navigation
        const timer = setTimeout(() => {
          setShouldShowIntervention(true);
        }, 2000); // Reduced from 3 seconds
        
        return () => clearTimeout(timer);
      }
    };

    checkForSystemWideIntervention();
  }, [currentlyDoomScrolling, pattern.lastInterventionTime, pattern.dailyInterventionCount, pattern.lastInterventionDate, shouldShowIntervention, getBehavioralInsights, systemWideIntervention]);

  const triggerIntervention = useCallback(() => {
    setShouldShowIntervention(true);
    updatePattern(prev => ({
      ...prev,
      lastInterventionTime: Date.now()
    }));
  }, [updatePattern]);

  const dismissIntervention = useCallback(() => {
    setShouldShowIntervention(false);
    const now = Date.now();
    const today = new Date().toDateString();
    
    updatePattern(prev => ({
      ...prev,
      lastInterventionTime: now,
      dailyInterventionCount: prev.lastInterventionDate === today 
        ? prev.dailyInterventionCount + 1 
        : 1,
      lastInterventionDate: today
    }));
  }, [updatePattern]);

  const resetPattern = useCallback(() => {
    const resetData: DoomScrollingPattern = {
      visitCount: 0,
      lastVisit: 0,
      totalTimeSpent: 0,
      rapidReturns: 0,
      lastInterventionTime: 0,
      dailyInterventionCount: 0,
      lastInterventionDate: new Date().toDateString()
    };
    setPattern(resetData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resetData));
    setShouldShowIntervention(false);
  }, []);

  // Auto-reset pattern daily
  useEffect(() => {
    const lastReset = localStorage.getItem('flowlight_last_pattern_reset');
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    if (!lastReset || parseInt(lastReset) < oneDayAgo) {
      resetPattern();
      localStorage.setItem('flowlight_last_pattern_reset', now.toString());
    }
  }, [resetPattern]);

  return {
    isLikelyDoomScrolling: currentlyDoomScrolling,
    shouldShowIntervention,
    pattern,
    triggerIntervention,
    dismissIntervention,
    resetPattern
  };
};