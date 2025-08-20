import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sun } from 'lucide-react';

interface IntentionInputProps {
  onSave: (intention: string) => void;
  onCancel: () => void;
}

const IntentionInput: React.FC<IntentionInputProps> = ({ onSave, onCancel }) => {
  const [intention, setIntention] = useState('');

  const handleSave = () => {
    if (intention.trim()) {
      onSave(intention.trim());
    }
  };

  return (
    <Card className="max-w-md mx-auto bg-card/95 backdrop-blur-sm border-border/50">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
          <Sun className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-lg">Set Your Daily Intention</CardTitle>
        <p className="text-sm text-muted-foreground">
          What would make today feel meaningful?
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Today I want to focus on..."
          value={intention}
          onChange={(e) => setIntention(e.target.value)}
          className="min-h-[80px] resize-none"
          maxLength={200}
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="flex-1"
            disabled={!intention.trim()}
          >
            Set Intention
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntentionInput;