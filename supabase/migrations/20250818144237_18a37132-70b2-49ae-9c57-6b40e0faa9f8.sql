-- Create daily journals table for micro journal entries
CREATE TABLE public.daily_journals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entry TEXT NOT NULL,
  prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_journals ENABLE ROW LEVEL SECURITY;

-- Create policies for daily journals
CREATE POLICY "Users can create their own journal entries" 
ON public.daily_journals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own journal entries" 
ON public.daily_journals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries" 
ON public.daily_journals 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create voice notes table
CREATE TABLE public.voice_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT,
  duration_seconds INTEGER,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.voice_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for voice notes
CREATE POLICY "Users can create their own voice notes" 
ON public.voice_notes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own voice notes" 
ON public.voice_notes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice notes" 
ON public.voice_notes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create daily photos table
CREATE TABLE public.daily_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_path TEXT NOT NULL,
  caption TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_photos ENABLE ROW LEVEL SECURITY;

-- Create policies for daily photos
CREATE POLICY "Users can create their own photos" 
ON public.daily_photos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own photos" 
ON public.daily_photos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos" 
ON public.daily_photos 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create storage buckets for voice notes and photos
INSERT INTO storage.buckets (id, name, public) VALUES ('voice-notes', 'voice-notes', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('daily-photos', 'daily-photos', false);

-- Create storage policies for voice notes
CREATE POLICY "Users can upload their own voice notes" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'voice-notes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own voice notes" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'voice-notes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own voice notes" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'voice-notes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for daily photos
CREATE POLICY "Users can upload their own photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'daily-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'daily-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'daily-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add trigger for updating timestamps
CREATE TRIGGER update_daily_journals_updated_at
BEFORE UPDATE ON public.daily_journals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();