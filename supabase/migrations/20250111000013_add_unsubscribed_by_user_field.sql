-- Add field to track if user unsubscribed themselves
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS unsubscribed_by_user BOOLEAN DEFAULT false;

-- Update existing users who have notifications disabled to be owner-disabled (not user-unsubscribed)
UPDATE public.profiles 
SET unsubscribed_by_user = false 
WHERE email_notifications_enabled = false AND unsubscribed_by_user IS NULL;

-- Drop existing functions first
DROP FUNCTION IF EXISTS public.unsubscribe_from_emails();
DROP FUNCTION IF EXISTS public.get_my_unsubscribe_status();

-- Update the unsubscribe function to mark as user-unsubscribed
CREATE OR REPLACE FUNCTION public.unsubscribe_from_emails()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  user_role TEXT;
BEGIN
  -- Get current authenticated user
  current_user_id := auth.uid();
  
  -- Must be authenticated
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if user is admin or owner (they cannot unsubscribe)
  SELECT ur.role INTO user_role
  FROM public.user_roles ur
  WHERE ur.user_id = current_user_id
  AND ur.role IN ('admin', 'owner')
  LIMIT 1;
  
  -- Admins and owners cannot unsubscribe
  IF user_role IN ('admin', 'owner') THEN
    RETURN false;
  END IF;
  
  -- Update the authenticated user's email notification preference
  -- Mark as user-unsubscribed so owner cannot override
  UPDATE public.profiles 
  SET 
    email_notifications_enabled = false,
    unsubscribed_by_user = true
  WHERE user_id = current_user_id;
  
  -- Return true if a row was updated
  RETURN FOUND;
END;
$$;

-- Update the status check function to include unsubscribed_by_user
CREATE OR REPLACE FUNCTION public.get_my_unsubscribe_status()
RETURNS TABLE (
  display_name TEXT,
  email TEXT,
  email_notifications_enabled BOOLEAN,
  unsubscribed_by_user BOOLEAN,
  is_admin_or_owner BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get current authenticated user
  current_user_id := auth.uid();
  
  -- Must be authenticated
  IF current_user_id IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    p.display_name,
    p.email,
    COALESCE(p.email_notifications_enabled, true) as email_notifications_enabled,
    COALESCE(p.unsubscribed_by_user, false) as unsubscribed_by_user,
    EXISTS(
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = current_user_id
      AND ur.role IN ('admin', 'owner')
    ) as is_admin_or_owner
  FROM public.profiles p
  WHERE p.user_id = current_user_id;
END;
$$;