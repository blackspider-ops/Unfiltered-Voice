-- Add owner value to the app_role enum
-- This must be done in a separate transaction from using the new value
ALTER TYPE public.app_role ADD VALUE 'owner';