import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Eye, EyeOff, FileText, MessageCircle, Users, BarChart3, Settings as SettingsIcon, Loader2, Edit, Crown, Mail as MailIcon, Tag, User } from 'lucide-react';
import { BlogEditor } from '@/components/admin/BlogEditor';
import { UserManagement } from '@/components/admin/UserManagement';
import { Analytics } from '@/components/admin/Analytics';
import { OwnerApproval } from '@/components/admin/OwnerApproval';
import { Mail } from '@/components/admin/Mail';
import { Categories } from '@/components/admin/Categories';
import { Settings } from '@/components/admin/Settings';
import { AboutEditor } from '@/components/admin/AboutEditor';

interface Post {
  id: string;
  title: string;
  category: string;
  slug: string;
  content?: string;
  pdf_url?: string;
  cover_url?: string;
  uploaded_at: string;
  is_published: boolean;
  read_time_min: number;
}

interface Comment {
  id: string;
  display_name: string;
  message: string;
  created_at: string;
  is_approved: boolean;
  post_id: string;
}

export default function AdminPage() {
  const { user, isAdmin, isOwner, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [activeTab, setActiveTab] = useState('analytics');

  useEffect(() => {
    if (!loading) {
      if (!user || !isAdmin) {
        navigate('/', { replace: true });
        return;
      }
      fetchData();
    }
  }, [user, isAdmin, loading, navigate]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [postsRes, commentsRes] = await Promise.all([
        supabase.from('posts').select('*').order('uploaded_at', { ascending: false }),
        supabase.from('comments').select('*').order('created_at', { ascending: false })
      ]);

      if (postsRes.error) throw postsRes.error;
      if (commentsRes.error) throw commentsRes.error;

      setPosts(postsRes.data || []);
      setComments(commentsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const togglePostPublication = async (postId: string, isPublished: boolean) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ is_published: !isPublished })
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.map(post => 
        post.id === postId ? { ...post, is_published: !isPublished } : post
      ));

      toast({
        title: "Success",
        description: `Post ${!isPublished ? 'published' : 'unpublished'} successfully`,
      });
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: "Error",
        description: "Failed to update post",
        variant: "destructive",
      });
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      if (!isOwner) {
        // Submit change request for admin users
        const postToDelete = posts.find(p => p.id === postId);
        
        const { error } = await supabase.rpc('submit_change_request', {
          _change_type: 'post_delete',
          _target_id: postId,
          _original_data: postToDelete,
          _proposed_changes: { action: 'delete' },
          _change_summary: `Delete post: ${postToDelete?.title}`
        });

        if (error) throw error;

        toast({
          title: "Delete Request Submitted",
          description: "Your delete request has been submitted for owner approval",
        });
        return;
      }

      // Owner can delete directly
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.filter(post => post.id !== postId));
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const toggleCommentApproval = async (commentId: string, isApproved: boolean) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ is_approved: !isApproved })
        .eq('id', commentId);

      if (error) throw error;

      setComments(comments.map(comment => 
        comment.id === commentId ? { ...comment, is_approved: !isApproved } : comment
      ));

      toast({
        title: "Success",
        description: `Comment ${!isApproved ? 'approved' : 'hidden'} successfully`,
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({
        title: "Error",
        description: "Failed to update comment",
        variant: "destructive",
      });
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setComments(comments.filter(comment => comment.id !== commentId));
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setActiveTab('editor');
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your blog content, users, and analytics
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${isOwner ? 'grid-cols-10' : 'grid-cols-9'}`}>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="editor" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Blog Editor
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Posts ({posts.length})
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              About Page
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Comments ({comments.length})
            </TabsTrigger>
            <TabsTrigger value="mail" className="flex items-center gap-2">
              <MailIcon className="h-4 w-4" />
              Mail
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              Settings
            </TabsTrigger>
            {isOwner && (
              <TabsTrigger value="approvals" className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Approvals
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>

          <TabsContent value="editor">
            <BlogEditor 
              onPostCreated={() => {
                fetchData();
                setEditingPost(null);
              }} 
              editingPost={editingPost}
              onCancelEdit={handleCancelEdit}
            />
          </TabsContent>

          <TabsContent value="categories">
            <Categories />
          </TabsContent>

          <TabsContent value="about">
            <AboutEditor />
          </TabsContent>

          <TabsContent value="posts" className="space-y-6">
            {/* Posts List */}
            <div className="grid gap-4">
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{post.title}</h3>
                          <Badge variant={post.is_published ? 'default' : 'secondary'}>
                            {post.is_published ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {post.category} • {post.read_time_min} min read • 
                          {formatDistanceToNow(new Date(post.uploaded_at), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditPost(post)}
                          title="Edit post"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Switch
                          checked={post.is_published}
                          onCheckedChange={() => togglePostPublication(post.id, post.is_published)}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => deletePost(post.id)}
                          title="Delete post"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {posts.length === 0 && (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">No posts yet. Create your first post in the Blog Editor tab.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-foreground">{comment.display_name}</h4>
                        <Badge variant={comment.is_approved ? 'default' : 'destructive'}>
                          {comment.is_approved ? 'Approved' : 'Pending'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </p>
                      <p className="text-foreground whitespace-pre-wrap">{comment.message}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => toggleCommentApproval(comment.id, comment.is_approved)}
                      >
                        {comment.is_approved ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => deleteComment(comment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {comments.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No comments yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="mail">
            <Mail />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="settings">
            <Settings />
          </TabsContent>

          {isOwner && (
            <TabsContent value="approvals">
              <OwnerApproval />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}