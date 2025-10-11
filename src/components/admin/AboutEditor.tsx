import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, X, Save, Eye, Upload, Image as ImageIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { StorageSetupGuide } from './StorageSetupGuide';

interface AboutContent {
  id?: string;
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
  quote_text: string;
  quote_author: string;
}

const defaultContent: AboutContent = {
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
  quote_text: 'The most important thing is to try and inspire people so that they can be great at whatever they want to do.',
  quote_author: 'Kobe Bryant'
};

export function AboutEditor() {
  const [content, setContent] = useState<AboutContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newInterest, setNewInterest] = useState('');
  const [newFunFact, setNewFunFact] = useState('');
  const [uploading, setUploading] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      // Use explicit type casting for about_content table
      const { data, error } = await supabase
        .from('about_content')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        // Map database fields to interface fields
        const mappedData: AboutContent = {
          id: data.id,
          title: data.title,
          subtitle: data.subtitle,
          bio: data.bio,
          profile_image_url: data.profile_image_url,
          cover_image_url: data.cover_image_url,
          interests: data.interests || [],
          fun_facts: data.fun_facts || [],
          social_links: typeof data.social_links === 'object' && data.social_links !== null 
            ? data.social_links as { email?: string; instagram?: string; twitter?: string; linkedin?: string; }
            : {},
          quote_text: data.quote_text || '',
          quote_author: data.quote_author || '',
        };
        setContent(mappedData);
      }
    } catch (error) {
      console.error('Error fetching about content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Use explicit type casting for about_content table
      const { data, error } = await supabase
        .from('about_content')
        .upsert({
          id: content.id || 'main',
          title: content.title,
          subtitle: content.subtitle,
          bio: content.bio,
          profile_image_url: content.profile_image_url,
          cover_image_url: content.cover_image_url,
          interests: content.interests,
          social_links: content.social_links,
          fun_facts: content.fun_facts,
          quote_text: content.quote_text,
          quote_author: content.quote_author,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Map database fields to interface fields
      const mappedData: AboutContent = {
        id: data.id,
        title: data.title,
        subtitle: data.subtitle,
        bio: data.bio,
        profile_image_url: data.profile_image_url,
        cover_image_url: data.cover_image_url,
        interests: data.interests || [],
        fun_facts: data.fun_facts || [],
        social_links: typeof data.social_links === 'object' && data.social_links !== null 
          ? data.social_links as { email?: string; instagram?: string; twitter?: string; linkedin?: string; }
          : {},
        quote_text: data.quote_text || '',
        quote_author: data.quote_author || '',
      };
      setContent(mappedData);
      toast({
        title: "Success",
        description: "About page content updated successfully",
      });
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "Error",
        description: "Failed to save content",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addInterest = () => {
    if (newInterest.trim()) {
      setContent(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (index: number) => {
    setContent(prev => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index)
    }));
  };

  const addFunFact = () => {
    if (newFunFact.trim()) {
      setContent(prev => ({
        ...prev,
        fun_facts: [...prev.fun_facts, newFunFact.trim()]
      }));
      setNewFunFact('');
    }
  };

  const removeFunFact = (index: number) => {
    setContent(prev => ({
      ...prev,
      fun_facts: prev.fun_facts.filter((_, i) => i !== index)
    }));
  };

  const updateSocialLink = (platform: string, value: string) => {
    setContent(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    }));
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('blog-content')
      .upload(filePath, file);

    if (uploadError) {
      // Provide more helpful error messages
      if (uploadError.message.includes('Bucket not found')) {
        throw new Error('Storage bucket not found. Please contact the administrator to set up file storage.');
      } else if (uploadError.message.includes('File size')) {
        throw new Error('File is too large. Please choose a file smaller than 10MB.');
      } else if (uploadError.message.includes('not allowed')) {
        throw new Error('File type not allowed. Please upload images (JPG, PNG, GIF) or PDF files only.');
      } else if (uploadError.message.includes('policy')) {
        throw new Error('Upload permission denied. Please check storage policies in Supabase.');
      }
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from('blog-content')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleFileUpload = async (file: File, type: 'profile' | 'cover') => {
    setUploading(true);
    try {
      const path = type === 'profile' ? 'profiles' : 'covers';
      const url = await uploadFile(file, path);

      if (type === 'profile') {
        setContent(prev => ({ ...prev, profile_image_url: url }));
        setProfileFile(null);
      } else {
        setContent(prev => ({ ...prev, cover_image_url: url }));
        setCoverFile(null);
      }

      toast({
        title: "Upload successful",
        description: `${type === 'profile' ? 'Profile' : 'Cover'} image uploaded successfully`,
      });
    } catch (error) {
      // If storage is not available, show manual URL input option
      if (error instanceof Error && (
        error.message.includes('Storage bucket') ||
        error.message.includes('Bucket not found') ||
        error.message.includes('permission denied')
      )) {
        setStorageAvailable(false);
        toast({
          title: "Storage not available",
          description: "File upload failed. You can enter URLs manually.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "Failed to upload file",
          variant: "destructive",
        });
      }
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">About Page Editor</h2>
          <p className="text-muted-foreground">Customize your Meet Niyati page content</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href="/meet-niyati" target="_blank" rel="noopener noreferrer">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </a>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Main title, subtitle, and bio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Page Title</Label>
              <Input
                id="title"
                value={content.title}
                onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Meet Niyati"
              />
            </div>

            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={content.subtitle}
                onChange={(e) => setContent(prev => ({ ...prev, subtitle: e.target.value }))}
                placeholder="The Voice Behind The Unfiltered Thoughts"
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={content.bio}
                onChange={(e) => setContent(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Write your bio here..."
                rows={8}
              />
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
            <CardDescription>Profile and cover images</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="profile-image">Profile Image URL</Label>
              {storageAvailable ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="profile-image"
                      value={content.profile_image_url}
                      onChange={(e) => setContent(prev => ({ ...prev, profile_image_url: e.target.value }))}
                      placeholder="https://example.com/profile.jpg"
                      autoComplete="url"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProfileFile(e.target.files?.[0] || null)}
                      disabled={uploading}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => profileFile && handleFileUpload(profileFile, 'profile')}
                      disabled={!profileFile || uploading}
                      size="sm"
                    >
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      Upload
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    id="profile-image"
                    value={content.profile_image_url}
                    onChange={(e) => setContent(prev => ({ ...prev, profile_image_url: e.target.value }))}
                    placeholder="https://example.com/profile.jpg"
                    autoComplete="url"
                  />
                </div>
              )}
              {content.profile_image_url && (
                <img
                  src={content.profile_image_url}
                  alt="Profile preview"
                  className="mt-2 w-20 h-20 rounded-full object-cover border"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-profile.jpg';
                  }}
                />
              )}
            </div>

            <div>
              <Label htmlFor="cover-image">Cover Image URL</Label>
              {storageAvailable ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="cover-image"
                      value={content.cover_image_url}
                      onChange={(e) => setContent(prev => ({ ...prev, cover_image_url: e.target.value }))}
                      placeholder="https://example.com/cover.jpg"
                      autoComplete="url"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                      disabled={uploading}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => coverFile && handleFileUpload(coverFile, 'cover')}
                      disabled={!coverFile || uploading}
                      size="sm"
                    >
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      Upload
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    id="cover-image"
                    value={content.cover_image_url}
                    onChange={(e) => setContent(prev => ({ ...prev, cover_image_url: e.target.value }))}
                    placeholder="https://example.com/cover.jpg"
                    autoComplete="url"
                  />
                </div>
              )}
              {content.cover_image_url && (
                <img
                  src={content.cover_image_url}
                  alt="Cover preview"
                  className="mt-2 w-full h-32 rounded object-cover border"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-cover.jpg';
                  }}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Interests */}
        <Card>
          <CardHeader>
            <CardTitle>Interests</CardTitle>
            <CardDescription>Things you love and are passionate about</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Add an interest..."
                onKeyPress={(e) => e.key === 'Enter' && addInterest()}
              />
              <Button onClick={addInterest} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {content.interests.map((interest, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {interest}
                  <button
                    onClick={() => removeInterest(index)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fun Facts */}
        <Card>
          <CardHeader>
            <CardTitle>Fun Facts</CardTitle>
            <CardDescription>Interesting things about you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newFunFact}
                onChange={(e) => setNewFunFact(e.target.value)}
                placeholder="Add a fun fact..."
                onKeyPress={(e) => e.key === 'Enter' && addFunFact()}
              />
              <Button onClick={addFunFact} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {content.fun_facts.map((fact, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <span className="flex-1">{fact}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFunFact(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
            <CardDescription>Your social media handles and contact info</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={content.social_links.email || ''}
                onChange={(e) => updateSocialLink('email', e.target.value)}
                placeholder="hello@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={content.social_links.instagram || ''}
                onChange={(e) => updateSocialLink('instagram', e.target.value)}
                placeholder="@username"
              />
            </div>

            <div>
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                value={content.social_links.twitter || ''}
                onChange={(e) => updateSocialLink('twitter', e.target.value)}
                placeholder="@username"
              />
            </div>

            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={content.social_links.linkedin || ''}
                onChange={(e) => updateSocialLink('linkedin', e.target.value)}
                placeholder="username"
              />
            </div>
          </CardContent>
        </Card>

        {/* Favorite Quote */}
        <Card>
          <CardHeader>
            <CardTitle>Favorite Quote</CardTitle>
            <CardDescription>A quote that inspires you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="quote">Quote</Label>
              <Textarea
                id="quote"
                value={content.quote_text}
                onChange={(e) => setContent(prev => ({ ...prev, quote_text: e.target.value }))}
                placeholder="Enter your favorite quote..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="quote-author">Author</Label>
              <Input
                id="quote-author"
                value={content.quote_author}
                onChange={(e) => setContent(prev => ({ ...prev, quote_author: e.target.value }))}
                placeholder="Quote author"
              />
            </div>
          </CardContent>
        </Card>

        {/* Storage Setup Guide */}
        {!storageAvailable && (
          <div className="space-y-4">
            <StorageSetupGuide />
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStorageAvailable(true);
                  toast({
                    title: "Storage test enabled",
                    description: "Try uploading a file again to test storage.",
                  });
                }}
              >
                Test Storage Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}