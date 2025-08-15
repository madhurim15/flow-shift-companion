import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Flame, Trophy, Target } from "lucide-react";

interface CompletionResult {
  success: boolean;
  completion_type: 'small' | 'medium' | 'big';
  current_streak: number;
  best_streak: number;
  is_new_best: boolean;
}

interface CompletionCelebrationProps {
  result: CompletionResult;
  action: string;
  plannedDuration: number;
  actualDuration: number;
  onContinue: () => void;
  soundEnabled: boolean;
}

const CompletionCelebration: React.FC<CompletionCelebrationProps> = ({
  result,
  action,
  plannedDuration,
  actualDuration,
  onContinue,
  soundEnabled
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getCelebrationContent = () => {
    switch (result.completion_type) {
      case 'small':
        return {
          title: "Nice work!",
          emoji: "✅",
          message: "Small steps lead to big changes",
          color: "text-green-600"
        };
      case 'medium':
        return {
          title: "Well done!",
          emoji: "🎯",
          message: "You're building great momentum",
          color: "text-blue-600"
        };
      case 'big':
        return {
          title: "Amazing!",
          emoji: "🏆",
          message: "That was a significant achievement",
          color: "text-purple-600"
        };
    }
  };

  const celebration = getCelebrationContent();

  useEffect(() => {
    // Play completion sound based on task size
    if (soundEnabled) {
      const audio = new Audio();
      
      if (result.completion_type === 'big') {
        // Big task fanfare
        audio.src = 'data:audio/wav;base64,UklGRhwBAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0Ya4AAADjD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycA==';
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      } else if (result.completion_type === 'medium') {
        // Medium task success
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUYrTp66hVFApGn+DyvmwhBT2a1/DWeykELIHO8tiJOQcXaLvt559NEAxPqOPwtmMdBC2QzOzPeysCJH3K8dOLPwkSarsO+1scdC2QyuNpZJCKs4KFbrK1ZYx3p8O1VTFJ5WleH5nWkGOq5IxP7L0eGJ6OlHTRHzFJcGOPd2LE';
      }
      
      audio.play().catch(() => {});
    }
  }, [result, soundEnabled]);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      {/* Confetti Effect for Big Tasks */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-40">
          <div className="confetti-container">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][Math.floor(Math.random() * 5)]
                }}
              />
            ))}
          </div>
        </div>
      )}

      <Card className="max-w-md w-full shadow-xl border-primary/20 relative z-50">
        <CardContent className="p-8 text-center space-y-6">
          {/* Main Celebration */}
          <div className="space-y-4">
            <div className="text-6xl animate-scale-in">
              {celebration.emoji}
            </div>
            
            <div className="space-y-2">
              <h2 className={`text-2xl font-bold ${celebration.color}`}>
                {celebration.title}
              </h2>
              <p className="text-muted-foreground">
                {celebration.message}
              </p>
            </div>
          </div>

          {/* Action Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <CheckCircle size={16} />
              <span>Completed</span>
            </div>
            <p className="text-sm font-medium leading-relaxed text-foreground">
              {action}
            </p>
            <div className="flex justify-center gap-4 text-xs text-muted-foreground">
              <span>Planned: {formatTime(plannedDuration)}</span>
              <span>•</span>
              <span>Actual: {formatTime(actualDuration)}</span>
            </div>
          </div>

          {/* Streak Information */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Flame className="text-orange-500" size={20} />
              <span className="font-semibold">
                {result.current_streak} day streak
              </span>
              {result.is_new_best && (
                <Badge variant="secondary" className="ml-2">
                  <Trophy size={12} className="mr-1" />
                  New Best!
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Best streak: {result.best_streak} days
            </p>
          </div>

          {/* Continue Button */}
          <Button
            onClick={onContinue}
            className="w-full"
            size="lg"
          >
            Continue Journey
          </Button>
        </CardContent>
      </Card>

      {/* Confetti CSS */}
      <style>{`
        .confetti-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
        }
        
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          background: #FFD700;
          animation: confetti-fall 3s linear infinite;
          transform-origin: center;
        }
        
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default CompletionCelebration;