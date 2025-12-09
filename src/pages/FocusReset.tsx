import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Brain, Eye, Wind, Target } from "lucide-react";

type Step = "intro" | "eyes" | "breathe" | "intention" | "complete";

const FocusReset = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("intro");
  const [timeLeft, setTimeLeft] = useState(0);
  const [intention, setIntention] = useState("");

  useEffect(() => {
    document.title = "Focus Reset - FlowFocus";
  }, []);

  useEffect(() => {
    if (step === "intro" || step === "intention" || step === "complete") return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (step === "eyes") {
            setStep("breathe");
            return 20;
          } else if (step === "breathe") {
            setStep("intention");
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step]);

  const startReset = () => {
    setStep("eyes");
    setTimeLeft(10);
  };

  const completeIntention = () => {
    setStep("complete");
  };

  const getStepInfo = () => {
    switch (step) {
      case "eyes":
        return {
          title: "Close Your Eyes",
          instruction: "Let go of visual stimulation",
          icon: <Eye className="w-12 h-12" />,
          color: "bg-indigo-500/20"
        };
      case "breathe":
        return {
          title: "Deep Breaths",
          instruction: "Inhale slowly... exhale completely",
          icon: <Wind className="w-12 h-12" />,
          color: "bg-blue-500/20"
        };
      case "intention":
        return {
          title: "Set Intention",
          instruction: "What will you focus on next?",
          icon: <Target className="w-12 h-12" />,
          color: "bg-emerald-500/20"
        };
      case "complete":
        return {
          title: "You're Reset! 🧠",
          instruction: "Go make it happen",
          icon: <Brain className="w-12 h-12" />,
          color: "bg-primary/20"
        };
      default:
        return {
          title: "Focus Reset",
          instruction: "3-step micro-break to regain clarity",
          icon: <Brain className="w-12 h-12" />,
          color: "bg-muted"
        };
    }
  };

  const info = getStepInfo();

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
            <h1 className="text-3xl font-bold text-foreground mb-2">Focus Reset</h1>
            <p className="text-muted-foreground">Clear your mind in 60 seconds</p>
          </div>

          {step === "intro" && (
            <Button onClick={startReset} size="lg" className="mx-auto">
              <Brain className="mr-2 h-5 w-5" />
              Start Focus Reset
            </Button>
          )}

          {step !== "intro" && step !== "intention" && (
            <div className="space-y-6">
              <div className={`${info.color} rounded-full w-64 h-64 mx-auto flex items-center justify-center transition-all duration-500`}>
                <div className="text-center p-4">
                  <div className="mb-4 flex justify-center text-foreground">{info.icon}</div>
                  <p className="text-xl font-bold text-foreground mb-2">{info.title}</p>
                  <p className="text-sm text-muted-foreground mb-3">{info.instruction}</p>
                  {step !== "complete" && (
                    <p className="text-4xl font-mono text-foreground">{timeLeft}s</p>
                  )}
                </div>
              </div>

              {step === "complete" && (
                <Button onClick={() => navigate("/app")} size="lg">
                  Continue focused
                </Button>
              )}
            </div>
          )}

          {step === "intention" && (
            <div className="space-y-6">
              <div className={`${info.color} rounded-2xl p-6 mx-auto max-w-sm`}>
                <div className="text-center mb-4">
                  <Target className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
                  <p className="text-xl font-bold text-foreground">{info.title}</p>
                  <p className="text-sm text-muted-foreground">{info.instruction}</p>
                </div>
                <Textarea
                  value={intention}
                  onChange={(e) => setIntention(e.target.value)}
                  placeholder="I will focus on..."
                  className="resize-none min-h-[80px] text-center"
                  maxLength={100}
                />
              </div>
              <Button onClick={completeIntention} size="lg" disabled={!intention.trim()}>
                Lock In Focus
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FocusReset;
