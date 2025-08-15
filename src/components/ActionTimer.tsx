import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Square, Volume2, VolumeX } from "lucide-react";

interface ActionTimerProps {
  action: string;
  diceRollId: string;
  plannedDuration: number; // in seconds
  onComplete: (diceRollId: string, plannedDuration: number, actualDuration: number) => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
}

const ActionTimer: React.FC<ActionTimerProps> = ({
  action,
  diceRollId,
  plannedDuration,
  onComplete,
  soundEnabled,
  onSoundToggle
}) => {
  const [timeRemaining, setTimeRemaining] = useState(plannedDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [actualDuration, setActualDuration] = useState(0);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((plannedDuration - timeRemaining) / plannedDuration) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            // Play completion sound
            if (soundEnabled) {
              const audio = new Audio();
              audio.src = 'data:audio/wav;base64,UklGRhwBAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0Ya4AAADjD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycA==';
              audio.play().catch(() => {});
            }
            onComplete(diceRollId, plannedDuration, actualDuration + 1);
            return 0;
          }
          return prev - 1;
        });
        setActualDuration(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isPaused, timeRemaining, plannedDuration, diceRollId, actualDuration, onComplete, soundEnabled]);

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsRunning(false);
    onComplete(diceRollId, plannedDuration, actualDuration);
  };

  const getTimerMessage = () => {
    if (!isRunning) return "Ready to start your focused session";
    if (isPaused) return "Paused - take a breath";
    if (timeRemaining <= 60) return "Almost there! Stay focused";
    return "You're doing great - keep going";
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">Focus Timer</CardTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {action}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSoundToggle}
              className="text-muted-foreground hover:text-foreground ml-2"
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Circular Progress */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-muted/20"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercentage / 100)}`}
                  className="text-primary transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
              </svg>
              
              {/* Timer display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-mono font-bold text-foreground">
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatTime(plannedDuration)} planned
                </div>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {getTimerMessage()}
            </p>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-3">
            {!isRunning ? (
              <Button onClick={handleStart} className="flex items-center gap-2">
                <Play size={16} />
                Start Focus
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handlePause}
                  className="flex items-center gap-2"
                >
                  <Pause size={16} />
                  {isPaused ? "Resume" : "Pause"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleStop}
                  className="flex items-center gap-2"
                >
                  <Square size={16} />
                  Complete
                </Button>
              </>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActionTimer;