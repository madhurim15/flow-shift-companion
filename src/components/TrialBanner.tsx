import { useTrialContext } from "@/contexts/TrialContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock } from "lucide-react";

export const TrialBanner = () => {
  const { isInTrial, daysRemaining, trialEnded } = useTrialContext();

  if (trialEnded) {
    return (
      <Alert className="mb-4 bg-card border-primary/20">
        <Clock className="h-4 w-4 text-primary" />
        <AlertDescription className="text-foreground">
          Your trial has ended. Full access continues while we prepare subscription options!
        </AlertDescription>
      </Alert>
    );
  }

  if (isInTrial && daysRemaining <= 3) {
    return (
      <Alert className="mb-4 bg-primary/5 border-primary/20">
        <Clock className="h-4 w-4 text-primary" />
        <AlertDescription className="text-foreground">
          Trial ends in <span className="font-semibold">{daysRemaining} day{daysRemaining !== 1 ? 's' : ''}</span>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
