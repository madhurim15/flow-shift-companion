-- Create tables for cross-app usage monitoring and psychology-first interventions

-- App usage sessions table to track usage across all apps
CREATE TABLE public.app_usage_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  app_package_name TEXT NOT NULL,
  app_name TEXT,
  app_category TEXT, -- 'social', 'entertainment', 'shopping', 'productivity', etc.
  session_start TIMESTAMP WITH TIME ZONE NOT NULL,
  session_end TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  psychological_state TEXT, -- 'seeking_stimulation', 'avoidance', 'emotional_regulation', 'impulse_driven'
  intervention_triggered BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Psychology-first intervention logs
CREATE TABLE public.psychological_interventions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  app_package_name TEXT NOT NULL,
  detected_state TEXT NOT NULL, -- psychological state detected
  intervention_type TEXT NOT NULL, -- 'gentle_nudge', 'alternative_offer', 'reflection_prompt'
  intervention_message TEXT,
  user_response TEXT, -- 'dismissed', 'accepted_alternative', 'reflected'
  alternative_chosen TEXT, -- 'mood_check', 'journal', 'breathing', 'physical_break'
  effectiveness_rating INTEGER, -- 1-5, user feedback
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Behavioral pattern insights
CREATE TABLE public.behavioral_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pattern_type TEXT NOT NULL, -- 'rapid_switching', 'endless_scrolling', 'late_night_usage', 'impulse_shopping'
  detected_frequency INTEGER DEFAULT 1,
  last_detected TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  improvement_trend FLOAT, -- percentage improvement over time
  successful_interventions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- App categories and thresholds
CREATE TABLE public.app_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_package_name TEXT NOT NULL UNIQUE,
  app_name TEXT,
  category TEXT NOT NULL, -- 'social', 'entertainment', 'shopping', 'productivity', 'games'
  mindful_threshold_minutes INTEGER DEFAULT 20, -- when to start gentle interventions
  psychological_triggers TEXT[], -- array of triggers like 'stress', 'boredom', 'avoidance'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.app_usage_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychological_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavioral_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for app_usage_sessions
CREATE POLICY "Users can view their own app usage sessions" 
ON public.app_usage_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own app usage sessions" 
ON public.app_usage_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own app usage sessions" 
ON public.app_usage_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for psychological_interventions
CREATE POLICY "Users can view their own interventions" 
ON public.psychological_interventions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interventions" 
ON public.psychological_interventions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interventions" 
ON public.psychological_interventions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for behavioral_patterns
CREATE POLICY "Users can view their own patterns" 
ON public.behavioral_patterns 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own patterns" 
ON public.behavioral_patterns 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own patterns" 
ON public.behavioral_patterns 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for app_categories (read-only for users)
CREATE POLICY "Users can view app categories" 
ON public.app_categories 
FOR SELECT 
USING (true);

-- Insert common app categories and thresholds
INSERT INTO public.app_categories (app_package_name, app_name, category, mindful_threshold_minutes, psychological_triggers) VALUES
('com.instagram.android', 'Instagram', 'social', 15, ARRAY['seeking_stimulation', 'avoidance', 'emotional_regulation']),
('com.google.android.youtube', 'YouTube', 'entertainment', 20, ARRAY['avoidance', 'boredom', 'emotional_regulation']),
('com.android.chrome', 'Chrome', 'browsing', 25, ARRAY['seeking_stimulation', 'avoidance']),
('com.facebook.katana', 'Facebook', 'social', 15, ARRAY['seeking_stimulation', 'emotional_regulation']),
('com.zhiliaoapp.musically', 'TikTok', 'social', 10, ARRAY['seeking_stimulation', 'avoidance']),
('com.amazon.mShop.android.shopping', 'Amazon', 'shopping', 15, ARRAY['impulse_driven', 'emotional_regulation']),
('com.snapchat.android', 'Snapchat', 'social', 15, ARRAY['seeking_stimulation', 'social_connection']),
('com.twitter.android', 'Twitter', 'social', 20, ARRAY['seeking_stimulation', 'information_seeking']),
('com.reddit.frontpage', 'Reddit', 'social', 25, ARRAY['seeking_stimulation', 'avoidance']);

-- Create indexes for better performance
CREATE INDEX idx_app_usage_sessions_user_id ON public.app_usage_sessions(user_id);
CREATE INDEX idx_app_usage_sessions_app_package ON public.app_usage_sessions(app_package_name);
CREATE INDEX idx_app_usage_sessions_created_at ON public.app_usage_sessions(created_at);
CREATE INDEX idx_psychological_interventions_user_id ON public.psychological_interventions(user_id);
CREATE INDEX idx_behavioral_patterns_user_id ON public.behavioral_patterns(user_id);

-- Create function to update behavioral patterns
CREATE OR REPLACE FUNCTION public.update_behavioral_pattern_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for behavioral patterns
CREATE TRIGGER update_behavioral_patterns_updated_at
BEFORE UPDATE ON public.behavioral_patterns
FOR EACH ROW
EXECUTE FUNCTION public.update_behavioral_pattern_timestamp();