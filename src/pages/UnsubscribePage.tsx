import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, MailX, CheckCircle, AlertCircle, ArrowLeft, LogIn } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function UnsubscribePage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'initial' | 'success' | 'error' | 'already-unsubscribed' | 'cannot-unsubscribe'>('initial');
  const [userInfo, setUserInfo] = useState<{
    display_name: string;
    email: string;
    email_notifications_enabled: boolean;
    is_admin_or_owner: boolean;
  } | null>(null);

  useDocumentTitle('Unsubscribe from Email Notifications');

  useEffect(() => {
    if (user) {
      checkUnsubscribeStatus();
    }
  }, [user]);

  const checkUnsubscribeStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('get_my_unsubscribe_status');

      if (error) throw error;

      if (data && data.length > 0) {
        setUserInfo(data[0]);
        
        if (data[0].is_admin_or_owner) {
          setStatus('cannot-unsubscribe');
        } else if (!data[0].email_notifications_enabled) {
          setStatus('already-unsubscribed');
        }
      }
    } catch (error) {
      console.error('Error checking unsubscribe status:', error);
    }
  };

  const handleUnsubscribe = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: success, error } = await supabase.rpc('unsubscribe_from_emails');

      if (error) throw error;

      if (success) {
        setStatus('success');
        // Update userInfo to reflect the change
        setUserInfo(prev => prev ? { ...prev, email_notifications_enabled: false } : null);
        toast({
          title: "Successfully unsubscribed",
          description: "You will no longer receive email notifications from The Unfiltered Voice",
        });
      } else {
        setStatus('error');
        toast({
          title: "Error",
          description: "Unable to unsubscribe. You may be an administrator.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      setStatus('error');
      toast({
        title: "Error",
        description: "Failed to unsubscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResubscribe = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ email_notifications_enabled: true })
        .eq('user_id', user.id);

      if (error) throw error;

      setStatus('initial');
      setUserInfo(prev => prev ? { ...prev, email_notifications_enabled: true } : null);
      
      toast({
        title: "Successfully resubscribed",
        description: "You will now receive email notifications from The Unfiltered Voice",
      });
    } catch (error) {
      console.error('Error resubscribing:', error);
      toast({
        title: "Error",
        description: "Failed to resubscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container px-4 max-w-2xl mx-auto">
        {/* Back to Home */}
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to The Unfiltered Voice
          </Link>
        </div>

        <Card className="bg-card/70 backdrop-blur border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl font-heading">
              {status === 'success' ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  Successfully Unsubscribed
                </>
              ) : status === 'cannot-unsubscribe' ? (
                <>
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                  Cannot Unsubscribe
                </>
              ) : status === 'already-unsubscribed' ? (
                <>
                  <MailX className="h-6 w-6 text-gray-600" />
                  Already Unsubscribed
                </>
              ) : (
                <>
                  <Mail className="h-6 w-6 text-primary" />
                  Unsubscribe from Email Notifications
                </>
              )}
            </CardTitle>
            <CardDescription>
              {status === 'success' ? (
                "You have been successfully unsubscribed from The Unfiltered Voice email notifications."
              ) : status === 'cannot-unsubscribe' ? (
                "Administrators and owners cannot unsubscribe from email notifications."
              ) : status === 'already-unsubscribed' ? (
                "You are already unsubscribed from email notifications."
              ) : (
                "Enter your email address to unsubscribe from blog post notifications."
              )}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {status === 'success' ? (
              <div className="text-center space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800">
                    <strong>{userInfo?.display_name || 'You'}</strong> will no longer receive email notifications 
                    when new blog posts are published on The Unfiltered Voice.
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  You can still visit the website anytime to read new posts, and you can resubscribe 
                  by contacting us if you change your mind.
                </p>
              </div>
            ) : status === 'cannot-unsubscribe' ? (
              <div className="text-center space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-800">
                    <strong>{userInfo?.display_name}</strong>, as an administrator or owner, 
                    you cannot unsubscribe from email notifications. These emails are important 
                    for managing the website.
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  If you need to change your notification preferences, please contact the website owner.
                </p>
              </div>
            ) : status === 'already-unsubscribed' ? (
              <div className="text-center space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-800">
                    <strong>{userInfo?.display_name}</strong>, you are already unsubscribed 
                    from email notifications.
                  </p>
                </div>
                <Button
                  onClick={handleResubscribe}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Processing...' : 'Resubscribe to Email Notifications'}
                </Button>
                <p className="text-sm text-muted-foreground">
                  Click above if you'd like to start receiving email notifications again.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">
                    <strong>{userInfo?.display_name}</strong> ({userInfo?.email}), 
                    you are currently subscribed to email notifications.
                  </p>
                </div>

                <Button
                  onClick={handleUnsubscribe}
                  disabled={loading}
                  className="w-full"
                  variant="destructive"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <MailX className="h-4 w-4" />
                      Unsubscribe from Email Notifications
                    </div>
                  )}
                </Button>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">What happens when you unsubscribe?</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• You'll stop receiving email notifications about new blog posts</li>
                    <li>• You can still visit the website and read all content</li>
                    <li>• Your account and comments remain unchanged</li>
                    <li>• You can resubscribe anytime from your profile page</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}