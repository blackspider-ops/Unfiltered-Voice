-- Fix the handle_new_user function syntax issue
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  display_name_value TEXT;
BEGIN
  -- Try to get name from different OAuth provider fields
  display_name_value := COALESCE(
    NEW.raw_user_meta_data ->> 'display_name',  -- Custom display_name
    NEW.raw_user_meta_data ->> 'full_name',     -- Google full_name
    NEW.raw_user_meta_data ->> 'name',          -- Google name
    CONCAT(
      NEW.raw_user_meta_data ->> 'given_name',   -- Google first name
      ' ',
      NEW.raw_user_meta_data ->> 'family_name'   -- Google last name
    ),
    NEW.raw_user_meta_data ->> 'user_name',     -- GitHub username
    NEW.email  -- Fallback to email
  );
  
  -- Clean up the concatenated name (remove extra spaces)
  display_name_value := TRIM(REGEXP_REPLACE(display_name_value, '\s+', ' ', 'g'));
  
  -- If it's still just spaces or empty, use email
  IF display_name_value IS NULL OR LENGTH(TRIM(display_name_value)) = 0 THEN
    display_name_value := NEW.email;
  END IF;

  -- Insert into profiles table
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (
    NEW.id, 
    display_name_value,
    NEW.email
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and still return NEW to not break auth
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;