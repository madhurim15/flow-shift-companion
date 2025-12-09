import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Square } from "lucide-react";

type Phase = "ready" | "inhale" | "hold1" | "exhale" | "hold2" | "complete";

const BoxBreathing = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("ready");
  const [cycleCount, setCycleCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [cursorPosition, setCursorPosition] = useState({ side: 0, progress: 0 }); // 0=top, 1=right, 2=bottom, 3=left

  const CYCLES = 4;
  const PHASE_DURATION = 4; // 4 seconds per side

  useEffect(() => {
    document.title = "Box Breathing - FlowFocus";
  }, []);

  useEffect(() => {
    if (phase === "ready" || phase === "complete") return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        // Update cursor progress
        setCursorPosition(p => ({ ...p, progress: ((PHASE_DURATION - prev + 1) / PHASE_DURATION) * 100 }));
        
        if (prev <= 1) {
          // Move to next phase
          const phases: Phase[] = ["inhale", "hold1", "exhale", "hold2"];
          const currentIndex = phases.indexOf(phase as any);
          
          if (currentIndex === 3) {
            // End of cycle
            const newCycleCount = cycleCount + 1;
            setCycleCount(newCycleCount);
            if (newCycleCount >= CYCLES) {
              setPhase("complete");
              return 0;
            }
            setPhase("inhale");
            setCursorPosition({ side: 0, progress: 0 });
          } else {
            setPhase(phases[currentIndex + 1]);
            setCursorPosition({ side: currentIndex + 1, progress: 0 });
          }
          return PHASE_DURATION;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, cycleCount]);

  const startExercise = () => {
    setPhase("inhale");
    setTimeLeft(PHASE_DURATION);
    setCycleCount(0);
    setCursorPosition({ side: 0, progress: 0 });
  };

  const getPhaseText = () => {
    switch (phase) {
      case "inhale": return "Breathe In";
      case "hold1": return "Hold";
      case "exhale": return "Breathe Out";
      case "hold2": return "Hold";
      case "complete": return "Complete! 🌟";
      default: return "Ready";
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case "inhale": return "text-blue-400";
      case "hold1": return "text-purple-400";
      case "exhale": return "text-green-400";
      case "hold2": return "text-amber-400";
      default: return "text-primary";
    }
  };

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
            <h1 className="text-3xl font-bold text-foreground mb-2">Box Breathing</h1>
            <p className="text-muted-foreground">4-4-4-4 pattern for calm focus</p>
          </div>

          {phase === "ready" && (
            <Button onClick={startExercise} size="lg" className="mx-auto">
              <Square className="mr-2 h-5 w-5" />
              Start Box Breathing
            </Button>
          )}

          {phase !== "ready" && (
            <div className="space-y-6">
              {/* Box visualization */}
              <div className="relative w-64 h-64 mx-auto">
                {/* Box outline */}
                <div className="absolute inset-0 border-4 border-muted rounded-lg" />
                
                {/* Animated sides */}
                {phase !== "complete" && (
                  <>
                    {/* Top side (inhale) */}
                    <div 
                      className={`absolute top-0 left-0 h-1 bg-blue-400 transition-all duration-100 rounded`}
                      style={{ width: cursorPosition.side === 0 ? `${cursorPosition.progress}%` : cursorPosition.side > 0 ? '100%' : '0%' }}
                    />
                    {/* Right side (hold1) */}
                    <div 
                      className={`absolute top-0 right-0 w-1 bg-purple-400 transition-all duration-100 rounded`}
                      style={{ height: cursorPosition.side === 1 ? `${cursorPosition.progress}%` : cursorPosition.side > 1 ? '100%' : '0%' }}
                    />
                    {/* Bottom side (exhale) */}
                    <div 
                      className={`absolute bottom-0 right-0 h-1 bg-green-400 transition-all duration-100 rounded`}
                      style={{ width: cursorPosition.side === 2 ? `${cursorPosition.progress}%` : cursorPosition.side > 2 ? '100%' : '0%', transform: 'scaleX(-1)' }}
                    />
                    {/* Left side (hold2) */}
                    <div 
                      className={`absolute bottom-0 left-0 w-1 bg-amber-400 transition-all duration-100 rounded`}
                      style={{ height: cursorPosition.side === 3 ? `${cursorPosition.progress}%` : '0%', transform: 'scaleY(-1)' }}
                    />
                  </>
                )}
                
                {/* Center content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className={`text-2xl font-bold mb-2 ${getPhaseColor()}`}>{getPhaseText()}</p>
                    {phase !== "complete" && (
                      <>
                        <p className="text-4xl font-mono text-foreground">{timeLeft}</p>
                        <p className="text-sm text-muted-foreground mt-2">Cycle {cycleCount + 1} of {CYCLES}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {phase === "complete" && (
                <Button onClick={() => navigate("/app")} size="lg">
                  Continue with calm focus
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoxBreathing;
