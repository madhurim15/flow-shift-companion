import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Target } from 'lucide-react';

interface MainGoalInputProps {
  onGoalSet?: (goal: string) => void;
}

export const MainGoalInput = ({ onGoalSet }: MainGoalInputProps) => {
  const [goal, setGoal] = useState('');

  const handleGoalChange = (value: string) => {
    setGoal(value);
    onGoalSet?.(value);
  };

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center gap-2 text-center justify-center">
        <Target className="w-5 h-5 text-primary" />
        <Label htmlFor="main-goal" className="text-lg font-semibold text-foreground">
          Main goal for today?
        </Label>
      </div>
      <div className="flex justify-center">
        <Input
          id="main-goal"
          type="text"
          placeholder="Focus word..."
          value={goal}
          onChange={(e) => handleGoalChange(e.target.value)}
          className="text-center border-primary/30 focus:border-primary bg-background/50 placeholder:text-muted-foreground/60 w-48 text-sm"
        />
      </div>
    </div>
  );
};