-- Create a view that joins audit logs with user emails
CREATE OR REPLACE VIEW public.posts_audit_log_with_users AS
SELECT 
    pal.*,
    au.email as user_email
FROM public.posts_audit_log pal
LEFT JOIN auth.users au ON pal.changed_by = au.id;

-- Grant access to the view
GRANT SELECT ON public.posts_audit_log_with_users TO authenticated;

-- Add RLS policy for the view
ALTER VIEW public.posts_audit_log_with_users SET (security_invoker = on);
