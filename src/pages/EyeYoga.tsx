import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, ArrowUp, ArrowDown, ArrowLeftIcon, ArrowRight, RotateCw } from "lucide-react";

type Exercise = "up-down" | "left-right" | "circles" | "focus" | "palming" | "complete";

const EyeYoga = () => {
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [step, setStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    document.title = "Eye Yoga - FlowFocus";
  }, []);

  useEffect(() => {
    if (!exercise || exercise === "complete") return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Move to next exercise
          const exercises: Exercise[] = ["up-down", "left-right", "circles", "focus", "palming"];
          const currentIndex = exercises.indexOf(exercise);
          if (currentIndex < exercises.length - 1) {
            setExercise(exercises[currentIndex + 1]);
            return 15; // 15 seconds per exercise
          } else {
            setExercise("complete");
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [exercise]);

  const startExercise = () => {
    setExercise("up-down");
    setTimeLeft(15);
  };

  const getExerciseInfo = () => {
    switch (exercise) {
      case "up-down":
        return {
          title: "Up & Down",
          instruction: "Look up, then down. Repeat slowly.",
          icon: <div className="flex flex-col gap-2"><ArrowUp className="w-8 h-8" /><ArrowDown className="w-8 h-8" /></div>
        };
      case "left-right":
        return {
          title: "Left & Right",
          instruction: "Look left, then right. Repeat slowly.",
          icon: <div className="flex gap-2"><ArrowLeftIcon className="w-8 h-8" /><ArrowRight className="w-8 h-8" /></div>
        };
      case "circles":
        return {
          title: "Eye Circles",
          instruction: "Roll your eyes in slow circles.",
          icon: <RotateCw className="w-12 h-12" />
        };
      case "focus":
        return {
          title: "Near & Far",
          instruction: "Focus on your finger close, then something far away.",
          icon: <Eye className="w-12 h-12" />
        };
      case "palming":
        return {
          title: "Palming",
          instruction: "Cup palms over closed eyes. Breathe deeply.",
          icon: <span className="text-4xl">🙌</span>
        };
      case "complete":
        return {
          title: "Complete!",
          instruction: "Your eyes feel refreshed! 👀✨",
          icon: <span className="text-4xl">✨</span>
        };
      default:
        return {
          title: "Ready",
          instruction: "5 exercises • ~90 seconds",
          icon: <Eye className="w-12 h-12" />
        };
    }
  };

  const info = getExerciseInfo();
  const exerciseNum = exercise ? ["up-down", "left-right", "circles", "focus", "palming"].indexOf(exercise) + 1 : 0;

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
            <h1 className="text-3xl font-bold text-foreground mb-2">Eye Yoga</h1>
            <p className="text-muted-foreground">Relieve eye strain with gentle exercises</p>
          </div>

          {!exercise && (
            <Button onClick={startExercise} size="lg" className="mx-auto">
              <Eye className="mr-2 h-5 w-5" />
              Start Eye Yoga
            </Button>
          )}

          {exercise && (
            <div className="space-y-6">
              <div className="bg-cyan-500/20 rounded-full w-64 h-64 mx-auto flex items-center justify-center transition-all duration-500">
                <div className="text-center p-4">
                  <div className="mb-4 flex justify-center text-cyan-400">{info.icon}</div>
                  <p className="text-xl font-bold text-foreground mb-2">{info.title}</p>
                  <p className="text-sm text-muted-foreground mb-3">{info.instruction}</p>
                  {exercise !== "complete" && (
                    <>
                      <p className="text-3xl font-mono text-foreground">{timeLeft}s</p>
                      <p className="text-xs text-muted-foreground mt-2">Exercise {exerciseNum} of 5</p>
                    </>
                  )}
                </div>
              </div>

              {exercise === "complete" && (
                <Button onClick={() => navigate("/app")} size="lg">
                  Continue with clear vision
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EyeYoga;
