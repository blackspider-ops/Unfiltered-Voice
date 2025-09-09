import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, MessageCircle, FileText, Eye, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AnalyticsData {
  totalPosts: number;
  publishedPosts: number;
  totalComments: number;
  approvedComments: number;
  totalUsers: number;
  recentActivity: Array<{
    type: 'post' | 'comment' | 'user';
    title: string;
    date: string;
    status?: string;
  }>;
  categoryStats: Array<{
    category: string;
    count: number;
    color: string;
  }>;
  monthlyStats: Array<{
    month: string;
    posts: number;
    comments: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const categoryLabels: Record<string, string> = {
  'mental-health': 'Mind Matters',
  'current-affairs': 'News & Views',
  'creative-writing': 'Bleeding Ink',
  'books': 'Reading Reflections'
};

export function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [postsRes, commentsRes, profilesRes] = await Promise.all([
        supabase.from('posts').select('*'),
        supabase.from('comments').select('*'),
        supabase.from('profiles').select('*')
      ]);

      if (postsRes.error) throw postsRes.error;
      if (commentsRes.error) throw commentsRes.error;
      if (profilesRes.error) throw profilesRes.error;

      const posts = postsRes.data || [];
      const comments = commentsRes.data || [];
      const users = profilesRes.data || [];

      // Calculate basic stats
      const totalPosts = posts.length;
      const publishedPosts = posts.filter(p => p.is_published).length;
      const totalComments = comments.length;
      const approvedComments = comments.filter(c => c.is_approved).length;
      const totalUsers = users.length;

      // Category statistics
      const categoryStats = Object.entries(
        posts.reduce((acc, post) => {
          acc[post.category] = (acc[post.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([category, count], index) => ({
        category: categoryLabels[category] || category,
        count,
        color: COLORS[index % COLORS.length]
      }));

      // Recent activity
      const recentActivity = [
        ...posts.slice(-5).map(post => ({
          type: 'post' as const,
          title: post.title,
          date: post.created_at,
          status: post.is_published ? 'Published' : 'Draft'
        })),
        ...comments.slice(-5).map(comment => ({
          type: 'comment' as const,
          title: `Comment by ${comment.display_name}`,
          date: comment.created_at,
          status: comment.is_approved ? 'Approved' : 'Pending'
        })),
        ...users.slice(-3).map(user => ({
          type: 'user' as const,
          title: `New user: ${user.display_name}`,
          date: user.created_at
        }))
      ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);

      // Monthly statistics (last 6 months)
      const monthlyStats = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
        
        const monthPosts = posts.filter(p => 
          p.created_at.startsWith(monthKey)
        ).length;
        
        const monthComments = comments.filter(c => 
          c.created_at.startsWith(monthKey)
        ).length;

        return {
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          posts: monthPosts,
          comments: monthComments
        };
      }).reverse();

      setData({
        totalPosts,
        publishedPosts,
        totalComments,
        approvedComments,
        totalUsers,
        recentActivity,
        categoryStats,
        monthlyStats
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold">{data.totalPosts}</p>
                <p className="text-xs text-muted-foreground">
                  {data.publishedPosts} published
                </p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Comments</p>
                <p className="text-2xl font-bold">{data.totalComments}</p>
                <p className="text-xs text-muted-foreground">
                  {data.approvedComments} approved
                </p>
              </div>
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Users</p>
                <p className="text-2xl font-bold">{data.totalUsers}</p>
                <p className="text-xs text-muted-foreground">
                  Registered members
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Engagement</p>
                <p className="text-2xl font-bold">
                  {data.totalPosts > 0 ? Math.round(data.totalComments / data.totalPosts * 10) / 10 : 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  Comments per post
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Activity</CardTitle>
            <CardDescription>Posts and comments over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="posts" fill="#8884d8" name="Posts" />
                <Bar dataKey="comments" fill="#82ca9d" name="Comments" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Posts by Category</CardTitle>
            <CardDescription>Distribution of posts across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.categoryStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, count }) => `${category}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest posts, comments, and user registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {activity.type === 'post' && <FileText className="h-4 w-4 text-blue-500" />}
                  {activity.type === 'comment' && <MessageCircle className="h-4 w-4 text-green-500" />}
                  {activity.type === 'user' && <Users className="h-4 w-4 text-purple-500" />}
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                {activity.status && (
                  <Badge variant={
                    activity.status === 'Published' || activity.status === 'Approved' 
                      ? 'default' 
                      : 'secondary'
                  }>
                    {activity.status}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}