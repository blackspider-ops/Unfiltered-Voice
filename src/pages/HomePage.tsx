import { TypingHeadlines } from '@/components/TypingHeadlines';
import { Button } from '@/components/ui/enhanced-button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Brain, Newspaper, PenTool, BookOpen, ArrowRight, Quote } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSettings } from '@/hooks/useSettings';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const categoryMap = {
  'mental-health': {
    id: 'mental-health',
    name: 'Mind Matters',
    description: 'Mental health, self-discovery, and the complexity of being human',
    icon: Brain,
    color: 'text-primary',
  },
  'current-affairs': {
    id: 'current-affairs', 
    name: 'News & Views',
    description: 'Current affairs through an unfiltered, honest lens',
    icon: Newspaper,
    color: 'text-secondary',
  },
  'creative-writing': {
    id: 'creative-writing',
    name: 'Bleeding Ink', 
    description: 'Raw creative writing, poetry, and artistic expression',
    icon: PenTool,
    color: 'text-accent',
  },
  'books': {
    id: 'books',
    name: 'Reading Reflections',
    description: 'Book reviews, literary analysis, and storytelling insights',
    icon: BookOpen,
    color: 'text-primary',
  }
};

export default function HomePage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();
  
  // Update document title and meta tags
  useDocumentTitle();

  useEffect(() => {
    fetchCategoryData();
  }, []);

  const fetchCategoryData = async () => {
    try {
      // Get post counts by category
      const { data: posts, error } = await supabase
        .from('posts')
        .select('category, title, slug, uploaded_at, cover_url')
        .eq('is_published', true)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      // Group posts by category and get counts
      const categoryData = Object.keys(categoryMap).map(categoryKey => {
        const categoryPosts = posts?.filter(post => post.category === categoryKey) || [];
        const latestPost = categoryPosts[0] || null;
        
        return {
          ...categoryMap[categoryKey as keyof typeof categoryMap],
          posts: categoryPosts.length,
          latest: latestPost
        };
      });

      setCategories(categoryData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to empty data
      setCategories(Object.values(categoryMap).map(cat => ({ ...cat, posts: 0, latest: null })));
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-ink opacity-30" />
        <div className="container px-4 py-24 md:py-32 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 animate-fade-up">
              {settings.hero_title}
            </h1>
            
            <div className="mb-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <TypingHeadlines />
            </div>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.4s' }}>
              {settings.hero_subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: '0.6s' }}>
              <Button variant="hero" size="xl" asChild>
                <Link to="/categories" className="flex items-center gap-2">
                  Browse Categories
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ink" size="xl" asChild>
                <Link to="/contact">Get in Touch</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-card/30">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8 justify-center">
              <Quote className="h-8 w-8 text-accent" />
              <h2 className="text-3xl md:text-4xl font-heading font-bold">{settings.about_title}</h2>
            </div>
            
            <div className="bg-card border border-border/50 rounded-2xl p-8 md:p-12 shadow-subtle">
              <div className="prose prose-lg mx-auto text-center">
                <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {settings.about_description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest by Category */}
      <section className="py-20">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Explore My World</h2>
            <p className="text-lg text-muted-foreground">Dive into different corners of my unfiltered mind</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="bg-card/50 backdrop-blur border-border/50">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-lg bg-muted w-12 h-12"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded w-20"></div>
                          <div className="h-3 bg-muted rounded w-16"></div>
                        </div>
                      </div>
                      <div className="space-y-2 mb-6">
                        <div className="h-3 bg-muted rounded"></div>
                        <div className="h-3 bg-muted rounded w-3/4"></div>
                      </div>
                      <div className="h-8 bg-muted rounded"></div>
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
                    className="group hover:shadow-lift transition-all duration-300 hover:-translate-y-2 bg-card/50 backdrop-blur border-border/50"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-lg bg-gradient-subtle">
                          <Icon className={`h-6 w-6 ${category.color}`} />
                        </div>
                        <div>
                          <h3 className="font-heading font-semibold text-lg">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">{category.posts} posts</p>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                        {category.description}
                      </p>

                      {category.latest && (
                        <div className="mb-4 p-3 bg-muted/30 rounded-lg border border-border/30">
                          <p className="text-xs text-muted-foreground mb-1">Latest:</p>
                          <Link 
                            to={`/${category.id}/${category.latest.slug}`}
                            className="text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
                          >
                            {category.latest.title}
                          </Link>
                        </div>
                      )}

                      <Button variant="glow" size="sm" asChild className="w-full">
                        <Link to={`/${category.id}`} className="flex items-center gap-2">
                          Explore
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Rotating Quotes */}
      <section className="py-16 bg-gradient-subtle">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Quote className="h-6 w-6 text-accent" />
              <h3 className="text-xl font-heading font-semibold">{settings.words_to_live_by_title}</h3>
              <Quote className="h-6 w-6 text-accent rotate-180" />
            </div>
            
            <div className="space-y-4">
              {settings.words_to_live_by.map((quote, index) => (
                <p 
                  key={index} 
                  className="text-lg font-medium text-foreground/80 italic animate-fade-in"
                  style={{ animationDelay: `${index * 0.5}s` }}
                >
                  "{quote}"
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-card/30">
        <div className="container px-4">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              {settings.footer_text}
            </p>
            <p className="text-muted-foreground text-xs mt-2">
              © 2024 {settings.site_name}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}