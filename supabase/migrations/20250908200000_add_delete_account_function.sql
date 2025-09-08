-- Create function to safely delete user account
CREATE OR REPLACE FUNCTION public.delete_user_account(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $
DECLARE
  anonymous_user_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
  -- Check if the user exists and is the current authenticated user
  IF _user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Can only delete your own account';
  END IF;

  -- Make all user's comments anonymous
  UPDATE public.comments 
  SET 
    user_id = anonymous_user_id,
    display_name = 'Anonymous User',
    updated_at = now()
  WHERE user_id = _user_id;

  -- Delete user roles
  DELETE FROM public.user_roles WHERE user_id = _user_id;

  -- Delete user profile
  DELETE FROM public.profiles WHERE user_id = _user_id;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and return false
    RAISE LOG 'Error deleting user account %: %', _user_id, SQLERRM;
    RETURN FALSE;
END;
$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_account(UUID) TO authenticated;

-- Create RLS policy to allow users to call this function only for themselves
-- This is handled within the function itself with the auth.uid() check