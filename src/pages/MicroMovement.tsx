import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Dumbbell, RefreshCw } from "lucide-react";

interface Challenge {
  name: string;
  emoji: string;
  duration: number;
  instruction: string;
}

const challenges: Challenge[] = [
  { name: "Jumping Jacks", emoji: "⭐", duration: 30, instruction: "Jump and spread your arms and legs!" },
  { name: "High Knees", emoji: "🦵", duration: 30, instruction: "Run in place with high knees!" },
  { name: "Arm Circles", emoji: "💪", duration: 30, instruction: "Big circles forward, then backward!" },
  { name: "Squats", emoji: "🏋️", duration: 30, instruction: "Sit back and stand up, keep back straight!" },
  { name: "Wall Push-ups", emoji: "🧱", duration: 30, instruction: "Push against the wall, 10 reps!" },
  { name: "Toe Touches", emoji: "🦶", duration: 30, instruction: "Reach down to your toes, stretch!" },
  { name: "Desk Dips", emoji: "💺", duration: 30, instruction: "Use your chair for tricep dips!" },
  { name: "Calf Raises", emoji: "🦵", duration: 30, instruction: "Rise up on your toes, hold, lower!" },
];

const MicroMovement = () => {
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    document.title = "Micro Movement - FlowFocus";
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsActive(false);
          setIsComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive]);

  const pickRandomChallenge = () => {
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    setChallenge(randomChallenge);
    setTimeLeft(randomChallenge.duration);
    setIsActive(true);
    setIsComplete(false);
  };

  const tryAnother = () => {
    setIsComplete(false);
    pickRandomChallenge();
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Micro Movement</h1>
            <p className="text-muted-foreground">30-second random movement challenge!</p>
          </div>

          {!challenge && !isComplete && (
            <Button onClick={pickRandomChallenge} size="lg" className="mx-auto">
              <Dumbbell className="mr-2 h-5 w-5" />
              Get Random Challenge
            </Button>
          )}

          {challenge && isActive && (
            <div className="space-y-6">
              <div className="bg-orange-500/20 rounded-full w-64 h-64 mx-auto flex items-center justify-center animate-pulse">
                <div className="text-center p-4">
                  <span className="text-6xl block mb-2">{challenge.emoji}</span>
                  <p className="text-xl font-bold text-foreground mb-2">{challenge.name}</p>
                  <p className="text-sm text-muted-foreground mb-3">{challenge.instruction}</p>
                  <p className="text-5xl font-mono text-foreground">{timeLeft}s</p>
                </div>
              </div>
            </div>
          )}

          {isComplete && challenge && (
            <div className="space-y-6">
              <div className="bg-primary/20 rounded-full w-64 h-64 mx-auto flex items-center justify-center">
                <div className="text-center p-4">
                  <span className="text-6xl block mb-4">🎉</span>
                  <p className="text-2xl font-bold text-foreground mb-2">Challenge Complete!</p>
                  <p className="text-muted-foreground">You crushed those {challenge.name}!</p>
                </div>
              </div>
              <div className="flex gap-4 justify-center">
                <Button onClick={tryAnother} variant="outline" size="lg">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Another
                </Button>
                <Button onClick={() => navigate("/app")} size="lg">
                  Done for now
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MicroMovement;
