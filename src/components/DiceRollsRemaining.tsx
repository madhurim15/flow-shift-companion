import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Flame } from "lucide-react";
import { useDiceSystem, DiceSystemResult } from "@/hooks/useDiceSystem";

interface DiceRollsRemainingProps {
  show: boolean;
}

const DiceRollsRemaining: React.FC<DiceRollsRemainingProps> = ({ show }) => {
  const { getDiceSystemStatus } = useDiceSystem();
  const [status, setStatus] = useState<DiceSystemResult | null>(null);

  useEffect(() => {
    if (!show) return;
    
    const checkStatus = async () => {
      const result = await getDiceSystemStatus();
      setStatus(result);
    };

    checkStatus();
  }, [show, getDiceSystemStatus]);

  if (!show || !status || status.remaining_rolls === 3) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <div className="flex items-center gap-2 bg-background/90 backdrop-blur-sm border border-border rounded-full px-3 py-1.5 shadow-lg">
        <Flame className="text-orange-500" size={14} />
        <Badge variant={status.remaining_rolls === 0 ? "destructive" : "secondary"} className="text-xs">
          {status.remaining_rolls}/3
        </Badge>
        <span className="text-xs text-muted-foreground">rolls left</span>
      </div>
    </div>
  );
};

export default DiceRollsRemaining;