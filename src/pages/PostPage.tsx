import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Comments } from '@/components/Comments';
import { ArrowLeft, Clock, Share } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PostCoverImage } from '@/components/PostCoverImage';

interface Post {
  id: string;
  title: string;
  category: string;
  slug: string;
  cover_url: string | null;
  pdf_url: string | null;
  content: string | null;
  uploaded_at: string;
  published_at: string;
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

  // Validate category
  const validCategories = ['mental-health', 'current-affairs', 'creative-writing', 'books'];
  
  useEffect(() => {
    if (!category || !validCategories.includes(category)) {
      navigate('/404', { replace: true });
      return;
    }
    
    if (category && slug) {
      fetchPost();
    }
  }, [category, slug, navigate]);

  const fetchPost = async () => {
    if (!category || !slug) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('category', category)
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          navigate('/404', { replace: true });
          return;
        }
        throw error;
      }

      if (data) {
        setPost(data);
      } else {
        navigate('/404', { replace: true });
      }
    } catch (error) {
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
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="animate-pulse">
            {/* Back button skeleton */}
            <div className="h-10 bg-muted rounded mb-6 w-32"></div>
            
            {/* Badge and meta info skeleton */}
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 bg-muted rounded w-24"></div>
              <div className="h-4 bg-muted rounded w-2"></div>
              <div className="h-4 bg-muted rounded w-20"></div>
              <div className="h-4 bg-muted rounded w-2"></div>
              <div className="h-4 bg-muted rounded w-24"></div>
            </div>
            
            {/* Title skeleton */}
            <div className="h-12 bg-muted rounded mb-4 w-3/4"></div>
            
            {/* Author and share skeleton */}
            <div className="flex items-center justify-between mb-8">
              <div className="h-5 bg-muted rounded w-32"></div>
              <div className="h-9 bg-muted rounded w-20"></div>
            </div>
            
            {/* Content skeleton */}
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="h-4 bg-muted rounded w-4/5"></div>
              <div className="h-6 bg-muted rounded w-1/2 mt-6"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <p>Category: {category}</p>
          <p>Slug: {slug}</p>
        </div>
      </div>
    );
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
              {formatDistanceToNow(new Date(post.published_at || post.uploaded_at), { addSuffix: true })}
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
            <PostCoverImage
              src={post.cover_url}
              alt={post.title}
              postId={post.id}
              title={post.title}
              className="w-full rounded-lg overflow-hidden"
              objectFit="contain"
            />
          </div>
        )}

        {/* Content Section */}
        <div className="mb-12">
          {/* Text Content - Prioritize text content over PDF */}
          {post.content ? (
            <div className="mb-8">
              <article className="prose prose-lg prose-gray dark:prose-invert max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({children}) => <h1 className="text-3xl font-bold text-foreground mb-6 mt-8">{children}</h1>,
                    h2: ({children}) => <h2 className="text-2xl font-semibold text-foreground mb-4 mt-6">{children}</h2>,
                    h3: ({children}) => <h3 className="text-xl font-semibold text-foreground mb-3 mt-5">{children}</h3>,
                    p: ({children}) => <p className="text-foreground mb-4 leading-relaxed">{children}</p>,
                    strong: ({children}) => <strong className="font-semibold text-foreground">{children}</strong>,
                    em: ({children}) => <em className="italic text-foreground">{children}</em>,
                    ul: ({children}) => <ul className="list-disc list-inside mb-4 space-y-2 text-foreground">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal list-inside mb-4 space-y-2 text-foreground">{children}</ol>,
                    li: ({children}) => <li className="text-foreground">{children}</li>,
                    blockquote: ({children}) => <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-4">{children}</blockquote>,
                    code: ({children}) => <code className="bg-muted px-2 py-1 rounded text-sm font-mono">{children}</code>,
                    pre: ({children}) => <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>,
                    a: ({href, children}) => <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </article>
            </div>
          ) : post.pdf_url && (post.pdf_url.startsWith('http') || post.pdf_url.startsWith('https')) ? (
            /* PDF Viewer - Only show if no text content and PDF URL is valid */
            <div className="mt-8">
              <div className="bg-surface border border-subtle rounded-lg overflow-hidden">
                <iframe
                  src={post.pdf_url}
                  className="w-full h-[800px]"
                  title={post.title}
                  style={{
                    border: 'none',
                    backgroundColor: '#1a1a1a'
                  }}
                  onError={() => {}}
                />
                <p className="text-xs text-muted-foreground mt-2 text-center p-4">
                  Having trouble viewing? The PDF should load automatically. 
                  If not, please refresh the page or{' '}
                  <a 
                    href={post.pdf_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    open in new tab
                  </a>.
                </p>
              </div>
            </div>
          ) : (
            /* No Content Available */
            <div className="bg-surface border border-subtle rounded-lg p-8 text-center">
              <div className="text-muted-foreground mb-4">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-semibold mb-2">Content Coming Soon</h3>
                <p className="text-sm">
                  The content for this post will be available soon. Please check back later!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="border-t border-subtle pt-8">
          <Comments postId={post.id} />
        </div>
      </div>
    </div>
  );
}