-- Create adaptive_thresholds table to store ML-learned intervention thresholds per user per app
CREATE TABLE public.adaptive_thresholds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  app_package_name TEXT NOT NULL,
  
  -- Learned threshold values (in seconds)
  initial_nudge_threshold INTEGER NOT NULL DEFAULT 1200,     -- 20 minutes default
  moderate_nudge_threshold INTEGER NOT NULL DEFAULT 2400,    -- 40 minutes default  
  urgent_nudge_threshold INTEGER NOT NULL DEFAULT 3600,      -- 60 minutes default
  
  -- ML metrics for adaptive learning
  acceptance_rate DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  total_interventions INTEGER NOT NULL DEFAULT 0,
  accepted_interventions INTEGER NOT NULL DEFAULT 0,
  confidence_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,    -- 0-1 scale
  
  -- Timestamps
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one threshold config per user per app
  UNIQUE(user_id, app_package_name)
);

-- Enable Row Level Security
ALTER TABLE public.adaptive_thresholds ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own adaptive thresholds
CREATE POLICY "Users can view their own adaptive thresholds"
  ON public.adaptive_thresholds
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own adaptive thresholds"
  ON public.adaptive_thresholds
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own adaptive thresholds"
  ON public.adaptive_thresholds
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own adaptive thresholds"
  ON public.adaptive_thresholds
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for efficient lookups by user and app
CREATE INDEX idx_adaptive_thresholds_user_app 
  ON public.adaptive_thresholds(user_id, app_package_name);

-- Create trigger to auto-update last_updated timestamp
CREATE TRIGGER update_adaptive_thresholds_timestamp
  BEFORE UPDATE ON public.adaptive_thresholds
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE public.adaptive_thresholds IS 'Stores machine learning adapted intervention thresholds per user per app based on historical acceptance patterns';