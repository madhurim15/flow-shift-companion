import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Play, Check } from "lucide-react";

const stretches = [
  { name: "Neck Rolls", duration: 20, instruction: "Slowly roll your neck in circles, 5 times each direction" },
  { name: "Shoulder Shrugs", duration: 15, instruction: "Lift shoulders to ears, hold for 3 seconds, release. Repeat 5 times" },
  { name: "Seated Twist", duration: 20, instruction: "Twist your torso to the right, hold 10 seconds. Repeat on left" },
  { name: "Wrist Circles", duration: 15, instruction: "Make circles with your wrists, 10 times each direction" },
  { name: "Deep Breath", duration: 10, instruction: "Take 3 deep breaths, filling your lungs completely" }
];

const MicroStretch = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(stretches[0].duration);
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    document.title = "Micro Stretch - FlowLight";
  }, []);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (currentIndex < stretches.length - 1) {
            setCurrentIndex(currentIndex + 1);
            return stretches[currentIndex + 1].duration;
          } else {
            setIsActive(false);
            setIsComplete(true);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeLeft, currentIndex]);

  const startRoutine = () => {
    setIsActive(true);
    setCurrentIndex(0);
    setTimeLeft(stretches[0].duration);
  };

  const progress = ((currentIndex * 100) / stretches.length) + ((stretches[currentIndex].duration - timeLeft) / stretches[currentIndex].duration) * (100 / stretches.length);

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

        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">2-Minute Desk Stretch</h1>
            <p className="text-muted-foreground">Quick stretches to reset your body</p>
          </div>

          {!isActive && !isComplete && (
            <Button onClick={startRoutine} size="lg" className="w-full">
              <Play className="mr-2 h-5 w-5" />
              Start Routine
            </Button>
          )}

          {isActive && (
            <div className="space-y-6">
              <Progress value={progress} className="h-2" />
              
              <div className="bg-card border rounded-lg p-8 text-center space-y-4">
                <div className="text-6xl font-bold text-primary">{timeLeft}s</div>
                <h2 className="text-2xl font-semibold text-foreground">{stretches[currentIndex].name}</h2>
                <p className="text-muted-foreground text-lg">{stretches[currentIndex].instruction}</p>
                <p className="text-sm text-muted-foreground">Exercise {currentIndex + 1} of {stretches.length}</p>
              </div>
            </div>
          )}

          {isComplete && (
            <div className="text-center space-y-6">
              <div className="bg-primary/10 rounded-full w-32 h-32 mx-auto flex items-center justify-center">
                <Check className="h-16 w-16 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Great job! 🌟</h2>
                <p className="text-muted-foreground">Your body thanks you</p>
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

export default MicroStretch;
