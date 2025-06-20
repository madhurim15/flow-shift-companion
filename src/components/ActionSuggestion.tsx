
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, RefreshCw, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { logMoodAction } from '@/utils/moodActionLogger';
import { moodActionsData } from '@/data/moodActions';

type Mood = {
  id: string;
  label: string;
  emoji: string;
  description: string;
};

type ActionSuggestionProps = {
  mood: Mood;
  onReset: () => void;
};

const ActionSuggestion = ({ mood, onReset }: ActionSuggestionProps) => {
  const [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [triedActions, setTriedActions] = useState<Set<number>>(new Set());
  const [loggingActions, setLoggingActions] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  
  const actions = moodActionsData[mood.label as keyof typeof moodActionsData] || moodActionsData["Actually okay"];

  const handleNowWhat = () => {
    setShowEncouragement(true);
    setTimeout(() => setShowEncouragement(false), 3000);
  };

  const handleTryAnother = () => {
    setCurrentActionIndex((prev) => (prev + 1) % actions.length);
  };

  const handleTriedThis = async (actionIndex: number) => {
    setLoggingActions(prev => new Set([...prev, actionIndex]));
    try {
      await logMoodAction(mood.label, actions[actionIndex]);
      setTriedActions(prev => new Set([...prev, actionIndex]));
      
      toast({
        title: "Nice work! 🌟",
        description: "Your action has been logged. Every small step counts.",
      });
    } catch (error) {
      console.error('Error logging action:', error);
      toast({
        title: "Couldn't log that action",
        description: "Don't worry - you still did great! Try again if you'd like.",
        variant: "destructive"
      });
    } finally {
      setLoggingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(actionIndex);
        return newSet;
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up max-w-lg mx-auto">
      <div className="text-center space-y-2">
        <div className="text-4xl mb-2">{mood.emoji}</div>
        <h2 className="text-xl font-medium">
          Got it—feeling {mood.label.toLowerCase()}
        </h2>
        <p className="text-muted-foreground text-sm">
          Here are some gentle things you could try:
        </p>
      </div>

      <div className="space-y-3">
        {actions.map((action, index) => (
          <Card 
            key={index}
            className={`p-4 border-2 transition-all duration-300 ${
              index === currentActionIndex 
                ? 'border-primary bg-primary/5 shadow-md' 
                : 'border-border bg-background/50'
            } ${triedActions.has(index) ? 'bg-green-50 border-green-200' : ''}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm text-foreground leading-relaxed">
                  {action}
                </p>
              </div>
              
              <div className="flex gap-2 flex-shrink-0">
                {!triedActions.has(index) ? (
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => handleTriedThis(index)}
                    disabled={loggingActions.has(index)}
                    className="text-xs bg-white hover:bg-primary/10 border-primary/30"
                  >
                    {loggingActions.has(index) ? '...' : 'Tried this'}
                  </Button>
                ) : (
                  <div className="flex items-center gap-1 text-green-600 text-xs">
                    <Check className="h-3 w-3" />
                    Done
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {showEncouragement && (
        <div className="p-4 bg-flow-gentle/20 rounded-lg border border-flow-gentle/30 animate-fade-in-up">
          <p className="text-sm text-foreground font-medium text-center">
            You're taking care of yourself, and that's beautiful 💙
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button 
          onClick={handleNowWhat}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gentle-hover"
        >
          Encourage me <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        
        <Button 
          variant="outline" 
          onClick={handleTryAnother}
          className="gentle-hover"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-center">
        <Button 
          variant="ghost" 
          onClick={onReset}
          className="text-muted-foreground hover:text-foreground"
        >
          Actually, I'm feeling something else
        </Button>
      </div>
    </div>
  );
};

export default ActionSuggestion;
