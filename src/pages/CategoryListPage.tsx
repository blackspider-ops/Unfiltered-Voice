import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Search, Calendar, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

interface Post {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  uploaded_at: string;
  read_time_min: number;
}

const categoryLabels = {
  'mental-health': 'Mind Matters',
  'current-affairs': 'News & Views',
  'creative-writing': 'Bleeding Ink',
  'books': 'Reading Reflections'
};

export default function CategoryListPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (category) {
      fetchPosts();
    }
  }, [category]);

  useEffect(() => {
    // Filter and sort posts
    const filtered = posts.filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      const dateA = new Date(a.uploaded_at).getTime();
      const dateB = new Date(b.uploaded_at).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredPosts(filtered);
  }, [posts, searchTerm, sortOrder]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, slug, cover_url, uploaded_at, read_time_min')
        .eq('category', category)
        .eq('is_published', true);

      if (error) throw error;

      setPosts(data || []);
    } catch (error) {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  const categoryName = categoryLabels[category as keyof typeof categoryLabels];

  if (!categoryName) {
    navigate('/404', { replace: true });
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-4 bg-surface rounded mb-4 w-20"></div>
            <div className="h-8 bg-surface rounded mb-4 w-48"></div>
            <div className="h-10 bg-surface rounded mb-8 w-64"></div>
            <div className="grid gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-surface rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/categories')}
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
            {categoryName}
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {filteredPosts.length} posts found
          </p>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={sortOrder === 'newest' ? 'default' : 'outline'}
              onClick={() => setSortOrder('newest')}
              size="sm"
            >
              Newest First
            </Button>
            <Button
              variant={sortOrder === 'oldest' ? 'default' : 'outline'}
              onClick={() => setSortOrder('oldest')}
              size="sm"
            >
              Oldest First
            </Button>
          </div>
        </div>

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <Card className="bg-surface border-subtle">
            <CardContent className="pt-6 text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchTerm ? 'No posts found' : 'No posts yet'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? `No posts match "${searchTerm}". Try a different search term.`
                  : 'Posts in this category will appear here soon.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredPosts.map((post) => (
              <Card
                key={post.id}
                className="group hover:shadow-lift transition-all duration-300 bg-surface border-subtle overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Cover Image */}
                    <div className="md:w-64 h-48 md:h-auto">
                      {post.cover_url ? (
                        <img
                          src={post.cover_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDI1NiAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMTkyIiBmaWxsPSIjMUExQTFBIi8+CjxwYXRoIGQ9Ik0xMjggOTZMMTA0IDEyMEwxNTIgMTIwTDEyOCA5NloiIGZpbGw9IiM0QzRDNEMiLz4KPC9zdmc+';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <FileText className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary">{categoryName}</Badge>
                        <span className="text-muted-foreground text-sm">•</span>
                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                          <Clock className="h-3 w-3" />
                          {post.read_time_min} min read
                        </div>
                        <span className="text-muted-foreground text-sm">•</span>
                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(post.uploaded_at), { addSuffix: true })}
                        </div>
                      </div>

                      <h2 className="text-xl font-heading font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>

                      <div className="flex items-center justify-between mt-4">
                        <span className="text-muted-foreground text-sm">
                          By Niyati Singhal
                        </span>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/${category}/${post.slug}`}>
                            Read Post →
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}