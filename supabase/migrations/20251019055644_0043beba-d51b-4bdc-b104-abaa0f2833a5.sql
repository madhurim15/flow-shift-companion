-- Add preferred_name column to profiles table for personalized nudges
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS preferred_name TEXT;