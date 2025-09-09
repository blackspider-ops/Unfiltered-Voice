-- Create about_content table for the Meet Niyati page
CREATE TABLE IF NOT EXISTS about_content (
    id TEXT PRIMARY KEY DEFAULT 'main',
    title TEXT NOT NULL DEFAULT 'Meet Niyati',
    subtitle TEXT NOT NULL DEFAULT 'The Voice Behind The Unfiltered Thoughts',
    bio TEXT NOT NULL,
    profile_image_url TEXT,
    cover_image_url TEXT,
    interests TEXT[] DEFAULT ARRAY[]::TEXT[],
    social_links JSONB DEFAULT '{}'::JSONB,
    fun_facts TEXT[] DEFAULT ARRAY[]::TEXT[],
    favorite_quote TEXT,
    quote_author TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read about content
CREATE POLICY "Allow public read access to about content" ON about_content
    FOR SELECT USING (true);

-- Allow admins to update about content
CREATE POLICY "Allow admins to update about content" ON about_content
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'owner')
        )
    );

-- Insert default content
INSERT INTO about_content (
    id,
    title,
    subtitle,
    bio,
    profile_image_url,
    cover_image_url,
    interests,
    social_links,
    fun_facts,
    favorite_quote,
    quote_author
) VALUES (
    'main',
    'Meet Niyati',
    'The Voice Behind The Unfiltered Thoughts',
    E'Hey there! I''m Niyati, a passionate writer who believes in the power of authentic storytelling.\n\nThis blog is my digital sanctuary where I share unfiltered thoughts about life, mental health, current affairs, and everything in between. I write not because I have all the answers, but because I believe in the beauty of questions and the journey of finding ourselves through words.\n\nWhen I''m not writing, you''ll find me reading, exploring new coffee shops, or having deep conversations about life with friends. I believe that every story matters and every voice deserves to be heard.',
    '/placeholder-profile.jpg',
    '/placeholder-cover.jpg',
    ARRAY['Writing', 'Reading', 'Mental Health Advocacy', 'Coffee', 'Photography', 'Travel'],
    '{"email": "hello@theunfilteredvoice.com", "instagram": "@niyati_writes", "twitter": "@niyati_thoughts", "linkedin": "niyati-writer"}',
    ARRAY[
        'I drink at least 3 cups of coffee a day',
        'I have read over 100 books this year',
        'I write my best pieces at 2 AM',
        'I collect vintage notebooks',
        'I believe pineapple belongs on pizza'
    ],
    'The most important thing is to try and inspire people so that they can be great at whatever they want to do.',
    'Kobe Bryant'
) ON CONFLICT (id) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_about_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_about_content_updated_at
    BEFORE UPDATE ON about_content
    FOR EACH ROW
    EXECUTE FUNCTION update_about_content_updated_at();