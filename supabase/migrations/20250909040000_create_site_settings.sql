-- Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for site_settings
DROP POLICY IF EXISTS "Anyone can view site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Only admins can manage site settings" ON public.site_settings;

CREATE POLICY "Anyone can view site settings" 
ON public.site_settings Error Failed to load settings
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage site settings" 
ON public.site_settings 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings(key);
CREATE INDEX IF NOT EXISTS idx_site_settings_category ON public.site_settings(category);

-- Insert default site settings with proper JSONB formatting
INSERT INTO public.site_settings (key, value, description, category) VALUES
('site_name', '"The Unfiltered Voice"'::jsonb, 'Main site name displayed in header and title', 'branding'),
('site_tagline', '"by Niyati Singhal"'::jsonb, 'Tagline displayed under the site name', 'branding'),
('hero_title', '"Welcome to my unfiltered world"'::jsonb, 'Main hero section title', 'hero'),
('hero_subtitle', '"Where thoughts flow freely, emotions run deep, and authenticity reigns supreme. This is my space to share the raw, unpolished truths of life."'::jsonb, 'Hero section subtitle', 'hero'),
('typing_quotes', '["Sometimes the most profound thoughts come in the quiet moments between chaos.", "Mental health isn''t a destination, it''s a journey with no final stop.", "In a world of filters, I choose to be unfiltered.", "Words have power. I choose to use mine wisely.", "Every story matters, including yours."]'::jsonb, 'Rotating quotes in the typing animation', 'hero'),
('about_title', '"About The Voice"'::jsonb, 'About section title', 'about'),
('about_description', '"This blog is my sanctuary – a place where I can be completely honest about the human experience. Here, you''ll find my thoughts on mental health, current events, creative expressions, and book reflections. No sugar-coating, no pretense, just authentic conversations about life."'::jsonb, 'About section description', 'about'),
('words_to_live_by_title', '"Words to Live By"'::jsonb, 'Words to live by section title', 'quotes'),
('words_to_live_by', '["Be kind to yourself – you''re doing better than you think.", "Your mental health is just as important as your physical health.", "It''s okay to not be okay, but it''s not okay to stay that way.", "Progress, not perfection.", "You are not your thoughts; you are the observer of your thoughts."]'::jsonb, 'Inspirational quotes/words to live by', 'quotes'),
('footer_text', '"Made with ❤️ and a lot of coffee"'::jsonb, 'Footer text', 'footer'),
('social_instagram', '"https://instagram.com"'::jsonb, 'Instagram profile URL', 'social'),
('social_linkedin', '"https://linkedin.com"'::jsonb, 'LinkedIn profile URL', 'social'),
('contact_email', '"hello@niyatisinghal.com"'::jsonb, 'Contact email address', 'contact'),
('meta_description', '"The Unfiltered Voice - Authentic thoughts on mental health, current affairs, creative writing, and book reflections by Niyati Singhal"'::jsonb, 'Site meta description for SEO', 'seo'),
('meta_keywords', '"mental health, blog, current affairs, creative writing, books, authentic, unfiltered, Niyati Singhal"'::jsonb, 'Site meta keywords for SEO', 'seo')
ON CONFLICT (key) DO NOTHING;

-- Create function to get site setting
CREATE OR REPLACE FUNCTION public.get_site_setting(setting_key TEXT)
RETURNS JSONB
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT value FROM public.site_settings WHERE key = setting_key LIMIT 1;
$$;

-- Create function to update site setting
CREATE OR REPLACE FUNCTION public.update_site_setting(setting_key TEXT, setting_value JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.site_settings 
  SET value = setting_value, updated_at = now()
  WHERE key = setting_key;
  
  IF NOT FOUND THEN
    INSERT INTO public.site_settings (key, value) VALUES (setting_key, setting_value);
  END IF;
  
  RETURN TRUE;
END;
$$;