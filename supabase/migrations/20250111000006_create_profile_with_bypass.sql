-- Create a function that can create profiles bypassing RLS
CREATE OR REPLACE FUNCTION public.create_user_profile_if_missing()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  current_user_email TEXT;
  current_user_metadata JSONB;
  display_name_value TEXT;
BEGIN
  -- Get current user info
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Check if profile already exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE user_id = current_user_id) THEN
    RETURN; -- Profile exists, nothing to do
  END IF;
  
  -- Get user details from auth.users
  SELECT email, raw_user_meta_data 
  INTO current_user_email, current_user_metadata
  FROM auth.users 
  WHERE id = current_user_id;
  
  -- Extract display name
  display_name_value := COALESCE(
    current_user_metadata ->> 'display_name',
    current_user_metadata ->> 'full_name',
    current_user_metadata ->> 'name',
    TRIM(CONCAT(
      COALESCE(current_user_metadata ->> 'given_name', ''),
      ' ',
      COALESCE(current_user_metadata ->> 'family_name', '')
    )),
    current_user_metadata ->> 'user_name',
    current_user_email
  );
  
  -- Clean up the name
  display_name_value := TRIM(REGEXP_REPLACE(display_name_value, '\s+', ' ', 'g'));
  
  IF display_name_value IS NULL OR LENGTH(TRIM(display_name_value)) = 0 THEN
    display_name_value := current_user_email;
  END IF;
  
  -- Create profile (this function runs with SECURITY DEFINER so it bypasses RLS)
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (current_user_id, display_name_value, current_user_email);
  
  -- Create user role if it doesn't exist
  INSERT INTO public.user_roles (user_id, role)
  VALUES (current_user_id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RAISE NOTICE 'Created profile for user: % with display name: %', current_user_email, display_name_value;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail
    RAISE WARNING 'Error in create_user_profile_if_missing: %', SQLERRM;
END;
$$;