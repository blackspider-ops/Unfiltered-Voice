import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, FileText, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { PostCoverImage } from '@/components/PostCoverImage';

interface Post {
  id: string;
  title: string;
  category: string;
  slug: string;
  cover_url: string | null;
  uploaded_at: string;
  published_at: string;
  read_time_min: number;
  is_published: boolean;
}

const categoryInfo = {
  'mental-health': {
    title: 'Mind Matters',
    description: 'Exploring mental health, self-care, and emotional well-being',
    color: 'bg-purple-600'
  },
  'current-affairs': {
    title: 'News & Views',
    description: 'Commentary on current events and social issues',
    color: 'bg-blue-600'
  },
  'creative-writing': {
    title: 'Bleeding Ink',
    description: 'Poetry, stories, and creative expressions',
    color: 'bg-pink-600'
  },
  'books': {
    title: 'Reading Reflections',
    description: 'Book reviews, literary analysis, and reading recommendations',
    color: 'bg-green-600'
  }
};

export default function CategoryPage() {
  const location = useLocation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Extract category from pathname
  const category = location.pathname.replace('/', ''); // Remove leading slash



  useEffect(() => {
    if (category) {
      fetchCategoryPosts();
    }
  }, [category]);

  const fetchCategoryPosts = async () => {
    if (!category) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('category', category)
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  // Check if category exists and is valid
  const validCategories = ['mental-health', 'current-affairs', 'creative-writing', 'books'];
  
  if (!category || !validCategories.includes(category) || !categoryInfo[category as keyof typeof categoryInfo]) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The category "{category}" does not exist or is not available.
        </p>
        <Link to="/categories">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
        </Link>
      </div>
    );
  }

  const info = categoryInfo[category as keyof typeof categoryInfo];

  if (loading) {
    return (
      <div className="container mx-auto py-20">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/categories" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-lg ${info.color} flex items-center justify-center`}>
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{info.title}</h1>
              <p className="text-muted-foreground">{info.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{posts.length} {posts.length === 1 ? 'post' : 'posts'}</span>
          </div>
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No posts yet</h2>
            <p className="text-muted-foreground mb-6">
              Posts in this category are coming soon. Check back later!
            </p>
            <Link to="/categories">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Browse Other Categories
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} to={`/${post.category}/${post.slug}`}>
                <Card className="group hover:shadow-lg transition-all duration-300 h-full">
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <PostCoverImage
                      src={post.cover_url}
                      alt={post.title}
                      postId={post.id}
                      title={post.title}
                      className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className={`${info.color} text-white`}>
                        {info.title}
                      </Badge>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {post.read_time_min} min
                      </div>
                    </div>
                    
                    <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                      <span className="block overflow-hidden" style={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {post.title}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(post.published_at || post.uploaded_at), { addSuffix: true })}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}