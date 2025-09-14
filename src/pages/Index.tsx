import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WelcomeScreen from "@/components/WelcomeScreen";
import MoodSelector from "@/components/MoodSelector";
import Dice3D from "@/components/Dice3D";
import ActionTimer from "@/components/ActionTimer";
import CompletionCelebration from "@/components/CompletionCelebration";
import DiceSystemStatus from "@/components/DiceSystemStatus";
import DiceRollsRemaining from "@/components/DiceRollsRemaining";
import UserMenu from "@/components/UserMenu";
import PomodoroModal from "@/components/PomodoroModal";
import CalendarModal from "@/components/CalendarModal";
import DoomScrollingIntervention from "@/components/DoomScrollingIntervention";
import NudgeResponseModal from "@/components/NudgeResponseModal";
import { BottomNavigation } from "@/components/BottomNavigation";
import { MainGoalInput } from "@/components/MainGoalInput";
import { DailyMantra } from "@/components/DailyMantra";
import { Button } from "@/components/ui/button";
import { Timer, Home } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDoomScrollingDetection } from "@/hooks/useDoomScrollingDetection";
import { useReminderSystem } from "@/hooks/useReminderSystem";
import { useDiceSystem, CompletionResult } from "@/hooks/useDiceSystem";
import { toast } from "@/hooks/use-toast";
import type { NudgeResponseType } from "@/data/nudgeResponses";
import Landing from "./Landing";
export type Mood = {
  id: string;
  label: string;
  emoji: string;
  description: string;
};
type AppState = "welcome" | "mood-selection" | "dice-roll" | "action-timer" | "completion-celebration";
const Index = () => {
  const navigate = useNavigate();
  const {
    user,
    loading
  } = useAuth();
  const [appState, setAppState] = useState<AppState>("welcome");
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState<string>("");
  const [diceRollId, setDiceRollId] = useState<string>("");
  const [completionResult, setCompletionResult] = useState<CompletionResult | null>(null);
  const [plannedDuration, setPlannedDuration] = useState<number>(0);
  const [actualDuration, setActualDuration] = useState<number>(0);
  const {
    shouldShowIntervention,
    dismissIntervention
  } = useDoomScrollingDetection();
  const {
    showNudgeModal,
    currentReminderType,
    handleNudgeResponse,
    closeNudgeModal
  } = useReminderSystem();
  const {
    requestDiceRoll,
    completeAction,
    soundEnabled,
    setSoundEnabled
  } = useDiceSystem();
  // Show landing page if not authenticated
  if (!loading && !user) {
    return <Landing onShowAuth={() => navigate('/auth')} />;
  }
  const handleStart = () => {
    setAppState("mood-selection");
  };
  const handleMoodSelect = async (mood: Mood) => {
    setSelectedMood(mood);
    setSelectedMoodId(mood.id);

    // Request dice roll from backend
    const {
      result,
      action
    } = await requestDiceRoll(mood.label);
    if (result.success && result.dice_roll_id) {
      setCurrentAction(action);
      setDiceRollId(result.dice_roll_id);
      setAppState("dice-roll");
    } else {
      // Handle error - stay on mood selection and reset selection after a brief delay
      setTimeout(() => {
        setSelectedMoodId(null);
      }, 1000);
    }
  };
  const handleStartAction = (diceRollId: string, action: string, immediate = false) => {
    if (immediate) {
      // Handle immediate completion
      const duration = getDurationFromAction(action);
      handleActionComplete(diceRollId, duration, 30); // 30 second "quick completion"
    } else {
      // Determine planned duration based on action type
      const duration = getDurationFromAction(action);
      setPlannedDuration(duration);
      setAppState("action-timer");
    }
  };
  const handleActionComplete = async (diceRollId: string, plannedDuration: number, actualDuration: number) => {
    try {
      const result = await completeAction(diceRollId, plannedDuration, actualDuration);
      setCompletionResult(result);
      setActualDuration(actualDuration);
      setAppState("completion-celebration");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record completion, but you still did great!",
        variant: "destructive"
      });
      // Still show celebration even if recording failed
      setCompletionResult({
        success: true,
        completion_type: plannedDuration <= 300 ? 'small' : plannedDuration <= 1200 ? 'medium' : 'big',
        current_streak: 1,
        best_streak: 1,
        is_new_best: false
      });
      setActualDuration(actualDuration);
      setAppState("completion-celebration");
    }
  };
  const handleCompletionContinue = () => {
    // Reset to mood selection (not welcome screen)
    setAppState("mood-selection");
    setSelectedMood(null);
    setSelectedMoodId(null);
    setCurrentAction("");
    setDiceRollId("");
    setCompletionResult(null);
    setPlannedDuration(0);
    setActualDuration(0);
  };

  const handleNudgeResponseSelect = async (responseType: NudgeResponseType, responseData?: any) => {
    await handleNudgeResponse(responseType, responseData);
    
    // Handle specific response types
    if (responseType === 'mood_check') {
      // Trigger mood selection flow
      setAppState("mood-selection");
    }
    
    closeNudgeModal();
  };

  // Daily nature background
  const getDailyBackground = () => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const backgrounds = ['nature-sunrise', 'nature-forest', 'nature-ocean', 'nature-mountain', 'nature-meadow', 'nature-sunset'];
    return backgrounds[dayOfYear % backgrounds.length];
  };
  const handleBackToWelcome = () => {
    setAppState("welcome");
  };
  const handleStartMoodCheck = () => {
    setAppState("mood-selection");
  };

  // Helper function to determine duration from action text
  const getDurationFromAction = (action: string): number => {
    const lowerAction = action.toLowerCase();

    // Look for time indicators in the action text
    if (lowerAction.includes('2-min') || lowerAction.includes('2 min')) return 120;
    if (lowerAction.includes('5-min') || lowerAction.includes('5 min')) return 300;
    if (lowerAction.includes('10-min') || lowerAction.includes('10 min')) return 600;
    if (lowerAction.includes('15-min') || lowerAction.includes('15 min')) return 900;
    if (lowerAction.includes('20-min') || lowerAction.includes('20 min')) return 1200;
    if (lowerAction.includes('30-min') || lowerAction.includes('30 min')) return 1800;

    // Default durations based on action complexity
    if (lowerAction.includes('timer') || lowerAction.includes('focused') || lowerAction.includes('work')) {
      return 600; // 10 minutes for work sessions
    }
    if (lowerAction.includes('breath') || lowerAction.includes('sit') || lowerAction.includes('quietly')) {
      return 120; // 2 minutes for mindfulness
    }
    if (lowerAction.includes('write') || lowerAction.includes('list') || lowerAction.includes('draw')) {
      return 300; // 5 minutes for planning/creative tasks
    }

    // Default to 5 minutes for most actions
    return 300;
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
  }

  // Show landing page if not authenticated
  if (!user) {
    return <Landing onShowAuth={() => navigate('/auth')} />;
  }
  return <div className={`min-h-screen ${getDailyBackground()}`}>
      {shouldShowIntervention && <DoomScrollingIntervention isOpen={shouldShowIntervention} onClose={dismissIntervention} onStartMoodCheck={handleStartMoodCheck} />}
      
      {appState === "welcome" && <WelcomeScreen onStart={handleStart} />}
      
      {appState !== "welcome" && <>
          
          <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={handleBackToWelcome} className="text-muted-foreground hover:text-foreground">
                  <Home size={18} />
                </Button>
                
                <CalendarModal />
                
                {selectedMood && <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Currently:</span>
                    <span className="font-medium text-foreground">
                      {selectedMood.emoji} {selectedMood.label}
                    </span>
                  </div>}
              </div>
              
              {/* Centered Logo */}
              <div className="absolute left-1/2 transform -translate-x-1/2">
                <h1 className="text-lg text-violet-500 font-bold">FlowFocus</h1>
              </div>
              
              <div className="flex items-center gap-2">
                <PomodoroModal />
                <UserMenu />
              </div>
            </div>
          </header>
          
          <main className="container py-4 pb-20 px-4">
            {appState === "mood-selection" && <div className="space-y-4">
                <DailyMantra />
                <MoodSelector onMoodSelect={handleMoodSelect} firstName={user?.user_metadata?.full_name?.split(' ')[0]} selectedMoodId={selectedMoodId} />
                <MainGoalInput />
              </div>}
          </main>
          
          {/* Bottom Navigation */}
          <BottomNavigation />
        </>}

      {/* 3D Dice Roll Overlay */}
      {appState === "dice-roll" && selectedMood && <Dice3D mood={selectedMood} action={currentAction} diceRollId={diceRollId} onStartAction={handleStartAction} soundEnabled={soundEnabled} onSoundToggle={() => setSoundEnabled(!soundEnabled)} />}

      {/* Action Timer Overlay */}
      {appState === "action-timer" && <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <ActionTimer action={currentAction} diceRollId={diceRollId} plannedDuration={plannedDuration} onComplete={handleActionComplete} soundEnabled={soundEnabled} onSoundToggle={() => setSoundEnabled(!soundEnabled)} />
        </div>}

      {/* Completion Celebration Overlay */}
      {appState === "completion-celebration" && completionResult && <CompletionCelebration result={completionResult} action={currentAction} plannedDuration={plannedDuration} actualDuration={actualDuration} onContinue={handleCompletionContinue} soundEnabled={soundEnabled} />}

      {/* Nudge Response Modal */}
      {showNudgeModal && currentReminderType && (
        <NudgeResponseModal
          isOpen={showNudgeModal}
          onClose={closeNudgeModal}
          reminderType={currentReminderType}
          onResponseSelect={handleNudgeResponseSelect}
        />
      )}

      {/* Dice Rolls Remaining Display */}
      <DiceRollsRemaining show={appState === "completion-celebration"} />
    </div>;
};
export default Index;