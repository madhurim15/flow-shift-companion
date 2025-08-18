import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flame, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface EnhancedStreakDisplayProps {
  onClose?: () => void;
}

export const EnhancedStreakDisplay = ({ onClose }: EnhancedStreakDisplayProps) => {
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [totalCompletions, setTotalCompletions] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreak();
  }, []);

  const fetchStreak = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('action_streaks')
        .select('current_streak, best_streak, total_completions')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setStreak(data.current_streak || 0);
        setBestStreak(data.best_streak || 0);
        setTotalCompletions(data.total_completions || 0);
      }
    } catch (error) {
      console.error('Error fetching streak:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return "Ready to start your streak!";
    if (streak === 1) return "Great start! Keep it up!";
    if (streak < 7) return "Building momentum!";
    if (streak < 30) return "You're on fire!";
    return "Absolutely unstoppable!";
  };

  const getMotivationalQuote = (streak: number) => {
    if (streak === 0) return "Every journey starts with a single step. You've got this! 💪";
    if (streak < 7) return "Consistency is the mother of mastery. You're building something amazing! 🌟";
    if (streak < 30) return "Look at you go! Your commitment is inspiring. Keep the momentum! 🚀";
    return "You're a true champion of consistency. This is what dedication looks like! 👑";
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      {onClose && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-medium">Your Streak</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Main Streak Display */}
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto p-3 rounded-full bg-orange-100 dark:bg-orange-900/50 w-fit">
            <Flame className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-3">
          <div>
            <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">
              {streak}
            </div>
            <Badge 
              variant="secondary" 
              className="bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200 mt-1"
            >
              day streak
            </Badge>
          </div>
          
          <p className="text-sm text-orange-600 dark:text-orange-400">
            {getStreakMessage(streak)}
          </p>
          
          <div className="bg-orange-100/50 dark:bg-orange-900/30 rounded-lg p-3 text-xs text-orange-700 dark:text-orange-300">
            {getMotivationalQuote(streak)}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-xl font-bold text-foreground">{bestStreak}</div>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-xl font-bold text-foreground">{totalCompletions}</div>
            <p className="text-xs text-muted-foreground">Total Actions</p>
          </CardContent>
        </Card>
      </div>

      {/* Encouragement */}
      {streak === 0 && (
        <Card className="bg-muted/50">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Complete your first action today to start building your streak! 
              Small steps lead to big changes. 🌱
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};