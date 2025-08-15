import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Clock, RotateCcw } from "lucide-react";
import { useDiceSystem, DiceSystemResult } from "@/hooks/useDiceSystem";

interface DiceSystemStatusProps {
  onStatusUpdate?: (status: DiceSystemResult) => void;
}

const DiceSystemStatus: React.FC<DiceSystemStatusProps> = ({ onStatusUpdate }) => {
  const { getDiceSystemStatus } = useDiceSystem();
  const [status, setStatus] = useState<DiceSystemResult | null>(null);
  const [cooldownText, setCooldownText] = useState<string>("");

  useEffect(() => {
    const checkStatus = async () => {
      const result = await getDiceSystemStatus();
      setStatus(result);
      onStatusUpdate?.(result);
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [getDiceSystemStatus, onStatusUpdate]);

  useEffect(() => {
    if (!status?.cooldown_expires_at) {
      setCooldownText("");
      return;
    }

    const updateCooldown = () => {
      const now = new Date();
      const expires = new Date(status.cooldown_expires_at!);
      const diff = expires.getTime() - now.getTime();

      if (diff <= 0) {
        setCooldownText("");
        // Refresh status when cooldown expires
        getDiceSystemStatus().then(setStatus);
        return;
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCooldownText(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);

    return () => clearInterval(interval);
  }, [status?.cooldown_expires_at, getDiceSystemStatus]);

  if (!status) return null;

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Flame className="text-orange-500" size={16} />
              <span className="text-sm font-medium">
                Dice Rolls
              </span>
            </div>
            <Badge variant={status.remaining_rolls === 0 ? "destructive" : "secondary"}>
              {status.remaining_rolls}/3
            </Badge>
          </div>

          {cooldownText && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock size={14} />
              <span>{cooldownText}</span>
            </div>
          )}
        </div>

        {status.remaining_rolls === 0 && (
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <RotateCcw size={12} />
            <span>Resets tomorrow</span>
          </div>
        )}

        {!status.success && status.error === 'Cooldown active' && (
          <div className="mt-2 text-xs text-amber-600">
            Next roll available in {cooldownText}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiceSystemStatus;