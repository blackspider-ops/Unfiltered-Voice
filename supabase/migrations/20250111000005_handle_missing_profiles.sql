-- Function to ensure user profile exists (called on every login)
CREATE OR REPLACE FUNCTION public.ensure_user_profile(user_id UUID, user_email TEXT, user_metadata JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  display_name_value TEXT;
BEGIN
  -- Check if profile already exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = ensure_user_profile.user_id) THEN
    RETURN; -- Profile exists, nothing to do
  END IF;
  
  -- Profile doesn't exist, create it
  -- Extract display name from metadata
  display_name_value := COALESCE(
    user_metadata ->> 'display_name',  -- Custom display_name
    user_metadata ->> 'full_name',     -- Google full_name
    user_metadata ->> 'name',          -- Google name
    CONCAT(
      user_metadata ->> 'given_name',   -- Google first name
      ' ',
      user_metadata ->> 'family_name'   -- Google last name
    ),
    user_metadata ->> 'user_name',     -- GitHub username
    user_email  -- Fallback to email
  );
  
  -- Clean up the concatenated name
  display_name_value := TRIM(REGEXP_REPLACE(display_name_value, '\s+', ' ', 'g'));
  
  -- If it's still just spaces or empty, use email
  IF display_name_value IS NULL OR LENGTH(TRIM(display_name_value)) = 0 THEN
    display_name_value := user_email;
  END IF;

  -- Insert into profiles table
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (user_id, display_name_value, user_email);
  
  -- Check if user role exists, if not create it
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = ensure_user_profile.user_id) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (user_id, 'user');
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail
    RAISE WARNING 'Error in ensure_user_profile for user %: %', user_id, SQLERRM;
END;
$$;

-- Update the handle_new_user function to also call ensure_user_profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Use the new ensure_user_profile function
  PERFORM public.ensure_user_profile(NEW.id, NEW.email, NEW.raw_user_meta_data);
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and still return NEW to not break auth
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create a function that can be called from the client to fix missing profiles
CREATE OR REPLACE FUNCTION public.fix_missing_profile()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  current_user_email TEXT;
  current_user_metadata JSONB;
BEGIN
  -- Get current user info
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Get user details from auth.users
  SELECT email, raw_user_meta_data 
  INTO current_user_email, current_user_metadata
  FROM auth.users 
  WHERE id = current_user_id;
  
  -- Ensure profile exists
  PERFORM public.ensure_user_profile(current_user_id, current_user_email, current_user_metadata);
END;
$$;