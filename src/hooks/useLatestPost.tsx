import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LatestPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  uploaded_at: string;
}

export function useLatestPost() {
  const [latestPost, setLatestPost] = useState<LatestPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestPost();
  }, []);

  const fetchLatestPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, slug, category, uploaded_at')
        .eq('is_published', true)
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setLatestPost(data);
    } catch (error) {
      setLatestPost(null);
    } finally {
      setLoading(false);
    }
  };

  const getLatestPostUrl = () => {
    if (!latestPost) return '/';
    return `/${latestPost.category}/${latestPost.slug}`;
  };

  return {
    latestPost,
    loading,
    getLatestPostUrl
  };
}