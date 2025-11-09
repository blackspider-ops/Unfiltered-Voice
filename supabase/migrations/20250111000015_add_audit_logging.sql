-- Add audit logging for posts table to track deletions and changes
-- This will help investigate issues in the future

-- Create audit log table
CREATE TABLE IF NOT EXISTS public.posts_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  old_data JSONB,
  new_data JSONB,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE public.posts_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins and owners can view audit logs
CREATE POLICY "Only admins can view audit logs" 
ON public.posts_audit_log 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));

-- Create function to log post changes
CREATE OR REPLACE FUNCTION public.log_post_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.posts_audit_log (post_id, action, old_data, changed_by)
    VALUES (
      OLD.id,
      'DELETE',
      to_jsonb(OLD),
      auth.uid()
    );
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.posts_audit_log (post_id, action, old_data, new_data, changed_by)
    VALUES (
      NEW.id,
      'UPDATE',
      to_jsonb(OLD),
      to_jsonb(NEW),
      auth.uid()
    );
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.posts_audit_log (post_id, action, new_data, changed_by)
    VALUES (
      NEW.id,
      'INSERT',
      to_jsonb(NEW),
      auth.uid()
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for audit logging
DROP TRIGGER IF EXISTS posts_audit_trigger ON public.posts;
CREATE TRIGGER posts_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.log_post_changes();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_posts_audit_log_post_id ON public.posts_audit_log(post_id);
CREATE INDEX IF NOT EXISTS idx_posts_audit_log_changed_at ON public.posts_audit_log(changed_at DESC);

-- Add soft delete capability (optional - keeps deleted posts in database)
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_posts_deleted_at ON public.posts(deleted_at) WHERE deleted_at IS NOT NULL;