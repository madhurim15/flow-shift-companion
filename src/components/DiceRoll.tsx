
import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { moodActionsData } from "@/data/moodActions";
import { diceActions } from "@/data/diceActions";
import { logMoodAction } from "@/utils/moodActionLogger";

// Local Mood type to match usage across the app
export type Mood = {
  id: string;
  label: string;
  emoji: string;
  description: string;
};

interface DiceRollProps {
  mood: Mood;
  onConfirm: (action: string) => void;
}

const DiceRoll: React.FC<DiceRollProps> = ({ mood, onConfirm }) => {
  const [isRolling, setIsRolling] = useState(true);
  const [result, setResult] = useState<string | null>(null);

  const normalizedLabel = useMemo(
    () => mood.label.trim().toLowerCase(),
    [mood.label]
  );

  const optionsForMood = useMemo(() => {
    // Prefer diceActions for STUCK/OVERWHELMED; fallback to existing moodActionsData
    if (normalizedLabel === "stuck" || normalizedLabel === "overwhelmed") {
      return diceActions[normalizedLabel] ?? [];
    }
    const moodActions = moodActionsData[mood.label as keyof typeof moodActionsData] || [];
    return Array.isArray(moodActions) ? moodActions : [];
  }, [normalizedLabel, mood.label]);

  useEffect(() => {
    setIsRolling(true);
    setResult(null);

    const timer = setTimeout(() => {
      setIsRolling(false);
      if (optionsForMood.length > 0) {
        const idx = Math.floor(Math.random() * Math.min(6, optionsForMood.length));
        setResult(optionsForMood[idx]);
      } else {
        setResult("Take a deep breath and try a tiny first step.");
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [optionsForMood, mood.id]);

  const handleConfirm = async () => {
    if (!result) return;
    try {
      await logMoodAction(mood.label, result);
      toast({ title: "Saved", description: `Trying: ${result}` });
    } catch (e) {
      console.error(e);
      toast({ title: "Could not save", description: "Still, you got this.", variant: "destructive" });
    }
    onConfirm(result);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-center">
            Feeling {mood.label.toLowerCase()} {mood.emoji}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6 py-6">
            <div
              aria-label="Rolling a dice"
              className={
                "text-7xl select-none will-change-transform " +
                (isRolling ? "animate-spin" : "animate-scale-in")
              }
              style={{ animationDuration: isRolling ? "1.5s" : undefined }}
            >
              {/* Large dice emoji for a calm, playful feel */}
              <span role="img" aria-hidden="true">🎲</span>
            </div>

            <div className="text-center">
              {isRolling ? (
                <p className="text-muted-foreground animate-fade-in">
                  Rolling your next gentle step...
                </p>
              ) : (
                <div className="space-y-3 animate-enter">
                  <p className="text-sm text-muted-foreground">Try this next</p>
                  <p className="text-xl font-medium leading-relaxed">
                    {result}
                  </p>
                </div>
              )}
            </div>

            {!isRolling && result && (
              <Button onClick={handleConfirm} className="mt-2">
                I’ll try this
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiceRoll;
