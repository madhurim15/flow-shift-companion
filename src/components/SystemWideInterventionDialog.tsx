import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Brain, Wind, BookOpen, Sparkles } from 'lucide-react';
import { getSuggestedAlternatives, type PsychologicalState, type AlternativeAction } from '@/utils/systemWideInterventionUtils';

interface SystemWideInterventionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  appName?: string;
  psychologicalState: PsychologicalState;
  onAlternativeChosen: (alternative: AlternativeAction) => void;
  onDismiss: () => void;
}

export const SystemWideInterventionDialog: React.FC<SystemWideInterventionDialogProps> = ({
  isOpen,
  onClose,
  message,
  appName,
  psychologicalState,
  onAlternativeChosen,
  onDismiss
}) => {
  const alternatives = getSuggestedAlternatives(psychologicalState, new Date().getHours());

  const getAlternativeIcon = (action: AlternativeAction) => {
    switch (action) {
      case 'breathing': return <Wind className="w-5 h-5" />;
      case 'journal': return <BookOpen className="w-5 h-5" />;
      case 'mood_check': return <Heart className="w-5 h-5" />;
      case 'physical_break': return <Brain className="w-5 h-5" />;
      case 'gratitude': return <Sparkles className="w-5 h-5" />;
      default: return <Heart className="w-5 h-5" />;
    }
  };

  const handleAlternativeClick = (alternative: AlternativeAction) => {
    onAlternativeChosen(alternative);
    onClose();
  };

  const handleDismiss = () => {
    onDismiss();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            {appName ? `Taking a break from ${appName}?` : 'Gentle Check-in'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center py-4">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {message}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              What would feel good right now?
            </h4>
            
            {alternatives.map((alt, index) => (
              <Card 
                key={index}
                className="p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => handleAlternativeClick(alt.action)}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 text-primary">
                    {getAlternativeIcon(alt.action)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{alt.title}</span>
                      <span className="text-xs text-muted-foreground">{alt.duration}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {alt.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="pt-4 space-y-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleDismiss}
            >
              Not right now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};