import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLatestPost } from '@/hooks/useLatestPost';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/enhanced-button';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, Instagram, Twitter, Linkedin, Heart, Coffee, BookOpen, Pen, Loader2 } from 'lucide-react';
// import { Helmet } from 'react-helmet-async';

interface AboutContent {
    id: string;
    title: string;
    subtitle: string;
    bio: string;
    profile_image_url: string;
    cover_image_url: string;
    interests: string[];
    social_links: {
        email?: string;
        instagram?: string;
        twitter?: string;
        linkedin?: string;
    };
    fun_facts: string[];
    favorite_quote: string;
    quote_author: string;
    updated_at: string;
}

const defaultContent: AboutContent = {
    id: 'default',
    title: 'Meet Niyati',
    subtitle: 'The Voice Behind The Unfiltered Thoughts',
    bio: `Hey there! I'm Niyati, a passionate writer who believes in the power of authentic storytelling. 
  
  This blog is my digital sanctuary where I share unfiltered thoughts about life, mental health, current affairs, and everything in between. I write not because I have all the answers, but because I believe in the beauty of questions and the journey of finding ourselves through words.
  
  When I'm not writing, you'll find me reading, exploring new coffee shops, or having deep conversations about life with friends. I believe that every story matters and every voice deserves to be heard.`,
    profile_image_url: '/placeholder-profile.jpg',
    cover_image_url: '/placeholder-cover.jpg',
    interests: ['Writing', 'Reading', 'Mental Health Advocacy', 'Coffee', 'Photography', 'Travel'],
    social_links: {
        email: 'hello@theunfilteredvoice.com',
        instagram: '@niyati_writes',
        twitter: '@niyati_thoughts',
        linkedin: 'niyati-writer'
    },
    fun_facts: [
        'I drink at least 3 cups of coffee a day',
        'I have read over 100 books this year',
        'I write my best pieces at 2 AM',
        'I collect vintage notebooks',
        'I believe pineapple belongs on pizza'
    ],
    favorite_quote: 'The most important thing is to try and inspire people so that they can be great at whatever they want to do.',
    quote_author: 'Kobe Bryant',
    updated_at: new Date().toISOString()
};

export default function MeetNiyatiPage() {
    const [content, setContent] = useState<AboutContent>(defaultContent);
    const [loading, setLoading] = useState(true);
    const { latestPost, getLatestPostUrl } = useLatestPost();

    useEffect(() => {
        fetchAboutContent();
    }, []);

    const fetchAboutContent = async () => {
        try {
            // Use any type for now since the table might not exist in types yet
            const { data, error } = await (supabase as any)
                .from('about_content')
                .select('*')
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (data) {
                setContent(data as AboutContent);
            }
        } catch (error) {
            console.error('Error fetching about content:', error);
            // Use default content if fetch fails
        } finally {
            setLoading(false);
        }
    };

    const getSocialIcon = (platform: string) => {
        switch (platform) {
            case 'email':
                return Mail;
            case 'instagram':
                return Instagram;
            case 'twitter':
                return Twitter;
            case 'linkedin':
                return Linkedin;
            default:
                return Mail;
        }
    };

    const getSocialUrl = (platform: string, handle: string) => {
        switch (platform) {
            case 'email':
                return `mailto:${handle}`;
            case 'instagram':
                return `https://instagram.com/${handle.replace('@', '')}`;
            case 'twitter':
                return `https://twitter.com/${handle.replace('@', '')}`;
            case 'linkedin':
                return `https://linkedin.com/in/${handle}`;
            default:
                return '#';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${content.cover_image_url})` }}
                >
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
                </div>

                <div className="relative container mx-auto px-4 py-20">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="mb-8">
                            <img
                                src={content.profile_image_url}
                                alt="Niyati"
                                className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-primary/20 shadow-glow"
                                onError={(e) => {
                                    e.currentTarget.src = '/placeholder-profile.jpg';
                                }}
                            />
                            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4 animate-fade-up">
                                {content.title}
                            </h1>
                            <p className="text-xl text-muted-foreground animate-fade-up" style={{ animationDelay: '0.2s' }}>
                                {content.subtitle}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto space-y-16">
                    {/* Bio Section */}
                    <Card className="bg-card/70 backdrop-blur border-border/50">
                        <CardContent className="p-8">
                            <h2 className="text-2xl font-heading font-bold mb-6 flex items-center gap-2">
                                <Heart className="h-6 w-6 text-accent" />
                                About Me
                            </h2>
                            <div className="prose prose-lg max-w-none">
                                {content.bio.split('\n\n').map((paragraph, index) => (
                                    <p key={index} className="text-foreground/90 leading-relaxed mb-4">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Interests & Fun Facts */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Interests */}
                        <Card className="bg-card/70 backdrop-blur border-border/50">
                            <CardContent className="p-8">
                                <h3 className="text-xl font-heading font-bold mb-6 flex items-center gap-2">
                                    <Coffee className="h-5 w-5 text-primary" />
                                    What I Love
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {content.interests.map((interest, index) => (
                                        <Badge key={index} variant="secondary" className="text-sm">
                                            {interest}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Fun Facts */}
                        <Card className="bg-card/70 backdrop-blur border-border/50">
                            <CardContent className="p-8">
                                <h3 className="text-xl font-heading font-bold mb-6 flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-secondary" />
                                    Fun Facts
                                </h3>
                                <ul className="space-y-2">
                                    {content.fun_facts.map((fact, index) => (
                                        <li key={index} className="text-foreground/90 flex items-start gap-2">
                                            <span className="text-accent mt-1">•</span>
                                            {fact}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Favorite Quote */}
                    <Card className="bg-gradient-subtle border-border/50">
                        <CardContent className="p-8 text-center">
                            <Pen className="h-8 w-8 text-accent mx-auto mb-4" />
                            <blockquote className="text-xl font-heading italic text-foreground mb-4">
                                "{content.favorite_quote}"
                            </blockquote>
                            <cite className="text-muted-foreground">— {content.quote_author}</cite>
                        </CardContent>
                    </Card>

                    {/* Social Links */}
                    <Card className="bg-card/70 backdrop-blur border-border/50">
                        <CardContent className="p-8 text-center">
                            <h3 className="text-xl font-heading font-bold mb-6">Let's Connect</h3>
                            <div className="flex justify-center gap-4 flex-wrap">
                                {Object.entries(content.social_links).map(([platform, handle]) => {
                                    if (!handle) return null;
                                    const Icon = getSocialIcon(platform);
                                    return (
                                        <Button
                                            key={platform}
                                            variant="outline"
                                            size="lg"
                                            asChild
                                            className="flex items-center gap-2"
                                        >
                                            <a
                                                href={getSocialUrl(platform, handle)}
                                                target={platform !== 'email' ? '_blank' : undefined}
                                                rel={platform !== 'email' ? 'noopener noreferrer' : undefined}
                                            >
                                                <Icon className="h-5 w-5" />
                                                {handle}
                                            </a>
                                        </Button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Get in Touch Section */}
                    <Card className="bg-card/70 backdrop-blur border-border/50">
                        <CardContent className="p-8">
                            <h2 className="text-2xl font-heading font-bold mb-6 flex items-center gap-2">
                                <Mail className="h-6 w-6 text-primary" />
                                Get in Touch
                            </h2>
                            <div className="text-center mb-8">
                                <p className="text-lg text-muted-foreground mb-6">
                                    Have thoughts to share? Questions to ask? Or just want to say hello?
                                    I'd love to hear from you.
                                </p>
                                <Button variant="hero" size="lg" asChild>
                                    <Link to="/contact" className="flex items-center gap-2">
                                        <Mail className="h-5 w-5" />
                                        Send me a message
                                    </Link>
                                </Button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 mt-8">
                                <div className="text-center">
                                    <Heart className="h-8 w-8 text-accent mx-auto mb-3" />
                                    <h3 className="font-heading font-semibold mb-2">Why reach out?</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Whether you want to share your own story, discuss a post that resonated with you,
                                        or just connect with someone who gets it – I'm here for genuine conversations.
                                    </p>
                                </div>

                                <div className="text-center">
                                    <Coffee className="h-8 w-8 text-secondary mx-auto mb-3" />
                                    <h3 className="font-heading font-semibold mb-2">Response time</h3>
                                    <p className="text-sm text-muted-foreground">
                                        I typically respond within 24-48 hours. Sometimes life gets busy,
                                        but I promise to get back to every genuine message.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Call to Action */}
                    <div className="text-center">
                        <Card className="bg-gradient-primary/10 border-primary/20">
                            <CardContent className="p-8">
                                <h3 className="text-2xl font-heading font-bold mb-4">
                                    Ready to dive into my thoughts?
                                </h3>
                                <p className="text-muted-foreground mb-6">
                                    Explore my latest posts and join the conversation.
                                </p>
                                <div className="flex justify-center gap-4 flex-wrap">
                                    <Button variant="hero" size="lg" asChild>
                                        <Link to={getLatestPostUrl()} className="flex items-center gap-2">
                                            {latestPost ? `Read "${latestPost.title}"` : 'Read Latest Posts'}
                                            <ArrowRight className="h-5 w-5" />
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="lg" asChild>
                                        <Link to="/categories">
                                            Browse Categories
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}