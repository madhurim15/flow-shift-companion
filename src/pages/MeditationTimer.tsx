import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";

type Phase = "ready" | "settle" | "focus" | "return" | "complete";

const MeditationTimer = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("ready");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    document.title = "Meditation Timer - FlowFocus";
  }, []);

  useEffect(() => {
    if (!isActive || phase === "ready" || phase === "complete") return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Move to next phase
          if (phase === "settle") {
            setPhase("focus");
            return 60; // 60 seconds focus
          } else if (phase === "focus") {
            setPhase("return");
            return 30; // 30 seconds return
          } else if (phase === "return") {
            setPhase("complete");
            setIsActive(false);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase]);

  const startMeditation = () => {
    setIsActive(true);
    setPhase("settle");
    setTimeLeft(30); // 30 seconds settle
  };

  const getPhaseInfo = () => {
    switch (phase) {
      case "settle":
        return { text: "Settle In", instruction: "Close your eyes and relax your body", color: "bg-blue-500/20" };
      case "focus":
        return { text: "Focus", instruction: "Gently focus on your breath", color: "bg-purple-500/20" };
      case "return":
        return { text: "Return", instruction: "Slowly bring awareness back", color: "bg-emerald-500/20" };
      case "complete":
        return { text: "Complete", instruction: "You did it! 🧘", color: "bg-primary/20" };
      default:
        return { text: "Ready", instruction: "2-minute guided meditation", color: "bg-muted" };
    }
  };

  const phaseInfo = getPhaseInfo();

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
            <h1 className="text-3xl font-bold text-foreground mb-2">2-Minute Meditation</h1>
            <p className="text-muted-foreground">A quick reset for your mind</p>
          </div>

          {phase === "ready" && (
            <Button onClick={startMeditation} size="lg" className="mx-auto">
              <Sparkles className="mr-2 h-5 w-5" />
              Start Meditation
            </Button>
          )}

          {phase !== "ready" && (
            <div className="space-y-6">
              <div className={`${phaseInfo.color} rounded-full w-64 h-64 mx-auto flex items-center justify-center transition-all duration-1000 animate-pulse`}>
                <div className="text-center p-4">
                  <p className="text-2xl font-bold text-foreground mb-2">{phaseInfo.text}</p>
                  <p className="text-muted-foreground text-sm mb-3">{phaseInfo.instruction}</p>
                  {phase !== "complete" && (
                    <p className="text-4xl font-mono text-foreground">{timeLeft}s</p>
                  )}
                </div>
              </div>

              {phase === "complete" && (
                <Button onClick={() => navigate("/app")} size="lg">
                  Continue with your day
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeditationTimer;
