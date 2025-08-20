-- Create table for tracking nudge responses
CREATE TABLE public.nudge_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reminder_type TEXT NOT NULL, -- 'morning', 'afternoon', 'evening', 'night'
  response_type TEXT NOT NULL, -- 'mood_check', 'set_intention', 'quick_stretch', 'mini_journal', etc.
  response_data JSONB, -- Store any additional data like text input, mood selected, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_duration INTEGER, -- Time spent on activity in seconds
  effectiveness_rating INTEGER -- 1-5 scale for learning (optional)
);

-- Enable Row Level Security
ALTER TABLE public.nudge_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can create their own nudge responses" 
ON public.nudge_responses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own nudge responses" 
ON public.nudge_responses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own nudge responses" 
ON public.nudge_responses 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create index for better performance on user queries
CREATE INDEX idx_nudge_responses_user_id ON public.nudge_responses(user_id);
CREATE INDEX idx_nudge_responses_created_at ON public.nudge_responses(created_at);
CREATE INDEX idx_nudge_responses_type ON public.nudge_responses(reminder_type, response_type);