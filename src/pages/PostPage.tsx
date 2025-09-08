import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Comments } from '@/components/Comments';
import { ArrowLeft, Clock, Share } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: string;
  title: string;
  category: string;
  slug: string;
  cover_url: string | null;
  pdf_url: string;
  uploaded_at: string;
  read_time_min: number;
}

const categoryLabels = {
  'mental-health': 'Mind Matters',
  'current-affairs': 'News & Views', 
  'creative-writing': 'Bleeding Ink',
  'books': 'Reading Reflections'
};

export default function PostPage() {
  const { category, slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (category && slug) {
      fetchPost();
    }
  }, [category, slug]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('category', category)
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) {
        console.error('Error fetching post:', error);
        if (error.code === 'PGRST116') {
          navigate('/404', { replace: true });
          return;
        }
        throw error;
      }

      setPost(data);
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('Failed to load post');
      navigate('/', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-4 bg-surface rounded mb-4 w-20"></div>
            <div className="h-8 bg-surface rounded mb-4 w-3/4"></div>
            <div className="h-4 bg-surface rounded mb-8 w-1/2"></div>
            <div className="h-96 bg-surface rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(`/${category}`)}
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {categoryLabels[category as keyof typeof categoryLabels]}
        </Button>

        {/* Post Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">
              {categoryLabels[post.category as keyof typeof categoryLabels]}
            </Badge>
            <span className="text-muted-foreground">•</span>
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <Clock className="h-4 w-4" />
              {post.read_time_min} min read
            </div>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground text-sm">
              {formatDistanceToNow(new Date(post.uploaded_at), { addSuffix: true })}
            </span>
          </div>

          <h1 className="text-4xl font-display font-bold text-foreground mb-4">
            {post.title}
          </h1>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">By Niyati Singhal</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex items-center gap-2"
            >
              <Share className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Cover Image */}
        {post.cover_url && (
          <div className="mb-8">
            <img
              src={post.cover_url}
              alt={post.title}
              className="w-full h-64 object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* PDF Viewer */}
        <div className="mb-12">
          <div className="bg-surface border border-subtle rounded-lg overflow-hidden">
            <iframe
              src={post.pdf_url}
              className="w-full h-[800px]"
              title={post.title}
              style={{
                border: 'none',
                backgroundColor: '#1a1a1a'
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Having trouble viewing? The PDF should load automatically. 
            If not, please refresh the page.
          </p>
        </div>

        {/* Comments Section */}
        <div className="border-t border-subtle pt-8">
          <Comments postId={post.id} />
        </div>
      </div>
    </div>
  );
}