
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
  firstName?: string;
  selectedMoodId?: string | null;
};

const MoodSelector = ({ onMoodSelect, firstName, selectedMoodId }: MoodSelectorProps) => {

  const handleMoodClick = (mood: Mood) => {
    onMoodSelect(mood);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-medium text-white/90 drop-shadow-lg">
            How are you feeling{firstName ? `, ${firstName}` : ""}?
          </h2>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
        {moods.map((mood) => (
          <Card
            key={mood.id}
            className={`p-3 cursor-pointer gentle-hover border-2 transition-all duration-300 bg-white/95 backdrop-blur-sm shadow-lg ${
              selectedMoodId === mood.id
                ? 'border-primary bg-primary/10 scale-95'
                : 'border-border hover:border-primary/50 hover:shadow-xl'
            }`}
            onClick={() => handleMoodClick(mood)}
          >
            <div className="text-center space-y-1">
              <div className="text-lg">{mood.emoji}</div>
              <div className="font-medium text-xs text-foreground">{mood.label}</div>
              <div className="text-[10px] text-muted-foreground leading-tight">{mood.description}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MoodSelector;
