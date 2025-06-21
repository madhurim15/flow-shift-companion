
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import PomodoroTimer from '@/components/PomodoroTimer';
import ReminderSystem from '@/components/ReminderSystem';
import UserMenu from '@/components/UserMenu';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Timer, Bell } from 'lucide-react';

type FocusView = 'pomodoro' | 'reminders';

const Focus = () => {
  const [currentView, setCurrentView] = useState<FocusView>('pomodoro');
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-2xl mx-auto p-4 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xl">✨</span>
            <span className="font-medium">Flowlight</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              Focus & Flow
            </div>
            <UserMenu />
          </div>
        </div>
      </div>

      {/* View Selector */}
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex gap-2 p-1 bg-muted rounded-lg mb-6">
          <Button
            variant={currentView === 'pomodoro' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('pomodoro')}
            className="flex-1 flex items-center gap-2"
          >
            <Timer className="h-4 w-4" />
            Pomodoro Timer
          </Button>
          <Button
            variant={currentView === 'reminders' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('reminders')}
            className="flex-1 flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Gentle Reminders
          </Button>
        </div>

        {/* Content */}
        {currentView === 'pomodoro' && <PomodoroTimer />}
        {currentView === 'reminders' && <ReminderSystem />}
      </div>
    </div>
  );
};

export default Focus;
