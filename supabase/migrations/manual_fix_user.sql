-- Manual fix for the broken user
-- Run this in Supabase SQL Editor

-- First, let's see what users exist in auth but not in profiles
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data,
  p.user_id as profile_exists
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;

-- Now let's manually create the missing profile
-- Replace the user_id below with the actual user ID from the query above
DO $$
DECLARE
  missing_user_id UUID;
  missing_user_email TEXT;
  missing_user_metadata JSONB;
  display_name_value TEXT;
BEGIN
  -- Get the user without a profile
  SELECT u.id, u.email, u.raw_user_meta_data
  INTO missing_user_id, missing_user_email, missing_user_metadata
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.user_id
  WHERE p.user_id IS NULL
  LIMIT 1;
  
  IF missing_user_id IS NOT NULL THEN
    -- Extract display name
    display_name_value := COALESCE(
      missing_user_metadata ->> 'display_name',
      missing_user_metadata ->> 'full_name',
      missing_user_metadata ->> 'name',
      CONCAT(
        missing_user_metadata ->> 'given_name',
        ' ',
        missing_user_metadata ->> 'family_name'
      ),
      missing_user_metadata ->> 'user_name',
      missing_user_email
    );
    
    -- Clean up the name
    display_name_value := TRIM(REGEXP_REPLACE(display_name_value, '\s+', ' ', 'g'));
    
    IF display_name_value IS NULL OR LENGTH(TRIM(display_name_value)) = 0 THEN
      display_name_value := missing_user_email;
    END IF;
    
    -- Create the profile
    INSERT INTO public.profiles (user_id, display_name, email)
    VALUES (missing_user_id, display_name_value, missing_user_email);
    
    -- Create the user role if it doesn't exist
    INSERT INTO public.user_roles (user_id, role)
    VALUES (missing_user_id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Created profile for user: % with display name: %', missing_user_email, display_name_value;
  ELSE
    RAISE NOTICE 'No users found without profiles';
  END IF;
END $$;