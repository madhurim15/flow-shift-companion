
-- Create reminder_settings table to store user preferences for 4x daily check-ins
CREATE TABLE public.reminder_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  morning_time TIME DEFAULT '09:00:00',
  afternoon_time TIME DEFAULT '14:00:00',
  evening_time TIME DEFAULT '19:00:00',
  night_time TIME DEFAULT '21:00:00',
  notifications_enabled BOOLEAN DEFAULT true,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create check_in_reminders table to log scheduled reminders and completion status
CREATE TABLE public.check_in_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('morning', 'afternoon', 'evening', 'night')),
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  mood_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pomodoro_sessions table to store focus sessions and interruptions
CREATE TABLE public.pomodoro_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  session_type TEXT DEFAULT 'focus' CHECK (session_type IN ('focus', 'break')),
  planned_duration INTEGER NOT NULL DEFAULT 1500, -- 25 minutes in seconds
  actual_duration INTEGER,
  completed BOOLEAN DEFAULT false,
  interrupted BOOLEAN DEFAULT false,
  interruption_reason TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add Row Level Security (RLS) policies
ALTER TABLE public.reminder_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_in_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for reminder_settings
CREATE POLICY "Users can view their own reminder settings" 
  ON public.reminder_settings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminder settings" 
  ON public.reminder_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminder settings" 
  ON public.reminder_settings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS policies for check_in_reminders
CREATE POLICY "Users can view their own check-in reminders" 
  ON public.check_in_reminders 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own check-in reminders" 
  ON public.check_in_reminders 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own check-in reminders" 
  ON public.check_in_reminders 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS policies for pomodoro_sessions
CREATE POLICY "Users can view their own pomodoro sessions" 
  ON public.pomodoro_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pomodoro sessions" 
  ON public.pomodoro_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pomodoro sessions" 
  ON public.pomodoro_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_reminder_settings_user_id ON public.reminder_settings(user_id);
CREATE INDEX idx_check_in_reminders_user_id ON public.check_in_reminders(user_id);
CREATE INDEX idx_check_in_reminders_scheduled_time ON public.check_in_reminders(scheduled_time);
CREATE INDEX idx_pomodoro_sessions_user_id ON public.pomodoro_sessions(user_id);
CREATE INDEX idx_pomodoro_sessions_started_at ON public.pomodoro_sessions(started_at);
