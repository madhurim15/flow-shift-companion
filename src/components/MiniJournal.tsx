import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen } from 'lucide-react';

interface MiniJournalProps {
  prompt: string;
  onSave: (entry: string) => void;
  onCancel: () => void;
}

const MiniJournal: React.FC<MiniJournalProps> = ({ prompt, onSave, onCancel }) => {
  const [entry, setEntry] = useState('');

  const handleSave = () => {
    if (entry.trim()) {
      onSave(entry.trim());
    }
  };

  return (
    <Card className="max-w-md mx-auto bg-card/95 backdrop-blur-sm border-border/50">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
          <BookOpen className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-lg">Quick Reflection</CardTitle>
        <p className="text-sm text-muted-foreground">
          {prompt}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Start writing..."
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          className="min-h-[100px] resize-none"
          maxLength={300}
        />
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>{entry.length}/300 characters</span>
          <span>No pressure, just express yourself ✨</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="flex-1"
            disabled={!entry.trim()}
          >
            Save Entry
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MiniJournal;