-- Update waitlist table to use first_name instead of full_name
ALTER TABLE public.waitlist 
RENAME COLUMN full_name TO first_name;

-- Add comment for clarity
COMMENT ON COLUMN public.waitlist.first_name IS 'User first name only for personalized experience';