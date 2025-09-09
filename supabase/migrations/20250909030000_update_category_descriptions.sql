-- Update existing categories with detailed descriptions
UPDATE public.categories 
SET description = 'Dive deep into the complexities of mental health, personal growth, and the raw realities of being human. Here, I share my journey through anxiety, self-doubt, moments of clarity, and everything in between.'
WHERE slug = 'mental-health';

UPDATE public.categories 
SET description = 'My unfiltered take on current events, social issues, and the world around us. No political correctness here – just honest opinions from a Gen-Z perspective.'
WHERE slug = 'current-affairs';

UPDATE public.categories 
SET description = 'The creative corner where emotions bleed onto paper. Poetry, short stories, and artistic expressions that come from the deepest parts of my soul.'
WHERE slug = 'creative-writing';

UPDATE public.categories 
SET description = 'My thoughts on books that have moved me, changed my perspective, or simply entertained me. Honest reviews and deep dives into storytelling.'
WHERE slug = 'books';