-- Make user_id optional to allow anonymous comments
ALTER TABLE public.comments 
ALTER COLUMN user_id DROP NOT NULL;

-- Add a flag to identify anonymous comments (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'comments' 
                   AND column_name = 'is_anonymous') THEN
        ALTER TABLE public.comments 
        ADD COLUMN is_anonymous BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Update RLS policies for comments to allow anonymous comments
DROP POLICY IF EXISTS "Anyone can view approved comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can manage all comments" ON public.comments;

-- Allow anyone to view approved comments (updated to include anonymous)
CREATE POLICY "Anyone can view approved comments" ON public.comments
  FOR SELECT USING (is_approved = true OR public.has_role(auth.uid(), 'admin'));

-- Allow authenticated users to insert their own comments
CREATE POLICY "Authenticated users can create comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id AND is_anonymous = false);

-- Allow anonymous users to insert anonymous comments
CREATE POLICY "Anonymous users can insert anonymous comments" ON public.comments
  FOR INSERT WITH CHECK (user_id IS NULL AND is_anonymous = true);

-- Allow users to update their own comments (not anonymous ones)
CREATE POLICY "Users can update their own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id AND is_anonymous = false);

-- Allow admins to manage all comments
CREATE POLICY "Admins can manage all comments" ON public.comments
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));