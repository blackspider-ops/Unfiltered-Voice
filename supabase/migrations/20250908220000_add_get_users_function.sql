-- Create function to get all users with their roles (for admin use)
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  display_name TEXT,
  role TEXT,
  registered_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  email_confirmed_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the current user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    p.user_id as id,
    p.email,
    p.display_name,
    COALESCE(
      (SELECT ur.role::TEXT FROM public.user_roles ur 
       WHERE ur.user_id = p.user_id AND ur.role = 'admin' LIMIT 1), 
      'user'
    ) as role,
    p.created_at as registered_at,
    NULL::TIMESTAMPTZ as last_sign_in_at,
    p.created_at as email_confirmed_at
  FROM public.profiles p
  ORDER BY p.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users (function handles authorization internally)
GRANT EXECUTE ON FUNCTION public.get_all_users() TO authenticated;