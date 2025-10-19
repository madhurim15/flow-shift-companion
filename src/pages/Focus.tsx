import { useEffect } from 'react';
import PomodoroTimer from '@/components/PomodoroTimer';
import UserMenu from '@/components/UserMenu';
import DoomScrollingIntervention from '@/components/DoomScrollingIntervention';
import { useAuth } from '@/contexts/AuthContext';
import { useDoomScrollingDetection } from '@/hooks/useDoomScrollingDetection';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Focus = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Doom scrolling detection
  const { shouldShowIntervention, dismissIntervention } = useDoomScrollingDetection();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) {
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
              Pomodoro Timer
            </div>
            <UserMenu />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6">
        <PomodoroTimer />
      </div>

      {/* Doom Scrolling Intervention */}
      <DoomScrollingIntervention
        isOpen={shouldShowIntervention}
        onClose={dismissIntervention}
        onStartMoodCheck={() => navigate('/')}
      />
    </div>
  );
};

export default Focus;
