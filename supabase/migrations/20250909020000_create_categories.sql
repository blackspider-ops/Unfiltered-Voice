-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT 'bg-blue-600',
  icon TEXT DEFAULT 'FileText',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add tags column if it doesn't exist
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories
DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;
DROP POLICY IF EXISTS "Only admins can manage categories" ON public.categories;

CREATE POLICY "Anyone can view active categories" 
ON public.categories 
FOR SELECT 
USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage categories" 
ON public.categories 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON public.categories(sort_order);

-- Insert default categories (only if they don't exist)
INSERT INTO public.categories (slug, title, description, color, icon, sort_order) VALUES
('mental-health', 'Mind Matters', 'Dive deep into the complexities of mental health, personal growth, and the raw realities of being human. Here, I share my journey through anxiety, self-doubt, moments of clarity, and everything in between.', 'bg-purple-600', 'Brain', 1),
('current-affairs', 'News & Views', 'My unfiltered take on current events, social issues, and the world around us. No political correctness here – just honest opinions from a Gen-Z perspective.', 'bg-blue-600', 'Newspaper', 2),
('creative-writing', 'Bleeding Ink', 'The creative corner where emotions bleed onto paper. Poetry, short stories, and artistic expressions that come from the deepest parts of my soul.', 'bg-pink-600', 'PenTool', 3),
('books', 'Reading Reflections', 'My thoughts on books that have moved me, changed my perspective, or simply entertained me. Honest reviews and deep dives into storytelling.', 'bg-green-600', 'BookOpen', 4)
ON CONFLICT (slug) DO NOTHING;

-- Update existing categories with tags
UPDATE public.categories SET tags = ARRAY['Mental Health', 'Self-Discovery', 'Personal Growth', 'Anxiety', 'Mindfulness'] WHERE slug = 'mental-health' AND tags IS NULL;
UPDATE public.categories SET tags = ARRAY['Current Affairs', 'Social Issues', 'Politics', 'Society', 'Opinion'] WHERE slug = 'current-affairs' AND tags IS NULL;
UPDATE public.categories SET tags = ARRAY['Poetry', 'Creative Writing', 'Short Stories', 'Art', 'Expression'] WHERE slug = 'creative-writing' AND tags IS NULL;
UPDATE public.categories SET tags = ARRAY['Book Reviews', 'Literature', 'Reading', 'Analysis', 'Storytelling'] WHERE slug = 'books' AND tags IS NULL;