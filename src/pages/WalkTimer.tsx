import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Pause, Check } from "lucide-react";

const WalkTimer = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    document.title = "Walk Timer - FlowFocus";
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

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((300 - timeLeft) / 300) * 100;

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
            <h1 className="text-3xl font-bold text-foreground mb-2">5-Minute Walk</h1>
            <p className="text-muted-foreground">Step away and move your body</p>
          </div>

          {!isComplete ? (
            <div className="space-y-6">
              <div className="relative w-64 h-64 mx-auto">
                <svg className="transform -rotate-90 w-64 h-64">
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-muted"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 120}`}
                    strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                    className="text-primary transition-all duration-1000"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl font-bold text-foreground">{formatTime(timeLeft)}</div>
                </div>
              </div>

              <Button onClick={toggleTimer} size="lg">
                {isActive ? (
                  <>
                    <Pause className="mr-2 h-5 w-5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" />
                    {timeLeft === 300 ? "Start Walk" : "Resume"}
                  </>
                )}
              </Button>

              {isActive && (
                <p className="text-muted-foreground animate-pulse">
                  Keep walking, you're doing great! 🚶‍♀️
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-primary/10 rounded-full w-32 h-32 mx-auto flex items-center justify-center">
                <Check className="h-16 w-16 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Walk complete! 🎉</h2>
                <p className="text-muted-foreground">You took 5 minutes for yourself</p>
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

export default WalkTimer;
