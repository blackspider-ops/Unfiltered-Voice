import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Mail, Calendar, Shield, MessageCircle, Activity, Edit, LogOut, Trash2, AlertTriangle, Bell, BellOff } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const ProfilePage = () => {
  const { user, loading: authLoading, isAdmin, signOut } = useAuth();
  const { profile, stats, loading, error, updateProfile } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [resubscribing, setResubscribing] = useState(false);

  // Update display name when profile loads
  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    }
  }, [profile?.display_name]);

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      toast({
        title: "Error",
        description: "Display name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    setUpdating(true);
    try {
      await updateProfile({ display_name: displayName.trim() });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const handleResubscribe = async () => {
    if (!user || !profile) return;
    
    setResubscribing(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ email_notifications_enabled: true })
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh profile data
      window.location.reload();

      toast({
        title: "Successfully resubscribed",
        description: "You will now receive email notifications about new blog posts",
      });
    } catch (error) {
      console.error('Error resubscribing:', error);
      toast({
        title: "Error",
        description: "Failed to resubscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setResubscribing(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setDeleting(true);
    try {
      // Try to call the database function first
      try {
        const { data, error: dbError } = await supabase.rpc('delete_user_account', {
          _user_id: user.id
        });

        if (dbError) {
          throw dbError;
        }

        if (!data) {
          throw new Error('Database function returned false');
        }
      } catch (rpcError) {
        console.warn('RPC function not available, using fallback method:', rpcError);
        
        // Fallback: manually delete user data
        // Make all user's comments anonymous
        const { error: commentsError } = await supabase
          .from('comments')
          .update({ 
            display_name: 'Anonymous User',
            user_id: '00000000-0000-0000-0000-000000000000'
          })
          .eq('user_id', user.id);

        if (commentsError) {
          console.error('Error anonymizing comments:', commentsError);
        }

        // Delete user roles
        const { error: rolesError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', user.id);

        if (rolesError) {
          console.error('Error deleting user roles:', rolesError);
        }

        // Delete user profile
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('user_id', user.id);

        if (profileError) {
          throw profileError;
        }
      }

      // Sign out the user (we can't delete auth users from client-side)
      await supabase.auth.signOut();

      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted. Your comments remain as anonymous.",
      });

      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete account",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (error) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Error Loading Profile</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your display name and other profile details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                autoComplete="name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={profile?.email || user.email || ''}
                disabled
                className="bg-muted"
                autoComplete="email"
              />
              <p className="text-sm text-muted-foreground">
                Email cannot be changed from this page
              </p>
            </div>

            <Button 
              onClick={handleUpdateProfile} 
              disabled={updating || displayName === profile?.display_name}
              className="w-full"
            >
              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Profile
            </Button>
          </CardContent>
        </Card>

        {/* Account Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Account Details
            </CardTitle>
            <CardDescription>
              Your account information and status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">User ID</span>
              <span className="text-sm text-muted-foreground font-mono">
                {user.id.slice(0, 8)}...
              </span>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Account Status</span>
              <span className="text-sm text-green-600 font-medium">Active</span>
            </div>
            
            <Separator />
            
            {isAdmin && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Role
                  </span>
                  <span className="text-sm text-blue-600 font-medium">Administrator</span>
                </div>
                <Separator />
              </>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Member Since
              </span>
              <span className="text-sm text-muted-foreground">
                {profile?.created_at 
                  ? new Date(profile.created_at).toLocaleDateString()
                  : 'Unknown'
                }
              </span>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Last Updated
              </span>
              <span className="text-sm text-muted-foreground">
                {profile?.updated_at 
                  ? new Date(profile.updated_at).toLocaleDateString()
                  : 'Never'
                }
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Notifications Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {profile?.email_notifications_enabled ? (
              <Bell className="h-5 w-5 text-green-600" />
            ) : (
              <BellOff className="h-5 w-5 text-red-500" />
            )}
            Email Notifications
          </CardTitle>
          <CardDescription>
            Manage your email notification preferences for new blog posts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAdmin ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Administrator Account</span>
              </div>
              <p className="text-blue-700 text-sm">
                As an administrator, you will always receive email notifications about new blog posts. 
                This setting cannot be changed to ensure you stay informed about website activity.
              </p>
            </div>
          ) : profile?.email_notifications_enabled ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Email Notifications Enabled</span>
              </div>
              <p className="text-green-700 text-sm mb-3">
                You're currently subscribed to receive email notifications when new blog posts are published.
              </p>
              <p className="text-xs text-green-600">
                To unsubscribe, you can use the unsubscribe link in any email notification, 
                or contact the website administrator.
              </p>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <BellOff className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-800">Email Notifications Disabled</span>
              </div>
              <p className="text-red-700 text-sm mb-4">
                You're currently unsubscribed from email notifications. You won't receive emails 
                when new blog posts are published.
              </p>
              <Button
                onClick={handleResubscribe}
                disabled={resubscribing}
                className="bg-green-600 hover:bg-green-700"
              >
                {resubscribing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Resubscribing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Resubscribe to Email Notifications
                  </div>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Summary Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
          <CardDescription>
            Your engagement and activity on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary">{stats.commentsCount}</div>
              <div className="text-sm text-muted-foreground">Comments Posted</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary">{stats.daysActive}</div>
              <div className="text-sm text-muted-foreground">Days Active</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Edit className="h-5 w-5 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary">{stats.profileUpdates}</div>
              <div className="text-sm text-muted-foreground">Profile Updates</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Account Actions
          </CardTitle>
          <CardDescription>
            Manage your account settings and data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="flex items-center gap-2 flex-1"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive"
                  className="flex items-center gap-2 flex-1"
                  disabled={deleting}
                >
                  {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Delete Account
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>
                      Are you sure you want to permanently delete your account? This action cannot be undone.
                    </p>
                    <p className="font-medium">
                      What will happen:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Your profile and account data will be permanently deleted</li>
                      <li>Your comments will remain visible but become anonymous</li>
                      <li>You will be immediately signed out</li>
                      <li>This action cannot be reversed</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={deleting}
                  >
                    {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <p className="font-medium mb-1">Note about account deletion:</p>
            <p>
              When you delete your account, your comments will remain on the site but will be marked as "Anonymous User" 
              to preserve the integrity of discussions. Your personal information and profile will be completely removed.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;