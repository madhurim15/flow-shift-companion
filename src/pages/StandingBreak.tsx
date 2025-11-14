import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Check } from "lucide-react";

const StandingBreak = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    document.title = "Standing Break - FlowLight";
  }, []);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) {
      if (timeLeft === 0) {
        setIsComplete(true);
        setIsActive(false);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  const startBreak = () => {
    setIsActive(true);
  };

  const movements = [
    "Shake out your arms",
    "Roll your shoulders",
    "Stretch side to side",
    "Take deep breaths"
  ];

  const getCurrentMovement = () => {
    const elapsed = 60 - timeLeft;
    const movementIndex = Math.floor(elapsed / 15);
    return movements[Math.min(movementIndex, movements.length - 1)];
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="space-y-8 text-center">
          <div>
            <div className="bg-primary/10 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <User className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Standing Break</h1>
            <p className="text-muted-foreground">Stand up and move for 60 seconds</p>
          </div>

          {!isActive && !isComplete && (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6 max-w-md mx-auto">
                <p className="text-foreground mb-4">
                  Break the sitting cycle with a quick standing break
                </p>
                <div className="space-y-2 text-left">
                  {movements.map((movement, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm text-muted-foreground">{movement}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={startBreak} size="lg">
                <User className="mr-2 h-5 w-5" />
                Start Standing Break
              </Button>
            </div>
          )}

          {isActive && !isComplete && (
            <div className="space-y-6">
              <div className="bg-primary/10 rounded-full w-48 h-48 mx-auto flex items-center justify-center">
                <div className="text-6xl font-bold text-foreground">{timeLeft}</div>
              </div>
              <p className="text-lg text-foreground font-medium animate-pulse">
                {getCurrentMovement()}
              </p>
            </div>
          )}

          {isComplete && (
            <div className="space-y-6">
              <div className="bg-primary/10 rounded-full w-32 h-32 mx-auto flex items-center justify-center">
                <Check className="h-16 w-16 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Movement complete! 🎉</h2>
                <p className="text-muted-foreground">Your body feels more alive</p>
              </div>
              <Button onClick={() => navigate("/")} size="lg">
                Continue with your day
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StandingBreak;
