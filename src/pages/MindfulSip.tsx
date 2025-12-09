import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Coffee, ChevronRight } from "lucide-react";

type Step = "intro" | "observe" | "smell" | "sip" | "taste" | "gratitude" | "complete";

const steps: { id: Step; title: string; instruction: string; emoji: string }[] = [
  { id: "observe", title: "Observe", instruction: "Look at your beverage. Notice its color and texture.", emoji: "👀" },
  { id: "smell", title: "Smell", instruction: "Bring it close. Breathe in the aroma slowly.", emoji: "👃" },
  { id: "sip", title: "Sip", instruction: "Take a small sip. Let it rest on your tongue.", emoji: "☕" },
  { id: "taste", title: "Taste", instruction: "Notice the flavors. Is it sweet, bitter, smooth?", emoji: "👅" },
  { id: "gratitude", title: "Gratitude", instruction: "Appreciate this moment of pause and warmth.", emoji: "🙏" },
];

const MindfulSip = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>("intro");
  const [stepIndex, setStepIndex] = useState(-1);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    document.title = "Mindful Sip - FlowFocus";
  }, []);

  useEffect(() => {
    if (currentStep === "intro" || currentStep === "complete") return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Auto-advance after timer
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentStep]);

  const startExercise = () => {
    setStepIndex(0);
    setCurrentStep(steps[0].id);
    setTimeLeft(10);
  };

  const nextStep = () => {
    if (stepIndex < steps.length - 1) {
      const newIndex = stepIndex + 1;
      setStepIndex(newIndex);
      setCurrentStep(steps[newIndex].id);
      setTimeLeft(10);
    } else {
      setCurrentStep("complete");
    }
  };

  const getCurrentStepInfo = () => {
    if (currentStep === "intro") {
      return { title: "Mindful Sip", instruction: "Grab your favorite beverage", emoji: "☕" };
    }
    if (currentStep === "complete") {
      return { title: "Present!", instruction: "You practiced mindfulness 🧘", emoji: "✨" };
    }
    return steps[stepIndex];
  };

  const info = getCurrentStepInfo();

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
            <h1 className="text-3xl font-bold text-foreground mb-2">Mindful Sip</h1>
            <p className="text-muted-foreground">Transform your drink into a mindfulness moment</p>
          </div>

          {currentStep === "intro" && (
            <div className="space-y-6">
              <div className="bg-amber-500/20 rounded-full w-64 h-64 mx-auto flex items-center justify-center">
                <div className="text-center p-4">
                  <span className="text-6xl block mb-4">☕</span>
                  <p className="text-lg text-muted-foreground">Coffee, tea, water - anything works!</p>
                </div>
              </div>
              <Button onClick={startExercise} size="lg" className="mx-auto">
                <Coffee className="mr-2 h-5 w-5" />
                I have my drink
              </Button>
            </div>
          )}

          {currentStep !== "intro" && currentStep !== "complete" && (
            <div className="space-y-6">
              <div className="bg-amber-500/20 rounded-full w-64 h-64 mx-auto flex items-center justify-center transition-all duration-500">
                <div className="text-center p-4">
                  <span className="text-6xl block mb-2">{info.emoji}</span>
                  <p className="text-xl font-bold text-foreground mb-2">{info.title}</p>
                  <p className="text-sm text-muted-foreground mb-3">{info.instruction}</p>
                  <p className="text-3xl font-mono text-foreground">{timeLeft}s</p>
                </div>
              </div>
              
              {/* Progress dots */}
              <div className="flex justify-center gap-2">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i <= stepIndex ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              <Button onClick={nextStep} size="lg">
                {stepIndex < steps.length - 1 ? (
                  <>
                    Next <ChevronRight className="ml-1 h-4 w-4" />
                  </>
                ) : (
                  "Complete"
                )}
              </Button>
            </div>
          )}

          {currentStep === "complete" && (
            <div className="space-y-6">
              <div className="bg-primary/20 rounded-full w-64 h-64 mx-auto flex items-center justify-center">
                <div className="text-center p-4">
                  <span className="text-6xl block mb-4">✨</span>
                  <p className="text-2xl font-bold text-foreground mb-2">Beautifully Present</p>
                  <p className="text-muted-foreground">You practiced mindfulness!</p>
                </div>
              </div>
              <Button onClick={() => navigate("/app")} size="lg">
                Continue mindfully
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MindfulSip;
