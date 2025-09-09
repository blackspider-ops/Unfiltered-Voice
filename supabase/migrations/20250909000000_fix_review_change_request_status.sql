-- Fix the review_change_request function to properly set status values
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
  new_status TEXT;
BEGIN
  -- Check if user is owner
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Only owners can review change requests';
  END IF;

  -- Validate action and set proper status
  IF _action = 'approve' THEN
    new_status := 'approved';
  ELSIF _action = 'reject' THEN
    new_status := 'rejected';
  ELSE
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
    status = new_status,
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