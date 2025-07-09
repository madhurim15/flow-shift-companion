
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeScreen from '@/components/WelcomeScreen';
import MoodSelector from '@/components/MoodSelector';
import ActionSuggestion from '@/components/ActionSuggestion';
import UserMenu from '@/components/UserMenu';
import DoomScrollingIntervention from '@/components/DoomScrollingIntervention';
import { useAuth } from '@/contexts/AuthContext';
import { useDoomScrollingDetection } from '@/hooks/useDoomScrollingDetection';
import { Button } from '@/components/ui/button';
import { Timer } from 'lucide-react';

type Mood = {
  id: string;
  label: string;
  emoji: string;
  description: string;
};

type AppState = 'welcome' | 'mood-select' | 'action-suggest';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [appState, setAppState] = useState<AppState>('welcome');
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  
  // Doom scrolling detection
  const { shouldShowIntervention, resetPattern } = useDoomScrollingDetection();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleStart = () => {
    setAppState('mood-select');
  };

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    setAppState('action-suggest');
  };

  const handleReset = () => {
    setSelectedMood(null);
    setAppState('mood-select');
  };

  const handleBackToWelcome = () => {
    setSelectedMood(null);
    setAppState('welcome');
  };

  const handleStartMoodCheck = () => {
    setAppState('mood-select');
  };

  // Show loading or nothing while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  if (appState === 'welcome') {
    return <WelcomeScreen onStart={handleStart} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-2xl mx-auto p-4 flex items-center justify-between">
          <button 
            onClick={handleBackToWelcome}
            className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
          >
            <span className="text-xl">✨</span>
            <span className="font-medium">Flowlight</span>
          </button>
          
          <div className="flex items-center space-x-4">
            {selectedMood && (
              <div className="text-sm text-muted-foreground">
                Feeling {selectedMood.label.toLowerCase()} {selectedMood.emoji}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/focus')}
              className="flex items-center gap-2"
            >
              <Timer className="h-4 w-4" />
              Focus
            </Button>
            <UserMenu />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-6">
        {appState === 'mood-select' && (
          <MoodSelector onMoodSelect={handleMoodSelect} />
        )}
        
        {appState === 'action-suggest' && selectedMood && (
          <ActionSuggestion mood={selectedMood} onReset={handleReset} />
        )}
      </div>

      {/* Doom Scrolling Intervention */}
      <DoomScrollingIntervention
        isOpen={shouldShowIntervention}
        onClose={resetPattern}
        onStartMoodCheck={handleStartMoodCheck}
      />
    </div>
  );
};

export default Index;
