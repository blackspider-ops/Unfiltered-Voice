-- Create function to handle email unsubscribe (authenticated users only)
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
  UPDATE public.profiles 
  SET email_notifications_enabled = false
  WHERE user_id = current_user_id;
  
  -- Return true if a row was updated
  RETURN FOUND;
END;
$$;

-- Create function to check current user's unsubscribe status
CREATE OR REPLACE FUNCTION public.get_my_unsubscribe_status()
RETURNS TABLE (
  display_name TEXT,
  email TEXT,
  email_notifications_enabled BOOLEAN,
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
    EXISTS(
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = current_user_id
      AND ur.role IN ('admin', 'owner')
    ) as is_admin_or_owner
  FROM public.profiles p
  WHERE p.user_id = current_user_id;
END;
$$;