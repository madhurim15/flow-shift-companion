import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Moon, Play, Bell } from "lucide-react";

const PowerNap = () => {
  const navigate = useNavigate();
  const [duration, setDuration] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    document.title = "Power Nap - FlowFocus";
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsActive(false);
          setIsComplete(true);
          // Play wake-up sound
          try {
            const audio = new Audio('/notification.mp3');
            audio.play().catch(() => {});
          } catch {}
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive]);

  const startNap = (minutes: number) => {
    setDuration(minutes);
    setTimeLeft(minutes * 60);
    setIsActive(true);
    setIsComplete(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const durations = [
    { minutes: 10, label: "Quick Reset", description: "Light refresh" },
    { minutes: 15, label: "Power Nap", description: "Optimal recovery" },
    { minutes: 20, label: "Deep Rest", description: "Full restoration" },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/app")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="space-y-8 text-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Power Nap Timer</h1>
            <p className="text-muted-foreground">Rest and recharge your mind</p>
          </div>

          {!isActive && !isComplete && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Choose your nap duration:</p>
              <div className="grid gap-4">
                {durations.map(({ minutes, label, description }) => (
                  <Button
                    key={minutes}
                    onClick={() => startNap(minutes)}
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center"
                  >
                    <span className="text-lg font-semibold">{label}</span>
                    <span className="text-sm text-muted-foreground">{minutes} min • {description}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {isActive && (
            <div className="space-y-6">
              <div className="bg-indigo-900/30 rounded-full w-64 h-64 mx-auto flex items-center justify-center">
                <div className="text-center">
                  <Moon className="w-12 h-12 mx-auto mb-4 text-indigo-400" />
                  <p className="text-5xl font-mono text-foreground mb-2">{formatTime(timeLeft)}</p>
                  <p className="text-muted-foreground">Close your eyes and rest</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => { setIsActive(false); setIsComplete(true); }}>
                End Early
              </Button>
            </div>
          )}

          {isComplete && (
            <div className="space-y-6">
              <div className="bg-primary/20 rounded-full w-64 h-64 mx-auto flex items-center justify-center animate-pulse">
                <div className="text-center">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <p className="text-2xl font-bold text-foreground mb-2">Wake Up! 🌅</p>
                  <p className="text-muted-foreground">You're recharged and ready</p>
                </div>
              </div>
              <Button onClick={() => navigate("/app")} size="lg">
                Continue refreshed
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PowerNap;
