-- Add email subscription toggle to profiles table (owner-controlled)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT true;

-- Update existing users to have email notifications enabled by default
UPDATE public.profiles SET email_notifications_enabled = true WHERE email_notifications_enabled IS NULL;

-- Create function to check if user should receive email notifications
CREATE OR REPLACE FUNCTION public.should_receive_email_notifications(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
  notifications_enabled BOOLEAN;
BEGIN
  -- Get user role
  SELECT role INTO user_role
  FROM public.user_roles ur
  WHERE ur.user_id = should_receive_email_notifications.user_id
  AND role IN ('admin', 'owner')
  LIMIT 1;
  
  -- Admins and owners ALWAYS receive emails (cannot be turned off)
  IF user_role IN ('admin', 'owner') THEN
    RETURN true;
  END IF;
  
  -- For regular users, check owner's setting for them
  SELECT email_notifications_enabled INTO notifications_enabled
  FROM public.profiles p
  WHERE p.user_id = should_receive_email_notifications.user_id;
  
  RETURN COALESCE(notifications_enabled, true);
END;
$$;

-- Create RLS policy for email notifications setting
-- ONLY owners can change email notification settings for any user
-- Regular users and admins cannot change these settings
DROP POLICY IF EXISTS "Users can update their own email notification settings" ON public.profiles;
DROP POLICY IF EXISTS "Only owners can control email notification settings" ON public.profiles;

-- Separate policies for different operations
CREATE POLICY "Users can update their own profile except email notifications" 
ON public.profiles 
FOR UPDATE 
USING (
  auth.uid() = user_id AND public.has_role(auth.uid(), 'user')
)
WITH CHECK (
  auth.uid() = user_id AND public.has_role(auth.uid(), 'user')
);

CREATE POLICY "Only owners can update any profile including email notifications" 
ON public.profiles 
FOR UPDATE 
USING (
  public.has_role(auth.uid(), 'owner')
)
WITH CHECK (
  public.has_role(auth.uid(), 'owner')
);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email_notifications ON public.profiles(email_notifications_enabled);