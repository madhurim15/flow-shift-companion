import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wind } from "lucide-react";

const BreathingExercise = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale" | "complete">("inhale");
  const [breathCount, setBreathCount] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    document.title = "Breathing Exercise - FlowLight";
  }, []);

  useEffect(() => {
    if (!isActive || breathCount >= 3) return;

    const phaseTimings = {
      inhale: 4000,
      hold: 4000,
      exhale: 6000
    };

    const timer = setTimeout(() => {
      if (phase === "inhale") {
        setPhase("hold");
      } else if (phase === "hold") {
        setPhase("exhale");
      } else if (phase === "exhale") {
        const newCount = breathCount + 1;
        setBreathCount(newCount);
        if (newCount >= 3) {
          setPhase("complete");
          setIsActive(false);
        } else {
          setPhase("inhale");
        }
      }
    }, phaseTimings[phase as keyof typeof phaseTimings]);

    return () => clearTimeout(timer);
  }, [phase, isActive, breathCount]);

  const startExercise = () => {
    setIsActive(true);
    setBreathCount(0);
    setPhase("inhale");
  };

  const getPhaseText = () => {
    if (phase === "complete") return "Complete! Well done 🌟";
    return phase === "inhale" ? "Breathe In..." : phase === "hold" ? "Hold..." : "Breathe Out...";
  };

  const getPhaseColor = () => {
    if (phase === "complete") return "bg-primary/20";
    return phase === "inhale" ? "bg-blue-500/20" : phase === "hold" ? "bg-purple-500/20" : "bg-green-500/20";
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
            <h1 className="text-3xl font-bold text-foreground mb-2">3-Breath Reset</h1>
            <p className="text-muted-foreground">Take a moment to center yourself</p>
          </div>

          {!isActive && breathCount === 0 && (
            <Button onClick={startExercise} size="lg" className="mx-auto">
              <Wind className="mr-2 h-5 w-5" />
              Start Breathing
            </Button>
          )}

          {(isActive || breathCount > 0) && (
            <div className="space-y-6">
              <div className={`${getPhaseColor()} rounded-full w-64 h-64 mx-auto flex items-center justify-center transition-all duration-1000 ${isActive ? "scale-100" : "scale-95"}`}>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground mb-2">{getPhaseText()}</p>
                  <p className="text-muted-foreground">Breath {breathCount + 1} of 3</p>
                </div>
              </div>

              {phase === "complete" && (
                <Button onClick={() => navigate("/")} size="lg">
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

export default BreathingExercise;
