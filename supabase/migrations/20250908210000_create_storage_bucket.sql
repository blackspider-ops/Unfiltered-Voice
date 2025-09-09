-- Create storage bucket for blog content
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-content',
  'blog-content',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
);

-- Create storage policies for blog content bucket
CREATE POLICY "Authenticated users can upload blog content" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'blog-content');

CREATE POLICY "Anyone can view blog content" ON storage.objects
FOR SELECT USING (bucket_id = 'blog-content');

CREATE POLICY "Admins can delete blog content" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'blog-content' AND
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update blog content" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'blog-content' AND
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);