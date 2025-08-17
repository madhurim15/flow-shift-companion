import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { diceActions } from "@/data/diceActions";
import { moodActionsData } from "@/data/moodActions";

export interface DiceSystemResult {
  success: boolean;
  error?: string;
  dice_roll_id?: string;
  remaining_rolls?: number;
  cooldown_expires_at?: string;
  next_reset?: string;
}

export interface CompletionResult {
  success: boolean;
  completion_type: 'small' | 'medium' | 'big';
  current_streak: number;
  best_streak: number;
  is_new_best: boolean;
}

export interface UseDiceSystemReturn {
  requestDiceRoll: (mood: string) => Promise<{ result: DiceSystemResult; action: string }>;
  completeAction: (diceRollId: string, plannedDuration: number, actualDuration: number) => Promise<CompletionResult>;
  getDiceSystemStatus: () => Promise<DiceSystemResult>;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

export const useDiceSystem = (): UseDiceSystemReturn => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('dice-sound-enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const getActionForMood = useCallback((mood: string): string => {
    const normalizedMood = mood.trim().toLowerCase();
    
    // Check dice actions first (for stuck/overwhelmed)
    if (normalizedMood === "stuck" || normalizedMood === "overwhelmed") {
      const actions = diceActions[normalizedMood];
      if (actions && actions.length > 0) {
        const randomIndex = Math.floor(Math.random() * Math.min(6, actions.length));
        return actions[randomIndex];
      }
    }
    
    // Fallback to mood actions data
    const moodActions = moodActionsData[mood as keyof typeof moodActionsData] || [];
    const actionsArray = Array.isArray(moodActions) ? moodActions : [];
    
    if (actionsArray.length > 0) {
      const randomIndex = Math.floor(Math.random() * Math.min(6, actionsArray.length));
      return actionsArray[randomIndex];
    }
    
    // Final fallback
    return "Take a deep breath and try a tiny first step.";
  }, []);

  const requestDiceRoll = useCallback(async (mood: string) => {
    const action = getActionForMood(mood);
    
    try {
      const { data, error } = await supabase.rpc('request_dice_roll', {
        p_mood: mood,
        p_action: action
      });

      if (error) {
        console.error('Dice roll request error:', error);
        toast({
          title: "Error",
          description: "Failed to request dice roll. Please try again.",
          variant: "destructive"
        });
        return { 
          result: { success: false, error: error.message }, 
          action 
        };
      }

      const result = data as unknown as DiceSystemResult;
      
      if (!result.success) {
        if (result.error === 'Daily limit reached') {
          toast({
            title: "Daily Limit Reached",
            description: `You've used all 3 dice rolls today. Resets tomorrow!`,
            variant: "destructive"
          });
        } else if (result.error === 'Cooldown active') {
          const expiresAt = new Date(result.cooldown_expires_at!);
          const remainingMinutes = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60));
          toast({
            title: "Cooldown Active",
            description: `Please wait ${remainingMinutes} minutes before your next roll.`,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Dice Rolled!",
          description: `${result.remaining_rolls} rolls remaining today.`
        });
      }

      return { result, action };
    } catch (error) {
      console.error('Dice roll request failed:', error);
      toast({
        title: "Error",
        description: "Failed to request dice roll. Please try again.",
        variant: "destructive"
      });
      return { 
        result: { success: false, error: "Network error" }, 
        action 
      };
    }
  }, [getActionForMood]);

  const completeAction = useCallback(async (
    diceRollId: string, 
    plannedDuration: number, 
    actualDuration: number
  ): Promise<CompletionResult> => {
    try {
      const { data, error } = await supabase.rpc('complete_action', {
        p_dice_roll_id: diceRollId,
        p_planned_duration: plannedDuration,
        p_actual_duration: actualDuration
      });

      if (error) {
        console.error('Action completion error:', error);
        toast({
          title: "Error",
          description: "Failed to record completion. Your progress wasn't saved.",
          variant: "destructive"
        });
        throw error;
      }

      const result = data as unknown as CompletionResult;
      
      toast({
        title: "Action Completed!",
        description: `Streak: ${result.current_streak} days ${result.is_new_best ? '🎉 New best!' : ''}`,
      });

      return result;
    } catch (error) {
      console.error('Action completion failed:', error);
      throw error;
    }
  }, []);

  const getDiceSystemStatus = useCallback(async (): Promise<DiceSystemResult> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, error: "User not authenticated" };
      }

      // Get today's roll count with proper timezone handling
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

      const { data: rollData, error: rollError } = await supabase
        .from('dice_roll_usage')
        .select('created_at, cooldown_expires_at')
        .eq('user_id', user.user.id)
        .gte('created_at', todayStart.toISOString())
        .lt('created_at', todayEnd.toISOString())
        .order('created_at', { ascending: false });

      if (rollError) {
        console.error('Roll data fetch error:', rollError);
        return { success: false, error: rollError.message };
      }

      const todayRolls = rollData?.length || 0;
      const remainingRolls = Math.max(0, 3 - todayRolls);

      console.log('Dice system status:', { todayRolls, remainingRolls, rollData });

      // Check cooldown
      const lastRoll = rollData?.[0];
      if (lastRoll && lastRoll.cooldown_expires_at) {
        const cooldownExpires = new Date(lastRoll.cooldown_expires_at);
        if (cooldownExpires > new Date()) {
          return {
            success: false,
            error: 'Cooldown active',
            cooldown_expires_at: lastRoll.cooldown_expires_at,
            remaining_rolls: remainingRolls
          };
        }
      }

      return {
        success: true,
        remaining_rolls: remainingRolls,
        next_reset: todayEnd.toISOString().split('T')[0]
      };
    } catch (error) {
      console.error('Status check failed:', error);
      return { success: false, error: "Failed to check status" };
    }
  }, []);

  // Save sound preference to localStorage
  const updateSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('dice-sound-enabled', JSON.stringify(enabled));
  }, []);

  return {
    requestDiceRoll,
    completeAction,
    getDiceSystemStatus,
    soundEnabled,
    setSoundEnabled: updateSoundEnabled
  };
};