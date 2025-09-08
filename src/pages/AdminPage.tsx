import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Eye, EyeOff, Upload, Plus } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  category: string;
  slug: string;
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
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts');
  const [loadingData, setLoadingData] = useState(true);

  // New post form state
  const [newPost, setNewPost] = useState({
    title: '',
    category: 'mental-health',
    slug: '',
    pdf_url: '',
    cover_url: '',
    read_time_min: 5
  });

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
      toast.error('Failed to load admin data');
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

      toast.success(`Post ${!isPublished ? 'published' : 'unpublished'} successfully`);
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.filter(post => post.id !== postId));
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
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

      toast.success(`Comment ${!isApproved ? 'approved' : 'hidden'} successfully`);
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
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
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          ...newPost,
          slug: newPost.slug || newPost.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        });

      if (error) throw error;

      setNewPost({
        title: '',
        category: 'mental-health',
        slug: '',
        pdf_url: '',
        cover_url: '',
        read_time_min: 5
      });

      toast.success('Post created successfully');
      fetchData();
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post: ' + error.message);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your blog content and community
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 p-1 bg-surface rounded-lg w-fit">
          <Button
            variant={activeTab === 'posts' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('posts')}
            className="rounded-md"
          >
            Posts ({posts.length})
          </Button>
          <Button
            variant={activeTab === 'comments' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('comments')}
            className="rounded-md"
          >
            Comments ({comments.length})
          </Button>
        </div>

        {activeTab === 'posts' && (
          <div className="space-y-6">
            {/* Create New Post */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Post
                </CardTitle>
                <CardDescription>
                  Add a new post to your blog
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={createPost} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      value={newPost.category}
                      onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="mental-health">Mind Matters</option>
                      <option value="current-affairs">News & Views</option>
                      <option value="creative-writing">Bleeding Ink</option>
                      <option value="books">Reading Reflections</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug (optional)</Label>
                    <Input
                      id="slug"
                      value={newPost.slug}
                      onChange={(e) => setNewPost({ ...newPost, slug: e.target.value })}
                      placeholder="auto-generated-from-title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="readTime">Read Time (minutes)</Label>
                    <Input
                      id="readTime"
                      type="number"
                      min="1"
                      value={newPost.read_time_min}
                      onChange={(e) => setNewPost({ ...newPost, read_time_min: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pdfUrl">PDF URL</Label>
                    <Input
                      id="pdfUrl"
                      value={newPost.pdf_url}
                      onChange={(e) => setNewPost({ ...newPost, pdf_url: e.target.value })}
                      placeholder="/content/category/post.pdf"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="coverUrl">Cover Image URL</Label>
                    <Input
                      id="coverUrl"
                      value={newPost.cover_url}
                      onChange={(e) => setNewPost({ ...newPost, cover_url: e.target.value })}
                      placeholder="/content/category/post.jpg"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Button type="submit" className="w-full md:w-auto">
                      Create Post
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

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
                        <Switch
                          checked={post.is_published}
                          onCheckedChange={() => togglePostPublication(post.id, post.is_published)}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => deletePost(post.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="space-y-4">
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
          </div>
        )}
      </div>
    </div>
  );
}