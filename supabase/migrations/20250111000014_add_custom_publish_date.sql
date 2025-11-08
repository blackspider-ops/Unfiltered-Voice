-- Add custom publish date column to posts table
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Set default published_at to created_at for existing posts
UPDATE public.posts 
SET published_at = created_at 
WHERE published_at IS NULL;

-- Create index for better performance when sorting by published date
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON public.posts(published_at DESC);

-- Create a function to check if a post should be visible (published and date has arrived)
CREATE OR REPLACE FUNCTION public.is_post_visible(post_published BOOLEAN, post_published_at TIMESTAMPTZ)
RETURNS BOOLEAN
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT post_published = true AND post_published_at <= NOW();
$$;

-- Update RLS policy for posts to only show posts that are published AND the publish date has arrived
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.posts;
CREATE POLICY "Anyone can view published posts" 
ON public.posts 
FOR SELECT 
USING (
  (is_published = true AND published_at <= NOW()) 
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'owner')
);