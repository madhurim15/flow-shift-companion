
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, RefreshCw } from 'lucide-react';

type Mood = {
  id: string;
  label: string;
  emoji: string;
  description: string;
};

type Action = {
  title: string;
  description: string;
  timeEstimate: string;
  encouragement: string;
};

const actionMap: Record<string, Action[]> = {
  overwhelmed: [
    {
      title: "Brain dump for 3 minutes",
      description: "Write down everything on your mind, no organizing needed",
      timeEstimate: "3 min",
      encouragement: "Sometimes we just need to get it all out of our heads first 🧠"
    },
    {
      title: "Pick the tiniest thing",
      description: "Look at your list and circle just one tiny task",
      timeEstimate: "30 sec",
      encouragement: "You don't have to do it all today—just one thing"
    }
  ],
  anxious: [
    {
      title: "Take 3 deep breaths",
      description: "Inhale for 4, hold for 4, exhale for 6",
      timeEstimate: "1 min",
      encouragement: "Your nervous system needs a moment to reset 🌊"
    },
    {
      title: "Name 5 things you can see",
      description: "Ground yourself by naming 5 things around you",
      timeEstimate: "2 min",
      encouragement: "Bringing yourself back to the present moment"
    }
  ],
  tired: [
    {
      title: "Set a 10-minute timer",
      description: "Give yourself permission to rest guilt-free",
      timeEstimate: "10 min",
      encouragement: "Rest isn't giving up—it's recharging ⚡"
    },
    {
      title: "Drink some water",
      description: "Hydrate and maybe splash some on your face",
      timeEstimate: "2 min",
      encouragement: "Sometimes tired is just thirsty in disguise"
    }
  ],
  bored: [
    {
      title: "Change your location",
      description: "Move to a different room or spot",
      timeEstimate: "30 sec",
      encouragement: "New scenery = new perspective ✨"
    },
    {
      title: "Do something with your hands",
      description: "Doodle, stretch, organize a small area",
      timeEstimate: "5 min",
      encouragement: "Sometimes we need to move to feel alive again"
    }
  ],
  stuck: [
    {
      title: "Set a 2-minute timer",
      description: "Just sit with the task for 2 minutes, no pressure to finish",
      timeEstimate: "2 min",
      encouragement: "You don't have to solve it all—just show up 💪"
    },
    {
      title: "Ask: 'What's the smallest step?'",
      description: "Break it down until it feels almost silly small",
      timeEstimate: "1 min",
      encouragement: "Every mountain is climbed one step at a time"
    }
  ],
  guilty: [
    {
      title: "Forgive yourself first",
      description: "Say 'I'm human and this is normal' out loud",
      timeEstimate: "30 sec",
      encouragement: "Self-compassion isn't indulgence—it's fuel 💙"
    },
    {
      title: "Do one tiny productive thing",
      description: "Make your bed, wash one dish, send one text",
      timeEstimate: "2 min",
      encouragement: "You're already breaking the cycle by being here"
    }
  ],
  restless: [
    {
      title: "Move your body for 2 minutes",
      description: "Stretch, dance, do jumping jacks—anything",
      timeEstimate: "2 min",
      encouragement: "Your body has energy that needs somewhere to go 🕺"
    },
    {
      title: "Clean one small thing",
      description: "Clear your desk, organize a drawer, anything you can see results from",
      timeEstimate: "5 min",
      encouragement: "Sometimes we need to see progress to feel progress"
    }
  ],
  okay: [
    {
      title: "Check in with future you",
      description: "What would help you feel proud of this moment later?",
      timeEstimate: "1 min",
      encouragement: "You're in a good space—let's build on it! 🌱"
    },
    {
      title: "Do something kind for yourself",
      description: "Make tea, listen to a favorite song, text a friend",
      timeEstimate: "5 min",
      encouragement: "When we're okay, we can invest in staying that way"
    }
  ]
};

type ActionSuggestionProps = {
  mood: Mood;
  onReset: () => void;
};

const ActionSuggestion = ({ mood, onReset }: ActionSuggestionProps) => {
  const [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [showEncouragement, setShowEncouragement] = useState(false);
  
  const actions = actionMap[mood.id] || actionMap.okay;
  const currentAction = actions[currentActionIndex];

  const handleNowWhat = () => {
    setShowEncouragement(true);
    setTimeout(() => setShowEncouragement(false), 3000);
  };

  const handleTryAnother = () => {
    setCurrentActionIndex((prev) => (prev + 1) % actions.length);
  };

  return (
    <div className="space-y-6 animate-fade-in-up max-w-lg mx-auto">
      <div className="text-center space-y-2">
        <div className="text-4xl mb-2">{mood.emoji}</div>
        <h2 className="text-xl font-medium">
          Got it—feeling {mood.label.toLowerCase()}
        </h2>
        <p className="text-muted-foreground text-sm">
          Here's something gentle you could try:
        </p>
      </div>

      <Card className="p-6 soft-shadow border-2 border-primary/20">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-foreground">
              {currentAction.title}
            </h3>
            <p className="text-muted-foreground">
              {currentAction.description}
            </p>
            <div className="text-sm text-primary font-medium">
              ⏱️ {currentAction.timeEstimate}
            </div>
          </div>

          {showEncouragement && (
            <div className="p-4 bg-flow-gentle/20 rounded-lg border border-flow-gentle/30 animate-fade-in-up">
              <p className="text-sm text-foreground font-medium">
                {currentAction.encouragement}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button 
              onClick={handleNowWhat}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gentle-hover"
            >
              Now What? <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            {actions.length > 1 && (
              <Button 
                variant="outline" 
                onClick={handleTryAnother}
                className="gentle-hover"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>

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
