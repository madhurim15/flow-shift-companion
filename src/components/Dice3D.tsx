import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

interface Dice3DProps {
  mood: { id: string; label: string; emoji: string; description: string };
  action: string;
  diceRollId: string;
  onStartAction: (diceRollId: string, action: string) => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
}

const Dice3D: React.FC<Dice3DProps> = ({
  mood,
  action,
  diceRollId,
  onStartAction,
  soundEnabled,
  onSoundToggle
}) => {
  const [isRolling, setIsRolling] = useState(true);
  const [showAction, setShowAction] = useState(false);

  useEffect(() => {
    // Play rolling sound if enabled
    if (soundEnabled) {
      const audio = new Audio();
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUYrTp66hVFApGn+DyvmwhBT2a1/DWeykELIHO8tiJOQcXaLvt559NEAxPqOPwtmMdBC2QzOzPeysCJH3K8dOLPwkSarsO+1scdC2QyuNpZJCKs4KFbrK1ZYx3p8O1VTFJ5WleH5nWkGOq5IxP7L0eGJ6OlHTRHzFJcGOPd2LE';
      audio.play().catch(() => {}); // Ignore autoplay policy errors
    }

    const rollTimer = setTimeout(() => {
      setIsRolling(false);
      
      // Play result sound if enabled
      if (soundEnabled) {
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRhwBAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0Ya4AAADjD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycOcPVUM+snDnD1VDPrJw5w9VQz6ycA==';
        audio.play().catch(() => {});
      }
      
      setTimeout(() => setShowAction(true), 200);
    }, 3000); // 3 second roll duration

    return () => clearTimeout(rollTimer);
  }, [soundEnabled]);

  const handleStartAction = () => {
    onStartAction(diceRollId, action);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full shadow-xl border-primary/20">
        <CardContent className="p-8">
          {/* Sound Toggle */}
          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSoundToggle}
              className="text-muted-foreground hover:text-foreground"
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </Button>
          </div>

          <div className="text-center space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Feeling</p>
              <p className="text-lg font-medium">
                {mood.label.toLowerCase()} {mood.emoji}
              </p>
            </div>

            {/* 3D Dice Animation */}
            <div className="flex justify-center py-8">
              <div
                className={`text-8xl select-none transition-all duration-300 ${
                  isRolling
                    ? "animate-spin dice-3d-rolling"
                    : "dice-3d-settled animate-scale-in"
                }`}
                style={{
                  transformStyle: "preserve-3d",
                  animationDuration: isRolling ? "0.3s" : undefined,
                  filter: isRolling ? "blur(2px)" : "none",
                }}
              >
                🎲
              </div>
            </div>

            {/* Action Reveal */}
            {!isRolling && showAction && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Your next step</p>
                  <p className="text-lg font-medium leading-relaxed text-foreground">
                    {action}
                  </p>
                </div>

                <Button
                  onClick={handleStartAction}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                >
                  🚀 Start Now
                </Button>
              </div>
            )}

            {/* Rolling Message */}
            {isRolling && (
              <div className="animate-fade-in">
                <p className="text-muted-foreground">
                  Rolling your perfect next step...
                </p>
                <div className="mt-2 flex justify-center">
                  <div className="w-6 h-1 bg-primary/20 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-primary rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* CSS for 3D effects */}
      <style>{`
        .dice-3d-rolling {
          transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg);
          animation: roll3d 0.3s linear infinite;
        }
        
        .dice-3d-settled {
          transform: rotateX(15deg) rotateY(-15deg);
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        @keyframes roll3d {
          0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
          25% { transform: rotateX(90deg) rotateY(90deg) rotateZ(90deg); }
          50% { transform: rotateX(180deg) rotateY(180deg) rotateZ(180deg); }
          75% { transform: rotateX(270deg) rotateY(270deg) rotateZ(270deg); }
          100% { transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Dice3D;