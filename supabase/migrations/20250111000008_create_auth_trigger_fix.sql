-- Create a more robust trigger that handles profile creation on every auth event
-- This will catch both new users AND users whose profiles were deleted

-- First, let's create a function that handles profile creation more robustly
CREATE OR REPLACE FUNCTION public.ensure_profile_exists()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  display_name_value TEXT;
BEGIN
  -- Check if this is a login event and profile doesn't exist
  IF TG_OP = 'UPDATE' AND OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at THEN
    -- This is a login event, check if profile exists
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = NEW.id) THEN
      -- Profile doesn't exist, create it
      
      -- Extract display name
      display_name_value := COALESCE(
        NEW.raw_user_meta_data ->> 'display_name',
        NEW.raw_user_meta_data ->> 'full_name',
        NEW.raw_user_meta_data ->> 'name',
        TRIM(CONCAT(
          COALESCE(NEW.raw_user_meta_data ->> 'given_name', ''),
          ' ',
          COALESCE(NEW.raw_user_meta_data ->> 'family_name', '')
        )),
        NEW.raw_user_meta_data ->> 'user_name',
        NEW.email
      );
      
      -- Clean up the name
      display_name_value := TRIM(REGEXP_REPLACE(display_name_value, '\s+', ' ', 'g'));
      
      IF display_name_value IS NULL OR LENGTH(TRIM(display_name_value)) = 0 THEN
        display_name_value := NEW.email;
      END IF;
      
      -- Create profile
      INSERT INTO public.profiles (user_id, display_name, email)
      VALUES (NEW.id, display_name_value, NEW.email);
      
      -- Create user role if it doesn't exist
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'user')
      ON CONFLICT (user_id, role) DO NOTHING;
      
      RAISE NOTICE 'Auto-created profile for user % on login', NEW.email;
    END IF;
  END IF;
  
  -- Also handle new user creation (INSERT)
  IF TG_OP = 'INSERT' THEN
    -- Extract display name
    display_name_value := COALESCE(
      NEW.raw_user_meta_data ->> 'display_name',
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      TRIM(CONCAT(
        COALESCE(NEW.raw_user_meta_data ->> 'given_name', ''),
        ' ',
        COALESCE(NEW.raw_user_meta_data ->> 'family_name', '')
      )),
      NEW.raw_user_meta_data ->> 'user_name',
      NEW.email
    );
    
    -- Clean up the name
    display_name_value := TRIM(REGEXP_REPLACE(display_name_value, '\s+', ' ', 'g'));
    
    IF display_name_value IS NULL OR LENGTH(TRIM(display_name_value)) = 0 THEN
      display_name_value := NEW.email;
    END IF;
    
    -- Create profile
    INSERT INTO public.profiles (user_id, display_name, email)
    VALUES (NEW.id, display_name_value, NEW.email);
    
    -- Create user role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RAISE NOTICE 'Created profile for new user %', NEW.email;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth process
    RAISE WARNING 'Error in ensure_profile_exists: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Drop existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;

-- Create new comprehensive trigger for both INSERT and UPDATE
CREATE TRIGGER on_auth_user_profile_check
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_profile_exists();

-- Also update the original handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function is kept for backward compatibility
  -- The main logic is now in ensure_profile_exists()
  RETURN NEW;
END;
$$;