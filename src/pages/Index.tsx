
import { useState } from 'react';
import WelcomeScreen from '@/components/WelcomeScreen';
import MoodSelector from '@/components/MoodSelector';
import ActionSuggestion from '@/components/ActionSuggestion';

type Mood = {
  id: string;
  label: string;
  emoji: string;
  description: string;
};

type AppState = 'welcome' | 'mood-select' | 'action-suggest';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);

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
          {selectedMood && (
            <div className="text-sm text-muted-foreground">
              Feeling {selectedMood.label.toLowerCase()} {selectedMood.emoji}
            </div>
          )}
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
    </div>
  );
};

export default Index;
