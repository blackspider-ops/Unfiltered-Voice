-- Fix existing users to have email notifications enabled by default
-- Update all existing users to have email notifications enabled
UPDATE public.profiles 
SET email_notifications_enabled = true 
WHERE email_notifications_enabled IS NULL OR email_notifications_enabled = false;

-- Also make sure the column has the correct default for new users
ALTER TABLE public.profiles ALTER COLUMN email_notifications_enabled SET DEFAULT true;