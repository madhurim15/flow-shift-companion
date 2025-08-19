import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

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
const INTERVENTION_COOLDOWN = 2 * 60 * 60 * 1000; // 2 hours
const RAPID_RETURN_THRESHOLD = 5 * 60 * 1000; // 5 minutes
const MIN_VISITS_FOR_DETECTION = 8;
const MAX_INTERVENTIONS_PER_DAY = 2;

export const useDoomScrollingDetection = (): DoomScrollingDetectionResult => {
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

  // Determine if user is likely doom scrolling
  const isLikelyDoomScrolling = pattern.visitCount >= MIN_VISITS_FOR_DETECTION && 
    (pattern.rapidReturns >= 3 || pattern.visitCount >= 10);

  // Check if we should show intervention
  useEffect(() => {
    const now = Date.now();
    const timeSinceLastIntervention = now - pattern.lastInterventionTime;
    const today = new Date().toDateString();
    
    // Check if we've hit daily limit
    if (pattern.lastInterventionDate === today && 
        pattern.dailyInterventionCount >= MAX_INTERVENTIONS_PER_DAY) {
      return;
    }
    
    if (isLikelyDoomScrolling && 
        timeSinceLastIntervention > INTERVENTION_COOLDOWN && 
        !shouldShowIntervention) {
      
      // Delay intervention slightly to not interrupt immediate navigation
      const timer = setTimeout(() => {
        setShouldShowIntervention(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isLikelyDoomScrolling, pattern.lastInterventionTime, pattern.dailyInterventionCount, pattern.lastInterventionDate, shouldShowIntervention]);

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
    isLikelyDoomScrolling,
    shouldShowIntervention,
    pattern,
    triggerIntervention,
    dismissIntervention,
    resetPattern
  };
};