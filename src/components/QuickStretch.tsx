import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Activity, Play, Pause } from 'lucide-react';

interface QuickStretchProps {
  onComplete: () => void;
  onCancel: () => void;
}

const stretchSteps = [
  { name: 'Deep Breathing', duration: 30, instruction: 'Take 5 slow, deep breaths. Inhale through your nose, exhale through your mouth.' },
  { name: 'Neck Rolls', duration: 30, instruction: 'Gently roll your neck in slow circles. 5 times clockwise, then counterclockwise.' },
  { name: 'Shoulder Shrugs', duration: 30, instruction: 'Lift your shoulders up to your ears, hold for 3 seconds, then release. Repeat 10 times.' },
  { name: 'Arm Circles', duration: 30, instruction: 'Extend arms out to sides. Make small circles forward, then backward.' },
  { name: 'Gentle Stretch', duration: 60, instruction: 'Reach your arms up high, then gently lean left and right. Hold each side for 15 seconds.' }
];

const QuickStretch: React.FC<QuickStretchProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(stretchSteps[0].duration);
  const [isActive, setIsActive] = useState(false);
  const [totalTime] = useState(stretchSteps.reduce((sum, step) => sum + step.duration, 0));
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            // Move to next step
            if (currentStep < stretchSteps.length - 1) {
              setCurrentStep(currentStep + 1);
              return stretchSteps[currentStep + 1].duration;
            } else {
              // Completed all steps
              setIsActive(false);
              onComplete();
              return 0;
            }
          }
          return time - 1;
        });
        setElapsedTime((elapsed) => elapsed + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, currentStep, onComplete]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const progress = (elapsedTime / totalTime) * 100;
  const currentStepData = stretchSteps[currentStep];

  return (
    <Card className="max-w-md mx-auto bg-card/95 backdrop-blur-sm border-border/50">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
          <Activity className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-lg">3-Minute Morning Stretch</CardTitle>
        <p className="text-sm text-muted-foreground">
          Gentle movements to energize your body
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Progress value={progress} className="w-full" />
        
        <div className="text-center space-y-3">
          <h3 className="font-medium text-foreground">
            Step {currentStep + 1}: {currentStepData.name}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {currentStepData.instruction}
          </p>
          <div className="text-2xl font-mono text-primary">
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isActive} className="flex-1">
            Cancel
          </Button>
          <Button onClick={toggleTimer} className="flex-1">
            {isActive ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                {elapsedTime > 0 ? 'Resume' : 'Start'}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickStretch;