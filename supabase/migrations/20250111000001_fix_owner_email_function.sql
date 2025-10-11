-- Create function to get all owner emails for notifications
CREATE OR REPLACE FUNCTION public.get_owner_emails()
RETURNS TEXT[]
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ARRAY_AGG(u.email)
  FROM auth.users u
  JOIN public.user_roles ur ON u.id = ur.user_id
  WHERE ur.role = 'owner' AND u.email IS NOT NULL;
$$;