import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const StreakDisplay: React.FC = () => {
  const [streak, setStreak] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: streakData } = await supabase
          .from('action_streaks')
          .select('current_streak')
          .eq('user_id', user.id)
          .single();

        setStreak(streakData?.current_streak || 0);
      } catch (error) {
        console.error('Error fetching streak:', error);
        setStreak(0);
      } finally {
        setLoading(false);
      }
    };

    fetchStreak();
  }, []);

  if (loading) {
    return (
      <Card className="mb-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 animate-pulse" />
            <div className="flex-1">
              <div className="h-4 bg-primary/20 rounded animate-pulse mb-1" />
              <div className="h-3 bg-primary/10 rounded w-2/3 animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStreakMessage = (days: number) => {
    if (days === 0) return "Ready to start your journey?";
    if (days === 1) return "Great start! Keep going 🌱";
    if (days < 7) return "Building momentum! 🚀";
    if (days < 30) return "Strong streak! You're unstoppable 💪";
    return "Incredible dedication! You're amazing ✨";
  };

  return (
    <Card className="mb-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 hover:border-primary/30 transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Flame className={`w-6 h-6 ${streak > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
            <Badge 
              variant={streak > 0 ? "default" : "outline"}
              className={streak > 0 ? "bg-primary text-primary-foreground" : ""}
            >
              {streak} {streak === 1 ? 'day' : 'days'}
            </Badge>
          </div>
          <div className="flex-1 text-sm text-muted-foreground">
            {getStreakMessage(streak)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakDisplay;