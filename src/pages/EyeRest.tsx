import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Check } from "lucide-react";

const EyeRest = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(20);
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    document.title = "Eye Rest - FlowFocus";
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

  const startRest = () => {
    setIsActive(true);
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
              <Eye className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">20-Second Eye Rest</h1>
            <p className="text-muted-foreground">Look 20 feet away for 20 seconds</p>
          </div>

          {!isActive && !isComplete && (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6 max-w-md mx-auto">
                <p className="text-foreground mb-4">
                  The 20-20-20 rule: Every 20 minutes, look at something 20 feet away for 20 seconds
                </p>
                <p className="text-muted-foreground text-sm">
                  This helps reduce eye strain from screens
                </p>
              </div>
              <Button onClick={startRest} size="lg">
                <Eye className="mr-2 h-5 w-5" />
                Start Eye Rest
              </Button>
            </div>
          )}

          {isActive && !isComplete && (
            <div className="space-y-6">
              <div className="bg-primary/10 rounded-full w-48 h-48 mx-auto flex items-center justify-center">
                <div className="text-6xl font-bold text-foreground">{timeLeft}</div>
              </div>
              <p className="text-lg text-muted-foreground animate-pulse">
                Look at something far away...
              </p>
            </div>
          )}

          {isComplete && (
            <div className="space-y-6">
              <div className="bg-primary/10 rounded-full w-32 h-32 mx-auto flex items-center justify-center">
                <Check className="h-16 w-16 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Eyes refreshed! 👀</h2>
                <p className="text-muted-foreground">Your eyes feel better already</p>
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

export default EyeRest;
