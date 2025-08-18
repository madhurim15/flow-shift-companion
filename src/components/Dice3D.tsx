import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

interface Dice3DProps {
  mood: { id: string; label: string; emoji: string; description: string };
  action: string;
  diceRollId: string;
  onStartAction: (diceRollId: string, action: string, immediate?: boolean) => void;
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
  const [currentDiceFace, setCurrentDiceFace] = useState("⚀");

  // Dice faces for realistic cycling
  const diceFaces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

  // Generate pleasant rolling and result sounds
  const playRollingSound = () => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Gentle rolling sound - soft sine wave with frequency modulation
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(180, audioContext.currentTime + 1.8);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.8);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1.8);
  };

  const playResultSound = () => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Pleasant chime sound - major chord
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 0.1 + index * 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
      
      oscillator.start(audioContext.currentTime + index * 0.1);
      oscillator.stop(audioContext.currentTime + 1);
    });
  };

  useEffect(() => {
    playRollingSound();

    // Cycle through dice faces during rolling
    const faceInterval = setInterval(() => {
      setCurrentDiceFace(diceFaces[Math.floor(Math.random() * diceFaces.length)]);
    }, 150);

    const rollTimer = setTimeout(() => {
      clearInterval(faceInterval);
      setCurrentDiceFace(diceFaces[Math.floor(Math.random() * diceFaces.length)]);
      setIsRolling(false);
      playResultSound();
      setTimeout(() => setShowAction(true), 400);
    }, 1800); // Reduced to 1.8 seconds for better pacing

    return () => {
      clearTimeout(rollTimer);
      clearInterval(faceInterval);
    };
  }, [soundEnabled]);

  const handleStartAction = () => {
    onStartAction(diceRollId, action, false);
  };

  const handleMarkDone = () => {
    // For immediate completion, pass the immediate flag
    onStartAction(diceRollId, action, true);
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
                className={`text-8xl select-none transition-all duration-500 ${
                  isRolling
                    ? "dice-natural-roll"
                    : "dice-3d-settled animate-scale-in"
                }`}
                style={{
                  transformStyle: "preserve-3d",
                  filter: isRolling ? "blur(0.5px)" : "none",
                }}
              >
                {currentDiceFace}
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

                <div className="flex gap-3">
                  <Button
                    onClick={handleStartAction}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="lg"
                  >
                    🚀 Start Now
                  </Button>
                  <Button
                    onClick={handleMarkDone}
                    variant="outline"
                    className="flex-1 border-primary/50 text-primary hover:bg-primary/10"
                    size="lg"
                  >
                    ✅ Mark as Done
                  </Button>
                </div>
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

      {/* CSS for gentle 3D effects */}
      <style>{`
        .dice-natural-roll {
          animation: naturalRoll 1.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          transform-origin: center;
        }
        
        .dice-3d-settled {
          transform: rotateX(10deg) rotateY(-10deg);
          text-shadow: 2px 2px 8px rgba(0,0,0,0.15);
        }
        
        @keyframes naturalRoll {
          0% { 
            transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1); 
          }
          20% { 
            transform: rotateX(90deg) rotateY(45deg) rotateZ(30deg) scale(1.05);
          }
          40% { 
            transform: rotateX(180deg) rotateY(90deg) rotateZ(60deg) scale(1.1);
          }
          60% { 
            transform: rotateX(270deg) rotateY(135deg) rotateZ(90deg) scale(1.05);
          }
          80% { 
            transform: rotateX(340deg) rotateY(170deg) rotateZ(110deg) scale(1.02);
          }
          95% {
            transform: rotateX(355deg) rotateY(185deg) rotateZ(125deg) scale(1.01);
          }
          100% { 
            transform: rotateX(360deg) rotateY(180deg) rotateZ(120deg) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default Dice3D;