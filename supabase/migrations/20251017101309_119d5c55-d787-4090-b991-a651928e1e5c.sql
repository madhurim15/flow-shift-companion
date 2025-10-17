-- Create device compatibility telemetry table
CREATE TABLE IF NOT EXISTS public.device_compatibility (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_manufacturer TEXT NOT NULL,
  device_model TEXT NOT NULL,
  android_version TEXT NOT NULL,
  permission_detection_method TEXT NOT NULL, -- 'appops', 'fallback_events', 'fallback_stats', 'force_override'
  nudges_working BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.device_compatibility ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own device telemetry"
  ON public.device_compatibility
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own device telemetry"
  ON public.device_compatibility
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own device telemetry"
  ON public.device_compatibility
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Add index for faster queries
CREATE INDEX idx_device_compatibility_user_id ON public.device_compatibility(user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_device_compatibility_updated_at
  BEFORE UPDATE ON public.device_compatibility
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();