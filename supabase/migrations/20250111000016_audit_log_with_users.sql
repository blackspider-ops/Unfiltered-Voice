-- Create a function to get audit logs with user emails
CREATE OR REPLACE FUNCTION public.get_audit_logs_with_users()
RETURNS TABLE (
    id UUID,
    post_id UUID,
    action TEXT,
    old_data JSONB,
    new_data JSONB,
    changed_by UUID,
    changed_at TIMESTAMPTZ,
    user_email TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pal.id,
        pal.post_id,
        pal.action,
        pal.old_data,
        pal.new_data,
        pal.changed_by,
        pal.changed_at,
        au.email::TEXT as user_email
    FROM public.posts_audit_log pal
    LEFT JOIN auth.users au ON pal.changed_by = au.id
    WHERE public.has_role(auth.uid(), 'owner')
    ORDER BY pal.changed_at DESC
    LIMIT 50;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_audit_logs_with_users() TO authenticated;
