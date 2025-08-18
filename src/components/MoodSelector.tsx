
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type Mood = {
  id: string;
  label: string;
  emoji: string;
  description: string;
};

const moods: Mood[] = [
  { id: 'tired', label: 'Tired', emoji: '😪', description: 'Low energy, need rest' },
  { id: 'stuck', label: 'Stuck', emoji: '🤯', description: "Don't know where to start" },
  { id: 'bored', label: 'Bored', emoji: '😐', description: 'Nothing feels interesting' },
  { id: 'guilty', label: 'Guilty', emoji: '😔', description: 'Been avoiding things' },
  { id: 'overwhelmed', label: 'Overwhelmed', emoji: '😵‍💫', description: 'Too much on my plate' },
  { id: 'anxious', label: 'Anxious', emoji: '😰', description: 'Worried about everything' },
  { id: 'motivated', label: 'Motivated', emoji: '😁', description: 'Ready to take action' },
  { id: 'avoidant', label: 'Avoidant', emoji: '😬', description: 'Putting things off' }
];

type MoodSelectorProps = {
  onMoodSelect: (mood: Mood) => void;
};

const MoodSelector = ({ onMoodSelect }: MoodSelectorProps) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const handleMoodClick = (mood: Mood) => {
    setSelectedMood(mood.id);
    setTimeout(() => onMoodSelect(mood), 300);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-medium text-foreground">
          How are you feeling right now?
        </h2>
        <p className="text-muted-foreground">
          No judgment here—just checking in with you 💙
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
        {moods.map((mood) => (
          <Card
            key={mood.id}
            className={`p-4 cursor-pointer gentle-hover border-2 transition-all duration-300 ${
              selectedMood === mood.id
                ? 'border-primary bg-primary/5 scale-95'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => handleMoodClick(mood)}
          >
            <div className="text-center space-y-2">
              <div className="text-2xl">{mood.emoji}</div>
              <div className="font-medium text-sm">{mood.label}</div>
              <div className="text-xs text-muted-foreground">{mood.description}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MoodSelector;
