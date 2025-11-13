import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
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
// import DoomScrollingIntervention from "@/components/DoomScrollingIntervention";
import NudgeResponseModal from "@/components/NudgeResponseModal";
import { SystemWideTestPanel } from "@/components/SystemWideTestPanel";
import { BottomNavigation } from "@/components/BottomNavigation";
import { MainGoalInput } from "@/components/MainGoalInput";
import { DailyMantra } from "@/components/DailyMantra";
import { Button } from "@/components/ui/button";
import { Timer, Home, Brain, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
// import { useDoomScrollingDetection } from "@/hooks/useDoomScrollingDetection";
import { useReminderSystem } from "@/hooks/useReminderSystem";
import { useDiceSystem, CompletionResult } from "@/hooks/useDiceSystem";
import { toast } from "@/hooks/use-toast";
import type { NudgeResponseType } from "@/data/nudgeResponses";
import { TrialBanner } from "@/components/TrialBanner";
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
  const [appState, setAppState] = useState<AppState>(() => {
    const hasCompleted = localStorage.getItem('flowlight-onboarding-completed');
    return hasCompleted === 'true' ? 'mood-selection' : 'welcome';
  });
  
  // Debug mode detection - URL param only
  const [isDebugMode, setIsDebugMode] = useState(false);
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const debugParam = urlParams.get('debug') === '1' || hashParams.get('debug') === '1';
    setIsDebugMode(debugParam);
  }, []);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState<string>("");
  const [diceRollId, setDiceRollId] = useState<string>("");
  const [completionResult, setCompletionResult] = useState<CompletionResult | null>(null);
  const [plannedDuration, setPlannedDuration] = useState<number>(0);
  const [actualDuration, setActualDuration] = useState<number>(0);
  // const {
  //   shouldShowIntervention,
  //   dismissIntervention
  // } = useDoomScrollingDetection();
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
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Android back button handling
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const backButtonListener = App.addListener('backButton', ({ canGoBack }) => {
      const hasCompletedOnboarding = localStorage.getItem('flowlight-onboarding-completed') === 'true';
      
      if (appState === 'welcome') {
        // On welcome/onboarding screen, exit app
        App.exitApp();
      } else if (appState === 'mood-selection') {
        // On home screen
        if (hasCompletedOnboarding) {
          // User has completed onboarding - exit app
          App.exitApp();
        } else {
          // User is in first session - go back to welcome
          setAppState('welcome');
        }
      } else if (appState === 'dice-roll') {
        // Go back to mood selection
        setAppState('mood-selection');
      } else if (appState === 'action-timer') {
        // Go back to dice roll
        setAppState('dice-roll');
      } else if (appState === 'completion-celebration') {
        // Go back to mood selection
        setAppState('mood-selection');
      }
    });

    return () => {
      backButtonListener.then(handle => handle.remove());
    };
  }, [appState]);
  const handleStart = () => {
    localStorage.setItem('flowlight-onboarding-completed', 'true');
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

  // Daily nature background with expanded collection
  const getDailyBackground = () => {
    const backgrounds = [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4", // Mountain sunrise
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d", // Wildflowers
      "https://images.unsplash.com/photo-1501594907352-04cda38ebc29", // Lake sunset
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e", // Forest path
      "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8", // Trees
      "https://images.unsplash.com/photo-1426604966848-d7adac402bff", // Mountain lake
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e", // Foggy hills
      "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1", // Desert sunset
      "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5", // Meadow
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d", // Ocean sunset
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e", // Mountain valley
      "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07", // Beach morning
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1", // Lake dock
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05", // Misty forest
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9", // Night sky
    ];
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
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
  if (!user) {
    return null;
  }

  // Render debug mode interface
  if (isDebugMode) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setIsDebugMode(false);
                  localStorage.removeItem('debug-panel-enabled'); // Clean up legacy flag
                  const url = new URL(window.location.href);
                  url.searchParams.delete('debug');
                  url.hash = url.hash.replace(/[?&]debug=1/, '');
                  window.history.replaceState({}, '', url.toString());
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <Home size={18} />
                <span className="ml-2">Exit Debug</span>
              </Button>
            </div>
            
            <div className="flex items-center gap-2 bg-orange-100 dark:bg-orange-900/20 px-3 py-1 rounded-full">
              <Settings size={16} className="text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-800 dark:text-orange-300">
                Debug Mode
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <UserMenu />
            </div>
          </div>
        </header>
        
        <main className="container py-8 px-4">
          <SystemWideTestPanel />
        </main>
      </div>
    );
  }
  
  return <div 
    className="min-h-screen relative"
    style={{
      paddingTop: 'max(env(safe-area-inset-top, 0px), 16px)',
      paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 120px)',
      backgroundImage: `url(${getDailyBackground()})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed'
    }}
  >
      {/* Doom scrolling intervention temporarily disabled */}
      
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
                <TrialBanner />
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