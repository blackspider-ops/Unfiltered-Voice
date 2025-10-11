import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Instagram, Linkedin, Send, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSettings } from '@/hooks/useSettings';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { settings } = useSettings();
  
  useDocumentTitle('Contact');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save message to database
      const { error: dbError } = await supabase
        .from('contact_messages')
        .insert([{
          name: formData.name,
          email: formData.email,
          message: formData.message
        }]);

      if (dbError) throw dbError;

      // Send email notification to owner using Edge Function
      try {
        const { error: emailError } = await supabase.functions.invoke('send-contact-email', {
          body: {
            name: formData.name,
            email: formData.email,
            message: formData.message
          }
        });

        if (emailError) {
          // Don't fail the whole process if email fails
        }
      } catch (emailError) {
        // Don't fail the whole process if email fails
      }

      toast({
        title: "Message sent!",
        description: "Thanks for reaching out. I'll get back to you soon!",
      });
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container px-4 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 animate-fade-up">
            Let's <span className="bg-gradient-primary bg-clip-text text-transparent">Connect</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Have thoughts to share? Questions to ask? Or just want to say hello? 
            I'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="bg-card/70 backdrop-blur border-border/50 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <Mail className="h-5 w-5 text-primary" />
                  Send me a message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your name"
                        required
                        className="bg-background/50"
                        autoComplete="name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                        required
                        className="bg-background/50"
                        autoComplete="email"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Share your thoughts... I'm all ears!"
                      required
                      rows={6}
                      className="bg-background/50 resize-none"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    variant="hero" 
                    size="lg" 
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Send Message
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* About Card */}
            <Card className="bg-card/70 backdrop-blur border-border/50 animate-fade-up" style={{ animationDelay: '0.4s' }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="h-5 w-5 text-accent" />
                  <h3 className="font-heading font-semibold">Why reach out?</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Whether you want to share your own story, discuss a post that resonated with you, 
                  or just connect with someone who gets it – I'm here for genuine conversations.
                </p>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card className="bg-card/70 backdrop-blur border-border/50 animate-fade-up" style={{ animationDelay: '0.5s' }}>
              <CardContent className="p-6">
                <h3 className="font-heading font-semibold mb-4">Find me elsewhere</h3>
                <div className="space-y-3">
                  <a 
                    href={settings.social_instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-accent/10 hover:border-accent/30 border border-border/30 transition-all duration-200 group"
                  >
                    <Instagram className="h-5 w-5 text-accent group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="font-medium text-sm">Instagram</p>
                      <p className="text-xs text-muted-foreground">Daily thoughts & visuals</p>
                    </div>
                  </a>
                  
                  <a 
                    href={settings.social_linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-secondary/10 hover:border-secondary/30 border border-border/30 transition-all duration-200 group"
                  >
                    <Linkedin className="h-5 w-5 text-secondary group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="font-medium text-sm">LinkedIn</p>
                      <p className="text-xs text-muted-foreground">Professional connections</p>
                    </div>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card className="bg-card/70 backdrop-blur border-border/50 animate-fade-up" style={{ animationDelay: '0.6s' }}>
              <CardContent className="p-6">
                <h3 className="font-heading font-semibold mb-2">Response time</h3>
                <p className="text-sm text-muted-foreground">
                  I typically respond within 24-48 hours. Sometimes life gets busy, 
                  but I promise to get back to every genuine message.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}