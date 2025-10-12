-- Drop existing function first, then create new one with email_notifications_enabled and unsubscribed_by_user
DROP FUNCTION IF EXISTS public.get_all_users();

-- Create the get_all_users function to include email_notifications_enabled and unsubscribed_by_user
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  display_name TEXT,
  role TEXT,
  registered_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  email_confirmed_at TIMESTAMPTZ,
  email_notifications_enabled BOOLEAN,
  unsubscribed_by_user BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id as id,
    p.email,
    p.display_name,
    COALESCE(
      (SELECT ur.role::TEXT 
       FROM public.user_roles ur 
       WHERE ur.user_id = p.user_id 
       AND ur.role IN ('owner', 'admin') 
       ORDER BY CASE ur.role WHEN 'owner' THEN 1 WHEN 'admin' THEN 2 END 
       LIMIT 1),
      'user'
    ) as role,
    p.created_at as registered_at,
    au.last_sign_in_at,
    au.email_confirmed_at,
    COALESCE(p.email_notifications_enabled, true) as email_notifications_enabled,
    COALESCE(p.unsubscribed_by_user, false) as unsubscribed_by_user
  FROM public.profiles p
  LEFT JOIN auth.users au ON p.user_id = au.id
  ORDER BY p.created_at DESC;
END;
$$;