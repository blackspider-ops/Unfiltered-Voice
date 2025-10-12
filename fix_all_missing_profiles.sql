-- Fix all missing profiles at once
-- Run this in Supabase SQL Editor

INSERT INTO public.profiles (user_id, display_name, email)
SELECT 
  u.id,
  COALESCE(
    u.raw_user_meta_data ->> 'display_name',
    u.raw_user_meta_data ->> 'full_name',
    u.raw_user_meta_data ->> 'name',
    TRIM(CONCAT(
      COALESCE(u.raw_user_meta_data ->> 'given_name', ''),
      ' ',
      COALESCE(u.raw_user_meta_data ->> 'family_name', '')
    )),
    u.raw_user_meta_data ->> 'user_name',
    u.email
  ) as display_name,
  u.email
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;

-- Also create user roles for all missing users
INSERT INTO public.user_roles (user_id, role)
SELECT 
  u.id,
  'user'
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.user_id IS NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Show the results
SELECT 
  p.user_id,
  p.display_name,
  p.email,
  ur.role
FROM public.profiles p
JOIN public.user_roles ur ON p.user_id = ur.user_id
ORDER BY p.created_at DESC;