import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/enhanced-button';
import { Link } from 'react-router-dom';
import { Brain, Newspaper, PenTool, BookOpen, ArrowRight, FileText, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const categoryTemplates = [
  {
    id: 'mental-health',
    name: 'Mind Matters',
    description: 'Mental health, self-discovery, and the complexity of being human',
    longDescription: 'Dive deep into the complexities of mental health, personal growth, and the raw realities of being human. Here, I share my journey through anxiety, self-doubt, moments of clarity, and everything in between.',
    icon: Brain,
    color: 'text-primary',
    gradient: 'from-primary/20 to-accent/10',
    tags: ['Mental Health', 'Self-Discovery', 'Personal Growth', 'Anxiety', 'Mindfulness']
  },
  {
    id: 'current-affairs',
    name: 'News & Views',
    description: 'Current affairs through an unfiltered, honest lens',
    longDescription: 'My unfiltered take on current events, social issues, and the world around us. No political correctness here – just honest, authentic opinions.',
    icon: Newspaper,
    color: 'text-secondary',
    gradient: 'from-secondary/20 to-primary/10',
    tags: ['Current Affairs', 'Social Issues', 'Politics', 'Society', 'Opinion']
  },
  {
    id: 'creative-writing',
    name: 'Bleeding Ink',
    description: 'Raw creative writing, poetry, and artistic expression',
    longDescription: 'The creative corner where emotions bleed onto paper. Poetry, short stories, and artistic expressions that come from the deepest parts of my soul.',
    icon: PenTool,
    color: 'text-accent',
    gradient: 'from-accent/20 to-secondary/10',
    tags: ['Poetry', 'Creative Writing', 'Short Stories', 'Art', 'Expression']
  },
  {
    id: 'books',
    name: 'Reading Reflections',
    description: 'Book reviews, literary analysis, and storytelling insights',
    longDescription: 'My thoughts on books that have moved me, changed my perspective, or simply entertained me. Honest reviews and deep dives into storytelling.',
    icon: BookOpen,
    color: 'text-primary',
    gradient: 'from-primary/10 to-accent/20',
    tags: ['Book Reviews', 'Literature', 'Reading', 'Analysis', 'Storytelling']
  }
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [randomLoading, setRandomLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategoryData();
  }, []);

  const fetchCategoryData = async () => {
    try {
      // Get post counts by category
      const { data: posts, error } = await supabase
        .from('posts')
        .select('category')
        .eq('is_published', true);

      if (error) throw error;

      // Count posts per category
      const postCounts = posts?.reduce((acc, post) => {
        acc[post.category] = (acc[post.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Merge with template data
      const enrichedCategories = categoryTemplates.map(template => ({
        ...template,
        posts: postCounts[template.id] || 0
      }));

      setCategories(enrichedCategories);
    } catch (error) {
      // Fallback to template data
      setCategories(categoryTemplates.map(cat => ({ ...cat, posts: 0 })));
    } finally {
      setLoading(false);
    }
  };

  const openRandomPost = async () => {
    setRandomLoading(true);
    try {
      const { data: posts, error } = await supabase
        .from('posts')
        .select('category, slug')
        .eq('is_published', true);

      if (error) throw error;

      if (posts && posts.length > 0) {
        const randomPost = posts[Math.floor(Math.random() * posts.length)];
        navigate(`/${randomPost.category}/${randomPost.slug}`);
      } else {
        // Fallback to home if no posts
        navigate('/');
      }
    } catch (error) {
      navigate('/');
    } finally {
      setRandomLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 animate-fade-up">
            Explore <span className="bg-gradient-primary bg-clip-text text-transparent">Categories</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Four corners of my mind, each offering a different perspective on life, 
            thoughts, and the human experience.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="bg-card/70 backdrop-blur border-border/50 overflow-hidden">
                <div className="h-2 bg-muted" />
                <CardContent className="p-8">
                  <div className="animate-pulse">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="p-4 rounded-xl bg-muted w-16 h-16"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-6 bg-muted rounded w-32"></div>
                        <div className="h-4 bg-muted rounded w-24"></div>
                      </div>
                    </div>
                    <div className="space-y-3 mb-4">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-5/6"></div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-6 bg-muted rounded-full w-16"></div>
                      ))}
                    </div>
                    <div className="h-10 bg-muted rounded w-32"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Card 
                  key={category.id}
                  className="group hover:shadow-lift transition-all duration-500 hover:-translate-y-3 bg-card/70 backdrop-blur border-border/50 overflow-hidden animate-fade-up"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className={`h-2 bg-gradient-to-r ${category.gradient}`} />
                  
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="p-4 rounded-xl bg-gradient-subtle group-hover:shadow-glow transition-all duration-300">
                        <Icon className={`h-8 w-8 ${category.color}`} />
                      </div>
                      <div className="flex-1">
                        <h2 className="font-heading font-bold text-2xl mb-2 group-hover:text-primary transition-colors">
                          {category.name}
                        </h2>
                        <p className="text-muted-foreground text-sm flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {category.posts} posts published
                        </p>
                      </div>
                    </div>

                    <p className="text-foreground/90 mb-4 leading-relaxed">
                      {category.longDescription}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {category.tags.map((tag, tagIndex) => (
                        <span 
                          key={tagIndex}
                          className="px-3 py-1 bg-muted/50 text-muted-foreground text-xs rounded-full border border-border/30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <Button variant="glow" asChild className="group-hover:shadow-glow">
                        <Link to={`/${category.id}`} className="flex items-center gap-2">
                          Browse Posts
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-20 animate-fade-up" style={{ animationDelay: '0.6s' }}>
          <div className="bg-card/50 backdrop-blur rounded-2xl p-8 border border-border/50 max-w-2xl mx-auto">
            <h3 className="font-heading font-bold text-2xl mb-4">
              Can't decide where to start?
            </h3>
            <p className="text-muted-foreground mb-6">
              Every journey begins with a single step. Pick the category that speaks to your soul today.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Button 
                variant="hero" 
                size="lg" 
                onClick={openRandomPost}
                disabled={randomLoading}
                className="flex items-center gap-2"
              >
                {randomLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Finding a post...
                  </>
                ) : (
                  <>
                    Surprise Me!
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/" className="flex items-center gap-2">
                  Back to Home
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}