-- Create pending_changes table for tracking admin changes that need owner approval
-- Note: The 'owner' enum value should already exist from the previous migration
CREATE TABLE public.pending_changes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  change_type TEXT NOT NULL CHECK (change_type IN ('post_edit', 'post_delete', 'post_create', 'user_role_change')),
  target_id UUID NOT NULL, -- ID of the post/user being changed
  requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  
  -- Store the original data (before changes)
  original_data JSONB,
  
  -- Store the proposed changes
  proposed_changes JSONB NOT NULL,
  
  -- Additional metadata
  change_summary TEXT NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_pending_changes_status ON public.pending_changes(status);
CREATE INDEX idx_pending_changes_type ON public.pending_changes(change_type);
CREATE INDEX idx_pending_changes_requested_by ON public.pending_changes(requested_by);
CREATE INDEX idx_pending_changes_target ON public.pending_changes(target_id);

-- Enable RLS
ALTER TABLE public.pending_changes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pending_changes
CREATE POLICY "Owners can view all pending changes" 
ON public.pending_changes 
FOR SELECT 
USING (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Admins can view their own pending changes" 
ON public.pending_changes 
FOR SELECT 
USING (requested_by = auth.uid());

CREATE POLICY "Admins can create pending changes" 
ON public.pending_changes 
FOR INSERT 
TO authenticated
WITH CHECK (
  requested_by = auth.uid() AND 
  public.has_role(auth.uid(), 'admin') AND 
  NOT public.has_role(auth.uid(), 'owner')
);

CREATE POLICY "Owners can update pending changes" 
ON public.pending_changes 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'owner'));

-- Create function to check if user is owner
CREATE OR REPLACE FUNCTION public.is_owner(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'owner'
  )
$$;

-- Create function to submit change request
CREATE OR REPLACE FUNCTION public.submit_change_request(
  _change_type TEXT,
  _target_id UUID,
  _original_data JSONB,
  _proposed_changes JSONB,
  _change_summary TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  change_id UUID;
BEGIN
  -- Check if user is admin but not owner
  IF NOT (public.has_role(auth.uid(), 'admin') AND NOT public.has_role(auth.uid(), 'owner')) THEN
    RAISE EXCEPTION 'Only admins (non-owners) can submit change requests';
  END IF;

  -- Insert the change request
  INSERT INTO public.pending_changes (
    change_type,
    target_id,
    requested_by,
    original_data,
    proposed_changes,
    change_summary
  ) VALUES (
    _change_type,
    _target_id,
    auth.uid(),
    _original_data,
    _proposed_changes,
    _change_summary
  ) RETURNING id INTO change_id;

  RETURN change_id;
END;
$$;

-- Create function to approve/reject change request
CREATE OR REPLACE FUNCTION public.review_change_request(
  _change_id UUID,
  _action TEXT, -- 'approve' or 'reject'
  _notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  change_record RECORD;
  post_data JSONB;
BEGIN
  -- Check if user is owner
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Only owners can review change requests';
  END IF;

  -- Validate action
  IF _action NOT IN ('approve', 'reject') THEN
    RAISE EXCEPTION 'Action must be either approve or reject';
  END IF;

  -- Get the change request
  SELECT * INTO change_record
  FROM public.pending_changes
  WHERE id = _change_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Change request not found or already processed';
  END IF;

  -- Update the change request status
  UPDATE public.pending_changes
  SET 
    status = _action || 'd', -- 'approved' or 'rejected'
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    review_notes = _notes,
    updated_at = now()
  WHERE id = _change_id;

  -- If approved, apply the changes
  IF _action = 'approve' THEN
    CASE change_record.change_type
      WHEN 'post_edit' THEN
        -- Apply post edits
        UPDATE public.posts
        SET 
          title = COALESCE((change_record.proposed_changes->>'title')::TEXT, title),
          category = COALESCE((change_record.proposed_changes->>'category')::TEXT, category),
          slug = COALESCE((change_record.proposed_changes->>'slug')::TEXT, slug),
          content = COALESCE((change_record.proposed_changes->>'content')::TEXT, content),
          pdf_url = COALESCE((change_record.proposed_changes->>'pdf_url')::TEXT, pdf_url),
          cover_url = COALESCE((change_record.proposed_changes->>'cover_url')::TEXT, cover_url),
          read_time_min = COALESCE((change_record.proposed_changes->>'read_time_min')::INTEGER, read_time_min),
          is_published = COALESCE((change_record.proposed_changes->>'is_published')::BOOLEAN, is_published),
          updated_at = now()
        WHERE id = change_record.target_id;

      WHEN 'post_delete' THEN
        -- Delete the post
        DELETE FROM public.posts WHERE id = change_record.target_id;

      WHEN 'user_role_change' THEN
        -- Handle role changes
        IF (change_record.proposed_changes->>'action')::TEXT = 'add_role' THEN
          INSERT INTO public.user_roles (user_id, role)
          VALUES (
            change_record.target_id,
            (change_record.proposed_changes->>'role')::public.app_role
          )
          ON CONFLICT (user_id, role) DO NOTHING;
        ELSIF (change_record.proposed_changes->>'action')::TEXT = 'remove_role' THEN
          DELETE FROM public.user_roles
          WHERE user_id = change_record.target_id
            AND role = (change_record.proposed_changes->>'role')::public.app_role;
        END IF;

      ELSE
        RAISE EXCEPTION 'Unknown change type: %', change_record.change_type;
    END CASE;
  END IF;

  RETURN TRUE;
END;
$$;

-- Update existing functions to respect owner permissions

-- Update has_role function to handle owner role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user can perform direct actions (owners can, admins need approval)
CREATE OR REPLACE FUNCTION public.can_perform_direct_action(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_owner(_user_id)
$$;

-- Update RLS policies for posts to require owner approval for admin changes
DROP POLICY IF EXISTS "Only admins can manage posts" ON public.posts;

CREATE POLICY "Owners can manage posts directly" 
ON public.posts 
FOR ALL 
USING (public.is_owner(auth.uid()));

CREATE POLICY "Admins can view posts" 
ON public.posts 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Prevent direct admin modifications (they must go through approval process)
CREATE POLICY "Prevent direct admin modifications" 
ON public.posts 
FOR UPDATE 
USING (false)
WITH CHECK (false);

CREATE POLICY "Prevent direct admin deletions" 
ON public.posts 
FOR DELETE 
USING (false);

CREATE POLICY "Prevent direct admin insertions" 
ON public.posts 
FOR INSERT 
WITH CHECK (false);

-- Update user_roles policies
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;

CREATE POLICY "Owners can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (public.is_owner(auth.uid()));

CREATE POLICY "Admins can view roles" 
ON public.user_roles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Prevent admins from directly changing roles (except their own user role)
CREATE POLICY "Prevent admin role changes" 
ON public.user_roles 
FOR UPDATE 
USING (false);

CREATE POLICY "Prevent admin role deletions" 
ON public.user_roles 
FOR DELETE 
USING (false);

CREATE POLICY "Prevent admin role insertions" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (false);

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.is_owner(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_change_request(TEXT, UUID, JSONB, JSONB, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_change_request(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_perform_direct_action(UUID) TO authenticated;

-- Update the get_all_users function to handle owner role
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  display_name TEXT,
  role TEXT,
  registered_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  email_confirmed_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the current user is an admin or owner
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner')) THEN
    RAISE EXCEPTION 'Access denied: Admin or Owner privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    p.user_id as id,
    p.email,
    p.display_name,
    CASE 
      WHEN EXISTS(SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.user_id AND ur.role = 'owner') THEN 'owner'
      WHEN EXISTS(SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.user_id AND ur.role = 'admin') THEN 'admin'
      ELSE 'user'
    END as role,
    p.created_at as registered_at,
    NULL::TIMESTAMPTZ as last_sign_in_at,
    p.created_at as email_confirmed_at
  FROM public.profiles p
  ORDER BY 
    CASE 
      WHEN EXISTS(SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.user_id AND ur.role = 'owner') THEN 1
      WHEN EXISTS(SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.user_id AND ur.role = 'admin') THEN 2
      ELSE 3
    END,
    p.created_at DESC;
END;
$$;