import { useState, useEffect } from 'react';
import { X, Send, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface MicroJournalProps {
  onClose: () => void;
}

interface JournalEntry {
  id: string;
  entry: string;
  prompt: string | null;
  created_at: string;
}

const journalPrompts = [
  "How are you feeling about today?",
  "What's one small win you had today?",
  "What are you grateful for right now?",
  "What's on your mind today?",
  "How did you show kindness to yourself today?",
  "What made you smile today?",
  "What would make tomorrow better?",
];

export const MicroJournal = ({ onClose }: MicroJournalProps) => {
  const [entry, setEntry] = useState('');
  const [recentEntries, setRecentEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPrompt] = useState(() => 
    journalPrompts[Math.floor(Math.random() * journalPrompts.length)]
  );
  const { toast } = useToast();

  const maxLength = 200;

  useEffect(() => {
    fetchRecentEntries();
  }, []);

  const fetchRecentEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_journals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRecentEntries(data || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  const handleSubmit = async () => {
    if (!entry.trim() || loading) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('daily_journals')
        .insert({
          user_id: user.id,
          entry: entry.trim(),
          prompt: currentPrompt,
        });

      if (error) throw error;

      toast({
        title: "Entry saved! 📝",
        description: "Your thoughts have been captured gently.",
      });

      setEntry('');
      fetchRecentEntries();
    } catch (error) {
      toast({
        title: "Couldn't save entry",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-medium">Micro Journal</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Current Entry */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {currentPrompt}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={entry}
            onChange={(e) => setEntry(e.target.value.slice(0, maxLength))}
            placeholder="Share what's on your mind... keep it simple and gentle."
            className="resize-none min-h-[80px] text-sm"
            maxLength={maxLength}
          />
          
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {entry.length}/{maxLength}
            </Badge>
            
            <Button
              onClick={handleSubmit}
              disabled={!entry.trim() || loading}
              size="sm"
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Entries */}
      {recentEntries.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Recent Reflections</h3>
          {recentEntries.map((entry) => (
            <Card key={entry.id} className="border-muted">
              <CardContent className="p-3">
                <p className="text-sm text-muted-foreground mb-1">
                  {entry.prompt}
                </p>
                <p className="text-sm">{entry.entry}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(entry.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};