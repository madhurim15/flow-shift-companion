import { useState, useEffect } from 'react';
import { X, Send, BookOpen, ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPrompt] = useState(() => 
    journalPrompts[Math.floor(Math.random() * journalPrompts.length)]
  );
  const { toast } = useToast();

  const maxLength = 200;

  useEffect(() => {
    fetchRecentEntries();
  }, []);

  useEffect(() => {
    console.log('📝 Recent entries state:', recentEntries);
  }, [recentEntries]);

  const fetchRecentEntries = async (offset = 0) => {
    console.log('🔍 Fetching entries, offset:', offset);
    try {
      const { data, error } = await supabase
        .from('daily_journals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
        .range(offset, offset + 4);

      if (error) {
        console.error('❌ Error fetching entries:', error);
        throw error;
      }
      
      console.log('✅ Fetched entries:', data);
      
      if (offset === 0) {
        setRecentEntries(data || []);
      } else {
        setRecentEntries(prev => [...prev, ...(data || [])]);
      }
      
      // Check if there are more entries
      setHasMore((data || []).length === 5);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  const loadMoreEntries = async () => {
    setLoadingMore(true);
    await fetchRecentEntries(recentEntries.length);
    setLoadingMore(false);
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
    <div className="flex flex-col h-full">
      {/* Header - Fixed */}
      <div className="flex items-center justify-between p-4 pb-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Micro Journal</h2>
            <p className="text-xs text-muted-foreground">Capture your thoughts gently</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overscroll-bounce">
        <div className="p-4 space-y-4 pb-6">
          {/* Current Entry */}
          <Card className="bg-gradient-to-br from-emerald-50/50 to-blue-50/30 dark:from-emerald-950/20 dark:to-blue-950/10 border-emerald-200/50 dark:border-emerald-800/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300 leading-relaxed">
                {currentPrompt}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={entry}
                onChange={(e) => setEntry(e.target.value.slice(0, maxLength))}
                placeholder="Share what's on your mind... keep it simple and gentle."
                className="resize-none min-h-[100px] text-sm leading-relaxed border-emerald-200/50 dark:border-emerald-800/30 focus:border-emerald-400/50 dark:focus:border-emerald-600/50 bg-white/50 dark:bg-background/50"
                maxLength={maxLength}
              />
              
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs bg-white/70 dark:bg-background/70">
                  {entry.length}/{maxLength}
                </Badge>
                
                <Button
                  onClick={handleSubmit}
                  disabled={!entry.trim() || loading}
                  size="sm"
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
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
              <div className="flex items-center gap-2">
                <div className="h-px bg-border flex-1" />
                <h3 className="text-sm font-medium text-muted-foreground px-2">Recent Reflections</h3>
                <div className="h-px bg-border flex-1" />
              </div>
              
              <div className="space-y-3">
                {recentEntries.map((journalEntry) => {
                  const isExpanded = expandedEntry === journalEntry.id;
                  const isLongEntry = journalEntry.entry.length > 100;
                  const shouldTruncate = !isExpanded && isLongEntry;
                  
                  return (
                     <Card 
                       key={journalEntry.id} 
                       className={`border transition-all duration-200 hover:shadow-lg ${
                         isExpanded ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-accent/50'
                       }`}
                     >
                      <CardContent className="p-0">
                        {/* Header - Always clickable */}
                        <div 
                          className="p-4 cursor-pointer select-none"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setExpandedEntry(isExpanded ? null : journalEntry.id);
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed flex-1">
                              {journalEntry.prompt}
                            </p>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge variant="outline" className="text-xs">
                                {journalEntry.entry.length} chars
                              </Badge>
                              {isLongEntry && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 hover:bg-primary/10"
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Entry Content */}
                        <div className="px-4 pb-4">
                          <div className={`bg-muted/30 rounded-lg p-3 transition-all duration-200 ${
                            isExpanded ? 'border border-primary/20' : ''
                          }`}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                              {shouldTruncate 
                                ? `${journalEntry.entry.slice(0, 100)}...` 
                                : journalEntry.entry
                              }
                            </p>
                          </div>
                          
                          {/* Footer */}
                          <div className="flex justify-between items-center pt-3">
                            <p className="text-xs text-muted-foreground">
                              {new Date(journalEntry.created_at).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short', 
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </p>
                            {isLongEntry && (
                              <Badge variant={isExpanded ? "default" : "secondary"} className="text-xs">
                                {isExpanded ? 'Expanded' : 'Click to expand'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                
                {/* Load More Button */}
                {hasMore && (
                  <div className="pt-4 flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadMoreEntries}
                      disabled={loadingMore}
                      className="gap-2"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                      {loadingMore ? 'Loading...' : 'Load More Entries'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};