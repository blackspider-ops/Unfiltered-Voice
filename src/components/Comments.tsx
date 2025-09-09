import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AuthForm } from './AuthForm';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  display_name: string;
  message: string;
  created_at: string;
  user_id: string | null;
  is_anonymous: boolean;
}

interface CommentsProps {
  postId: string;
}

export function Comments({ postId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [anonymousName, setAnonymousName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user, session } = useAuth();

  useEffect(() => {
    fetchComments();
    
    // Subscribe to new comments
    const subscription = supabase
      .channel('comments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [postId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent, isAnonymous = false) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (isAnonymous && !anonymousName.trim()) return;

    setSubmitting(true);
    try {
      let commentData;

      if (isAnonymous) {
        // Anonymous comment
        commentData = {
          post_id: postId,
          user_id: null,
          display_name: anonymousName.trim(),
          message: newComment.trim(),
          is_anonymous: true
        };
      } else {
        // Authenticated comment
        if (!user || !session) return;
        
        // Get user profile for display name
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', user.id)
          .single();

        commentData = {
          post_id: postId,
          user_id: user.id,
          display_name: profile?.display_name || 'Anonymous',
          message: newComment.trim(),
          is_anonymous: false
        };
      }

      const { error } = await supabase
        .from('comments')
        .insert(commentData);

      if (error) throw error;

      setNewComment('');
      setAnonymousName('');
      toast.success('Comment posted successfully!');
      fetchComments();
    } catch (error: any) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-display text-foreground">Comments</h3>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-surface rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-display text-foreground">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      <Card className="bg-surface border-subtle">
        <CardContent className="pt-6">
          {user ? (
            // Authenticated user form
            <form onSubmit={(e) => handleSubmitComment(e, false)} className="space-y-4">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                required
              />
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={submitting || !newComment.trim()}
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </form>
          ) : (
            // Anonymous user form
            <div className="space-y-4">
              <form onSubmit={(e) => handleSubmitComment(e, true)} className="space-y-4">
                <Input
                  value={anonymousName}
                  onChange={(e) => setAnonymousName(e.target.value)}
                  placeholder="Your name (required for anonymous comments)"
                  required
                />
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={3}
                  required
                />
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Commenting as anonymous user
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Sign In Instead
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <AuthForm />
                      </DialogContent>
                    </Dialog>
                    <Button 
                      type="submit" 
                      disabled={submitting || !newComment.trim() || !anonymousName.trim()}
                    >
                      {submitting ? 'Posting...' : 'Post Anonymous Comment'}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <Card className="bg-surface border-subtle">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                No comments yet. Be the first to share your thoughts!
              </p>
            </CardContent>
          </Card>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="bg-surface border-subtle">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">
                      {comment.display_name}
                    </h4>
                    {comment.is_anonymous && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                        Anonymous
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-foreground whitespace-pre-wrap">
                  {comment.message}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}