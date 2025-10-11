-- Function to auto-generate excerpt from content
CREATE OR REPLACE FUNCTION public.generate_excerpt_from_content(content_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- If content is null or empty, return a default message
  IF content_text IS NULL OR LENGTH(TRIM(content_text)) = 0 THEN
    RETURN 'A new post has been published. Click to read the full article.';
  END IF;
  
  -- Clean the content: remove extra whitespace and newlines
  content_text := REGEXP_REPLACE(content_text, '\s+', ' ', 'g');
  content_text := TRIM(content_text);
  
  -- If content is shorter than 150 characters, return it as is
  IF LENGTH(content_text) <= 150 THEN
    RETURN content_text;
  END IF;
  
  -- Extract first 150 characters and find the last complete word
  DECLARE
    excerpt_text TEXT;
    last_space_pos INTEGER;
  BEGIN
    excerpt_text := SUBSTRING(content_text FROM 1 FOR 150);
    last_space_pos := POSITION(' ' IN REVERSE(excerpt_text));
    
    -- If we found a space, cut at the last complete word
    IF last_space_pos > 0 THEN
      excerpt_text := SUBSTRING(excerpt_text FROM 1 FOR LENGTH(excerpt_text) - last_space_pos + 1);
    END IF;
    
    -- Add ellipsis if we truncated
    IF LENGTH(excerpt_text) < LENGTH(content_text) THEN
      excerpt_text := excerpt_text || '...';
    END IF;
    
    RETURN excerpt_text;
  END;
END;
$$;

-- Function to get excerpt (either explicit or auto-generated)
CREATE OR REPLACE FUNCTION public.get_post_excerpt(post_excerpt TEXT, post_content TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- If explicit excerpt exists and is not empty, use it
  IF post_excerpt IS NOT NULL AND LENGTH(TRIM(post_excerpt)) > 0 THEN
    RETURN TRIM(post_excerpt);
  END IF;
  
  -- Otherwise, generate from content
  RETURN public.generate_excerpt_from_content(post_content);
END;
$$;

-- Update existing posts that don't have excerpts
UPDATE public.posts 
SET excerpt = public.generate_excerpt_from_content(content)
WHERE (excerpt IS NULL OR LENGTH(TRIM(excerpt)) = 0) 
  AND content IS NOT NULL 
  AND LENGTH(TRIM(content)) > 0;

-- For posts that don't have content (PDF posts), set a default excerpt
UPDATE public.posts 
SET excerpt = 'A new post has been published. Click to read the full article.'
WHERE (excerpt IS NULL OR LENGTH(TRIM(excerpt)) = 0) 
  AND (content IS NULL OR LENGTH(TRIM(content)) = 0);