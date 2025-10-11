import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, 
  RefreshCw, 
  Settings as SettingsIcon,
  Palette,
  Type,
  Quote,
  User,
  Mail,
  Search,
  Plus,
  X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SiteSetting {
  id: string;
  key: string;
  value: unknown;
  description: string | null;
  category: string;
}

interface SettingsForm {
  // Branding
  site_name: string;
  site_tagline: string;
  
  // Hero Section
  hero_title: string;
  hero_subtitle: string;
  typing_quotes: string[];
  
  // About Section
  about_title: string;
  about_description: string;
  
  // Words to Live By
  words_to_live_by_title: string;
  words_to_live_by: string[];
  
  // Footer & Contact
  footer_text: string;
  contact_email: string;
  social_instagram: string;
  social_linkedin: string;
  
  // SEO
  meta_description: string;
  meta_keywords: string;
}

export function Settings() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newQuote, setNewQuote] = useState('');
  const [newWord, setNewWord] = useState('');
  const { toast } = useToast();

  const [formData, setFormData] = useState<SettingsForm>({
    site_name: '',
    site_tagline: '',
    hero_title: '',
    hero_subtitle: '',
    typing_quotes: [],
    about_title: '',
    about_description: '',
    words_to_live_by_title: '',
    words_to_live_by: [],
    footer_text: '',
    contact_email: '',
    social_instagram: '',
    social_linkedin: '',
    meta_description: '',
    meta_keywords: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('category', { ascending: true });

      if (error) {
        throw error;
      }

      setSettings(data || []);
      
      // Convert settings to form data
      const settingsMap = (data || []).reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as any);

      setFormData({
        site_name: settingsMap.site_name || '',
        site_tagline: settingsMap.site_tagline || '',
        hero_title: settingsMap.hero_title || '',
        hero_subtitle: settingsMap.hero_subtitle || '',
        typing_quotes: settingsMap.typing_quotes || [],
        about_title: settingsMap.about_title || '',
        about_description: settingsMap.about_description || '',
        words_to_live_by_title: settingsMap.words_to_live_by_title || '',
        words_to_live_by: settingsMap.words_to_live_by || [],
        footer_text: settingsMap.footer_text || '',
        contact_email: settingsMap.contact_email || '',
        social_instagram: settingsMap.social_instagram || '',
        social_linkedin: settingsMap.social_linkedin || '',
        meta_description: settingsMap.meta_description || '',
        meta_keywords: settingsMap.meta_keywords || ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Prepare updates for each setting
      const updates = [
        { key: 'site_name', value: formData.site_name },
        { key: 'site_tagline', value: formData.site_tagline },
        { key: 'hero_title', value: formData.hero_title },
        { key: 'hero_subtitle', value: formData.hero_subtitle },
        { key: 'typing_quotes', value: formData.typing_quotes },
        { key: 'about_title', value: formData.about_title },
        { key: 'about_description', value: formData.about_description },
        { key: 'words_to_live_by_title', value: formData.words_to_live_by_title },
        { key: 'words_to_live_by', value: formData.words_to_live_by },
        { key: 'footer_text', value: formData.footer_text },
        { key: 'contact_email', value: formData.contact_email },
        { key: 'social_instagram', value: formData.social_instagram },
        { key: 'social_linkedin', value: formData.social_linkedin },
        { key: 'meta_description', value: formData.meta_description },
        { key: 'meta_keywords', value: formData.meta_keywords }
      ];

      // Update each setting using upsert
      for (const update of updates) {
        const { error } = await supabase
          .from('site_settings')
          .upsert({
            key: update.key,
            value: update.value,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'key'
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Settings saved successfully! Changes will appear on the site.",
      });

      // Refresh settings to get updated data
      fetchSettings();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' 
        ? error.message 
        : "Failed to save settings";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addQuote = () => {
    if (newQuote.trim() && !formData.typing_quotes.includes(newQuote.trim())) {
      setFormData(prev => ({
        ...prev,
        typing_quotes: [...prev.typing_quotes, newQuote.trim()]
      }));
      setNewQuote('');
    }
  };

  const removeQuote = (quoteToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      typing_quotes: prev.typing_quotes.filter(quote => quote !== quoteToRemove)
    }));
  };

  const addWord = () => {
    if (newWord.trim() && !formData.words_to_live_by.includes(newWord.trim())) {
      setFormData(prev => ({
        ...prev,
        words_to_live_by: [...prev.words_to_live_by, newWord.trim()]
      }));
      setNewWord('');
    }
  };

  const removeWord = (wordToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      words_to_live_by: prev.words_to_live_by.filter(word => word !== wordToRemove)
    }));
  };

  const handleQuoteKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addQuote();
    }
  };

  const handleWordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addWord();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Site Settings</h2>
          <p className="text-muted-foreground">
            Customize your site's content, branding, and appearance
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="hero" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Hero Section
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Contact & Social
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            SEO
          </TabsTrigger>
        </TabsList>

        {/* Branding Tab */}
        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Site Branding</CardTitle>
              <CardDescription>
                Configure your site name, tagline, and main branding elements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="site_name">Site Name</Label>
                <Input
                  id="site_name"
                  value={formData.site_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, site_name: e.target.value }))}
                  placeholder="The Unfiltered Voice"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This appears in the header and browser title
                </p>
              </div>
              
              <div>
                <Label htmlFor="site_tagline">Site Tagline</Label>
                <Input
                  id="site_tagline"
                  value={formData.site_tagline}
                  onChange={(e) => setFormData(prev => ({ ...prev, site_tagline: e.target.value }))}
                  placeholder="by Niyati Singhal"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Appears under the site name in the header
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hero Section Tab */}
        <TabsContent value="hero">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>
                  Configure the main hero section content and messaging
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="hero_title">Hero Title</Label>
                  <Input
                    id="hero_title"
                    value={formData.hero_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, hero_title: e.target.value }))}
                    placeholder="Welcome to my unfiltered world"
                  />
                </div>
                
                <div>
                  <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
                  <Textarea
                    id="hero_subtitle"
                    value={formData.hero_subtitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, hero_subtitle: e.target.value }))}
                    placeholder="Where thoughts flow freely..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Typing Animation Quotes</CardTitle>
                <CardDescription>
                  Quotes that rotate in the typing animation effect
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newQuote}
                    onChange={(e) => setNewQuote(e.target.value)}
                    onKeyPress={handleQuoteKeyPress}
                    placeholder="Add a new quote and press Enter"
                    className="flex-1"
                  />
                  <Button type="button" onClick={addQuote} variant="outline" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {formData.typing_quotes.length > 0 && (
                  <div className="space-y-2">
                    {formData.typing_quotes.map((quote, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm flex-1">{quote}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuote(quote)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About Section</CardTitle>
                <CardDescription>
                  Configure the about section content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="about_title">About Title</Label>
                  <Input
                    id="about_title"
                    value={formData.about_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, about_title: e.target.value }))}
                    placeholder="About The Voice"
                  />
                </div>
                
                <div>
                  <Label htmlFor="about_description">About Description</Label>
                  <Textarea
                    id="about_description"
                    value={formData.about_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, about_description: e.target.value }))}
                    placeholder="This blog is my sanctuary..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Words to Live By</CardTitle>
                <CardDescription>
                  Inspirational quotes and words of wisdom
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="words_title">Section Title</Label>
                  <Input
                    id="words_title"
                    value={formData.words_to_live_by_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, words_to_live_by_title: e.target.value }))}
                    placeholder="Words to Live By"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    onKeyPress={handleWordKeyPress}
                    placeholder="Add a new inspirational quote"
                    className="flex-1"
                  />
                  <Button type="button" onClick={addWord} variant="outline" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {formData.words_to_live_by.length > 0 && (
                  <div className="space-y-2">
                    {formData.words_to_live_by.map((word, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm flex-1">{word}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeWord(word)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contact & Social Tab */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact & Social Media</CardTitle>
              <CardDescription>
                Configure contact information and social media links
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                  placeholder="hello@niyatisinghal.com"
                  autoComplete="email"
                />
              </div>
              
              <div>
                <Label htmlFor="social_instagram">Instagram URL</Label>
                <Input
                  id="social_instagram"
                  value={formData.social_instagram}
                  onChange={(e) => setFormData(prev => ({ ...prev, social_instagram: e.target.value }))}
                  placeholder="https://instagram.com/username"
                  autoComplete="url"
                />
              </div>
              
              <div>
                <Label htmlFor="social_linkedin">LinkedIn URL</Label>
                <Input
                  id="social_linkedin"
                  value={formData.social_linkedin}
                  onChange={(e) => setFormData(prev => ({ ...prev, social_linkedin: e.target.value }))}
                  placeholder="https://linkedin.com/in/username"
                  autoComplete="url"
                />
              </div>
              
              <div>
                <Label htmlFor="footer_text">Footer Text</Label>
                <Input
                  id="footer_text"
                  value={formData.footer_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, footer_text: e.target.value }))}
                  placeholder="Made with ❤️ and a lot of coffee"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>
                Configure meta tags and SEO-related content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                  placeholder="Site description for search engines"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Appears in search engine results (150-160 characters recommended)
                </p>
              </div>
              
              <div>
                <Label htmlFor="meta_keywords">Meta Keywords</Label>
                <Input
                  id="meta_keywords"
                  value={formData.meta_keywords}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_keywords: e.target.value }))}
                  placeholder="keyword1, keyword2, keyword3"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Comma-separated keywords for SEO
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}