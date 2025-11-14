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
    <div className="space-y-3 animate-fade-in mt-6">
      <div className="flex items-center gap-2 text-center justify-center">
        <Target className="w-5 h-5 text-white/80 drop-shadow-md" />
        <Label htmlFor="main-goal" className="text-lg font-semibold text-white/90 drop-shadow-lg">
          Main goal for today?
        </Label>
      </div>
      <div className="flex justify-center">
        <Input
          id="main-goal"
          type="text"
          placeholder="Enter your main focus..."
          value={goal}
          onChange={(e) => handleGoalChange(e.target.value)}
          className="text-center border-white/30 focus:border-white/60 bg-white/10 backdrop-blur-sm placeholder:text-white/50 text-white/90 w-64 text-sm shadow-lg"
        />
      </div>
    </div>
  );
};