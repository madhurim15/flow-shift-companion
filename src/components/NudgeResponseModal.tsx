import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { nudgeResponses, enhancedReminderMessages, type NudgeResponseType } from '@/data/nudgeResponses';
import IntentionInput from '@/components/IntentionInput';
import QuickStretch from '@/components/QuickStretch';
import MiniJournal from '@/components/MiniJournal';
import type { ReminderType } from '@/utils/reminderUtils';

interface NudgeResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminderType: ReminderType;
  onResponseSelect: (responseType: NudgeResponseType, data?: any) => void;
}

const NudgeResponseModal: React.FC<NudgeResponseModalProps> = ({
  isOpen,
  onClose,
  reminderType,
  onResponseSelect
}) => {
  const [selectedResponse, setSelectedResponse] = useState<NudgeResponseType | null>(null);

  const responses = nudgeResponses[reminderType] || [];
  const message = enhancedReminderMessages[reminderType];

  const handleResponseClick = (response: NudgeResponseType) => {
    if (response === 'mood_check') {
      // Immediate action - close modal and trigger mood check
      onResponseSelect(response);
      onClose();
    } else {
      setSelectedResponse(response);
    }
  };

  const handleBack = () => {
    setSelectedResponse(null);
  };

  const handleDismiss = () => {
    onClose();
  };

  const handleResponseComplete = (responseType: NudgeResponseType, data?: any) => {
    onResponseSelect(responseType, data);
    onClose();
  };

  const renderResponseContent = () => {
    if (!selectedResponse) return null;

    switch (selectedResponse) {
      case 'set_intention':
        return (
          <IntentionInput
            onSave={(intention) => handleResponseComplete('set_intention', { intention })}
            onCancel={handleBack}
          />
        );
      case 'quick_stretch':
        return (
          <QuickStretch
            onComplete={() => handleResponseComplete('quick_stretch', { completed: true })}
            onCancel={handleBack}
          />
        );
      case 'mini_journal':
        return (
          <MiniJournal
            prompt="Right now I'm feeling..."
            onSave={(entry) => handleResponseComplete('mini_journal', { entry })}
            onCancel={handleBack}
          />
        );
      case 'gratitude_note':
        return (
          <MiniJournal
            prompt="Today I'm grateful for..."
            onSave={(entry) => handleResponseComplete('gratitude_note', { entry })}
            onCancel={handleBack}
          />
        );
      case 'reflect_day':
        return (
          <MiniJournal
            prompt="Today I..."
            onSave={(entry) => handleResponseComplete('reflect_day', { entry })}
            onCancel={handleBack}
          />
        );
      default:
        return (
          <div className="text-center space-y-4">
            <p className="text-foreground/80">
              This response type is coming soon! ✨
            </p>
            <Button onClick={handleBack} className="w-full">
              Go Back
            </Button>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-card/95 backdrop-blur-sm border-border/50">
        <DialogHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="absolute -top-2 -right-2 h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-lg font-medium text-center pr-8">
            {selectedResponse ? 'Choose Your Response' : 'Gentle Check-in'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {selectedResponse ? (
            renderResponseContent()
          ) : (
            <>
              <div className="text-center py-2">
                <p className="text-foreground/80 text-sm leading-relaxed">
                  {message}
                </p>
              </div>

              <div className="space-y-2">
                {responses.map((response) => {
                  const Icon = response.icon;
                  return (
                    <Card
                      key={response.id}
                      className="transition-all duration-200 cursor-pointer hover:bg-muted/50 border-border/30"
                      onClick={() => handleResponseClick(response.id)}
                    >
                      <CardContent className="flex items-center gap-3 p-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-foreground">
                            {response.title}
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {response.description}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs px-2 py-1">
                          {response.duration}
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-border/30">
                <p className="text-xs text-muted-foreground text-center">
                  Take your time, no pressure ✨
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NudgeResponseModal;