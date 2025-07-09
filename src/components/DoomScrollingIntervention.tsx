import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Timer, Heart, Sparkles, Coffee, BookOpen, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DoomScrollingInterventionProps {
  isOpen: boolean;
  onClose: () => void;
  onStartMoodCheck: () => void;
}

const quickActions = [
  {
    id: 'focus-timer',
    title: 'Start Focus Timer',
    description: '25 minutes of focused work',
    icon: Timer,
    color: 'text-blue-600',
    action: 'focus'
  },
  {
    id: 'mood-check',
    title: 'Quick Mood Check',
    description: 'How are you feeling right now?',
    icon: Heart,
    color: 'text-pink-600',
    action: 'mood'
  },
  {
    id: 'mindful-break',
    title: 'Take a Mindful Break',
    description: '2 minutes of breathing',
    icon: Sparkles,
    color: 'text-purple-600',
    action: 'break'
  },
  {
    id: 'hydrate',
    title: 'Hydration Break',
    description: 'Drink some water',
    icon: Coffee,
    color: 'text-green-600',
    action: 'hydrate'
  }
];

const insights = [
  "You've been switching between apps frequently - your brain might need a reset 🧠",
  "Multiple quick visits often mean we're seeking stimulation elsewhere 📱",
  "Your mind is looking for something - let's find what you really need 💙",
  "Breaking the scroll cycle starts with one mindful choice ✨"
];

const DoomScrollingIntervention = ({ isOpen, onClose, onStartMoodCheck }: DoomScrollingInterventionProps) => {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const navigate = useNavigate();
  const randomInsight = insights[Math.floor(Math.random() * insights.length)];

  const handleActionClick = (action: string) => {
    setSelectedAction(action);
    
    switch (action) {
      case 'focus':
        onClose();
        navigate('/focus');
        break;
      case 'mood':
        onClose();
        onStartMoodCheck();
        break;
      case 'break':
        setSelectedAction('break');
        // Show breathing exercise
        break;
      case 'hydrate':
        setSelectedAction('hydrate');
        // Show hydration reminder
        break;
    }
  };

  const renderBreathingExercise = () => (
    <div className="space-y-6 text-center animate-fade-in-up">
      <div className="space-y-2">
        <Sparkles className="h-12 w-12 mx-auto text-purple-600" />
        <h3 className="text-xl font-medium">Mindful Breathing</h3>
        <p className="text-muted-foreground">
          Follow the circle: breathe in as it expands, breathe out as it contracts
        </p>
      </div>
      
      <div className="relative h-32 flex items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-primary/20 animate-pulse"></div>
        <div className="absolute w-16 h-16 rounded-full bg-primary/40 animate-ping"></div>
        <div className="absolute w-12 h-12 rounded-full bg-primary"></div>
      </div>
      
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Take 6 deep breaths at your own pace
        </p>
        <Button onClick={() => setSelectedAction(null)} variant="outline">
          Done
        </Button>
      </div>
    </div>
  );

  const renderHydrationReminder = () => (
    <div className="space-y-6 text-center animate-fade-in-up">
      <div className="space-y-2">
        <Coffee className="h-12 w-12 mx-auto text-green-600" />
        <h3 className="text-xl font-medium">Hydration Break</h3>
        <p className="text-muted-foreground">
          Your brain is 75% water - let's give it what it needs
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-800">
            💧 Drink a full glass of water<br/>
            🚶‍♀️ Take a short walk while drinking<br/>
            🧠 Notice how you feel afterward
          </p>
        </div>
        
        <Button onClick={() => setSelectedAction(null)} variant="outline">
          I've hydrated!
        </Button>
      </div>
    </div>
  );

  const renderMainContent = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-medium">Hey there 👋</h2>
        <p className="text-muted-foreground">
          {randomInsight}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.id}
              className="p-4 cursor-pointer gentle-hover border-2 transition-all duration-300 hover:border-primary/50"
              onClick={() => handleActionClick(action.action)}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`h-6 w-6 ${action.color}`} />
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        <Button 
          onClick={onClose} 
          variant="ghost" 
          size="sm"
          className="text-muted-foreground"
        >
          Maybe later
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg">
              {selectedAction === 'break' && 'Mindful Breathing'}
              {selectedAction === 'hydrate' && 'Hydration Time'}
              {!selectedAction && 'Gentle Check-in ✨'}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {selectedAction === 'break' && renderBreathingExercise()}
        {selectedAction === 'hydrate' && renderHydrationReminder()}
        {!selectedAction && renderMainContent()}
      </DialogContent>
    </Dialog>
  );
};

export default DoomScrollingIntervention;