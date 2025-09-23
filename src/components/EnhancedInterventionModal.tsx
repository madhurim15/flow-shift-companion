import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useEnhancedInterventions } from '@/hooks/useEnhancedInterventions';

export const EnhancedInterventionModal = () => {
  const { 
    isShowingIntervention, 
    currentIntervention, 
    respondToIntervention,
    currentSession 
  } = useEnhancedInterventions();
  
  const [selectedAlternative, setSelectedAlternative] = useState<string | null>(null);

  // Reset selected alternative when intervention changes
  useEffect(() => {
    if (isShowingIntervention) {
      setSelectedAlternative(null);
    }
  }, [isShowingIntervention]);

  if (!isShowingIntervention || !currentIntervention) return null;

  const handleDismiss = () => {
    respondToIntervention('dismissed');
  };

  const handleAcceptAlternative = (alternativeId: string) => {
    if (alternativeId === 'snooze') {
      respondToIntervention('snoozed');
    } else {
      setSelectedAlternative(alternativeId);
      respondToIntervention('accepted', alternativeId);
      
      // Close modal after a brief delay to show feedback
      setTimeout(() => {
        setSelectedAlternative(null);
      }, 2000);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <Dialog open={isShowingIntervention} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md mx-4">
        <DialogHeader className="text-center space-y-3">
          <DialogTitle className="text-lg font-medium text-foreground">
            {currentIntervention.title}
          </DialogTitle>
          
          {currentSession && (
            <div className="text-sm text-muted-foreground">
              <p className="font-medium">{currentSession.appName}</p>
              <p>Session: {formatDuration(currentSession.currentDuration)}</p>
              {currentSession.dismissalCount > 0 && (
                <p className="text-xs">Dismissed {currentSession.dismissalCount} time{currentSession.dismissalCount > 1 ? 's' : ''} this session</p>
              )}
            </div>
          )}
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-foreground/80 text-center leading-relaxed">
            {currentIntervention.message}
          </p>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground text-center">
              Try this instead:
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              {currentIntervention.alternatives.map((alternative) => (
                <Card 
                  key={alternative.id}
                  className={`cursor-pointer transition-all hover:scale-[1.02] ${
                    selectedAlternative === alternative.id 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleAcceptAlternative(alternative.id)}
                >
                  <CardContent className="p-3 text-center">
                    <div className="font-medium text-sm">{alternative.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {alternative.description}
                    </div>
                    <div className="text-xs text-primary mt-1">
                      {alternative.duration}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDismiss}
              className="flex-1 text-xs"
            >
              Not Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};