import { supabase } from '@/integrations/supabase/client';

interface ScreenTimeData {
  thisWeekMinutes: number;
  lastWeekMinutes: number;
  reductionMinutes: number;
  reductionPercent: number;
  baselineMinutes: number;
  totalReclaimedMinutes: number;
  intentionalActionsThisWeek: number;
}

export const getScreenTimeData = async (): Promise<ScreenTimeData> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return {
      thisWeekMinutes: 0,
      lastWeekMinutes: 0,
      reductionMinutes: 0,
      reductionPercent: 0,
      baselineMinutes: 0,
      totalReclaimedMinutes: 0,
      intentionalActionsThisWeek: 0
    };
  }

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay()); // Start of this week (Sunday)
  weekStart.setHours(0, 0, 0, 0);

  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(weekStart.getDate() - 7);

  const lastWeekEnd = new Date(weekStart);

  // Get this week's screen time
  const { data: thisWeekData } = await supabase
    .from('app_usage_sessions')
    .select('duration_seconds')
    .eq('user_id', user.id)
    .gte('session_start', weekStart.toISOString());

  const thisWeekMinutes = Math.round(
    (thisWeekData?.reduce((sum, session) => sum + (session.duration_seconds || 0), 0) || 0) / 60
  );

  // Get last week's screen time
  const { data: lastWeekData } = await supabase
    .from('app_usage_sessions')
    .select('duration_seconds')
    .eq('user_id', user.id)
    .gte('session_start', lastWeekStart.toISOString())
    .lt('session_start', lastWeekEnd.toISOString());

  const lastWeekMinutes = Math.round(
    (lastWeekData?.reduce((sum, session) => sum + (session.duration_seconds || 0), 0) || 0) / 60
  );

  // Calculate reduction
  const reductionMinutes = lastWeekMinutes - thisWeekMinutes;
  const reductionPercent = lastWeekMinutes > 0 
    ? Math.round((reductionMinutes / lastWeekMinutes) * 100)
    : 0;

  // Get baseline (first 7 days of usage)
  const { data: allSessions } = await supabase
    .from('app_usage_sessions')
    .select('session_start, duration_seconds')
    .eq('user_id', user.id)
    .order('session_start', { ascending: true });

  let baselineMinutes = 0;
  if (allSessions && allSessions.length > 0) {
    const firstSessionDate = new Date(allSessions[0].session_start);
    const baselineEnd = new Date(firstSessionDate);
    baselineEnd.setDate(firstSessionDate.getDate() + 7);

    const baselineSessions = allSessions.filter(session => {
      const sessionDate = new Date(session.session_start);
      return sessionDate >= firstSessionDate && sessionDate < baselineEnd;
    });

    const baselineTotalMinutes = Math.round(
      baselineSessions.reduce((sum, session) => sum + (session.duration_seconds || 0), 0) / 60
    );
    baselineMinutes = baselineSessions.length > 0 ? Math.round(baselineTotalMinutes / 7) : 0;
  }

  // Calculate total time reclaimed since baseline
  const { data: recentWeeks } = await supabase
    .from('app_usage_sessions')
    .select('session_start, duration_seconds')
    .eq('user_id', user.id)
    .gte('session_start', lastWeekStart.toISOString());

  let totalReclaimedMinutes = 0;
  if (recentWeeks && recentWeeks.length > 0 && baselineMinutes > 0) {
    const weeklyData = new Map<string, number>();
    
    recentWeeks.forEach(session => {
      const sessionDate = new Date(session.session_start);
      const weekKey = `${sessionDate.getFullYear()}-W${Math.floor(sessionDate.getDate() / 7)}`;
      weeklyData.set(weekKey, (weeklyData.get(weekKey) || 0) + (session.duration_seconds || 0) / 60);
    });

    weeklyData.forEach(weekMinutes => {
      const expectedMinutes = baselineMinutes * 7;
      const weekReclaimed = expectedMinutes - weekMinutes;
      if (weekReclaimed > 0) {
        totalReclaimedMinutes += weekReclaimed;
      }
    });
  }

  // Get intentional actions this week
  const { data: actionsData } = await supabase
    .from('action_completions')
    .select('id')
    .eq('user_id', user.id)
    .gte('completed_at', weekStart.toISOString());

  const intentionalActionsThisWeek = actionsData?.length || 0;

  return {
    thisWeekMinutes,
    lastWeekMinutes,
    reductionMinutes,
    reductionPercent,
    baselineMinutes,
    totalReclaimedMinutes: Math.round(totalReclaimedMinutes),
    intentionalActionsThisWeek
  };
};

export const formatScreenTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
};

export const getReductionMessage = (reductionMinutes: number): string => {
  if (reductionMinutes > 60) {
    return "Wow! You reclaimed over an hour this week. That's huge! 🎉";
  } else if (reductionMinutes > 30) {
    return "Great progress! You're taking back your time. 💪";
  } else if (reductionMinutes > 10) {
    return "Every minute counts. Keep the momentum! 🌟";
  } else if (reductionMinutes > 0) {
    return "Small steps lead to big changes. Nice work! 🌱";
  } else if (reductionMinutes === 0) {
    return "Keep using FlowFocus to see your progress! 📊";
  } else {
    return "This week was tough. Tomorrow is a fresh start. 🌅";
  }
};

export const getTotalImpactMessage = (totalHours: number): string => {
  if (totalHours > 20) {
    return "That's almost a full day reclaimed! Imagine what you can do with that time. 🚀";
  } else if (totalHours > 10) {
    return "That's a full workday back in your life! Amazing progress. ⏰";
  } else if (totalHours > 5) {
    return "That's hours for hobbies, loved ones, or rest. Well done! ❤️";
  } else if (totalHours > 0) {
    return "Small changes compound. You're building something great! 💎";
  } else {
    return "Complete a few days to see your impact! 🌱";
  }
};
