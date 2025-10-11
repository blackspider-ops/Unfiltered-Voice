-- Update the handle_new_user function to properly extract names from Google OAuth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Extract display name from various possible sources
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
  END;

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
END;
$$;

-- Update existing users who have email as display name to use their actual name
UPDATE public.profiles 
SET display_name = COALESCE(
  (SELECT u.raw_user_meta_data ->> 'full_name' FROM auth.users u WHERE u.id = profiles.user_id),
  (SELECT u.raw_user_meta_data ->> 'name' FROM auth.users u WHERE u.id = profiles.user_id),
  (SELECT CONCAT(
    u.raw_user_meta_data ->> 'given_name',
    ' ',
    u.raw_user_meta_data ->> 'family_name'
  ) FROM auth.users u WHERE u.id = profiles.user_id),
  display_name  -- Keep current if no better option
)
WHERE display_name = email  -- Only update if display name is currently the email
  AND EXISTS (
    SELECT 1 FROM auth.users u 
    WHERE u.id = profiles.user_id 
    AND (
      u.raw_user_meta_data ->> 'full_name' IS NOT NULL OR
      u.raw_user_meta_data ->> 'name' IS NOT NULL OR
      (u.raw_user_meta_data ->> 'given_name' IS NOT NULL AND u.raw_user_meta_data ->> 'family_name' IS NOT NULL)
    )
  );