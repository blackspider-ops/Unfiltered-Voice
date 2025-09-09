import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Users, 
  Trash2, 
  Edit, 
  Plus,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PendingChange {
  id: string;
  change_type: 'post_edit' | 'post_delete' | 'post_create' | 'user_role_change';
  target_id: string;
  requested_by: string;
  requested_at: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  original_data?: any;
  proposed_changes: any;
  change_summary: string;
  requester_name?: string;
}

export function OwnerApproval() {
  const { toast } = useToast();
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    fetchPendingChanges();
  }, []);

  const fetchPendingChanges = async () => {
    setLoading(true);
    try {
      // First get pending changes
      const { data: changesData, error: changesError } = await supabase
        .from('pending_changes')
        .select('*')
        .order('requested_at', { ascending: false });

      if (changesError) throw changesError;

      // Then get user profiles for the requesters
      const userIds = changesData?.map(change => change.requested_by) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);

      if (profilesError) {
        console.warn('Could not fetch user profiles:', profilesError);
      }

      // Combine the data
      const transformedData = changesData?.map(change => ({
        ...change,
        requester_name: profilesData?.find(p => p.user_id === change.requested_by)?.display_name || 'Unknown User'
      })) || [];

      setPendingChanges(transformedData);
    } catch (error) {
      console.error('Error fetching pending changes:', error);
      toast({
        title: "Error",
        description: "Failed to load pending changes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (changeId: string, action: 'approve' | 'reject') => {
    try {
      const { error } = await supabase.rpc('review_change_request', {
        _change_id: changeId,
        _action: action,
        _notes: reviewNotes || null
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Change request ${action}d successfully`,
      });

      setReviewingId(null);
      setReviewNotes('');
      fetchPendingChanges();
    } catch (error) {
      console.error('Error reviewing change:', error);
      toast({
        title: "Error",
        description: `Failed to ${action} change request`,
        variant: "destructive",
      });
    }
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'post_edit':
        return <Edit className="h-4 w-4" />;
      case 'post_delete':
        return <Trash2 className="h-4 w-4" />;
      case 'post_create':
        return <Plus className="h-4 w-4" />;
      case 'user_role_change':
        return <Users className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getChangeTypeLabel = (changeType: string) => {
    switch (changeType) {
      case 'post_edit':
        return 'Post Edit';
      case 'post_delete':
        return 'Post Deletion';
      case 'post_create':
        return 'Post Creation';
      case 'user_role_change':
        return 'Role Change';
      default:
        return 'Unknown';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>;
      case 'approved':
        return <Badge variant="default" className="flex items-center gap-1 bg-green-600">
          <CheckCircle className="h-3 w-3" />
          Approved
        </Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderChangeDetails = (change: PendingChange) => {
    const { original_data, proposed_changes } = change;

    switch (change.change_type) {
      case 'post_edit':
        return (
          <div className="space-y-3">
            <h4 className="font-medium">Proposed Changes:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {Object.entries(proposed_changes).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <div className="font-medium capitalize">{key.replace('_', ' ')}:</div>
                  <div className="bg-muted p-2 rounded">
                    <div className="text-red-600">- {original_data?.[key] || 'N/A'}</div>
                    <div className="text-green-600">+ {String(value)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'post_delete':
        return (
          <div className="space-y-2">
            <h4 className="font-medium">Post to be deleted:</h4>
            <div className="bg-red-50 border border-red-200 p-3 rounded">
              <div className="font-medium">{original_data?.title}</div>
              <div className="text-sm text-muted-foreground">
                Category: {original_data?.category} • {original_data?.read_time_min} min read
              </div>
            </div>
          </div>
        );

      case 'user_role_change':
        return (
          <div className="space-y-2">
            <h4 className="font-medium">Role Change:</h4>
            <div className="bg-muted p-3 rounded">
              <div>Action: {proposed_changes.action === 'add_role' ? 'Add' : 'Remove'} role</div>
              <div>Role: {proposed_changes.role}</div>
              <div>User: {original_data?.display_name || 'Unknown'}</div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-muted p-3 rounded">
            <pre className="text-sm">{JSON.stringify(proposed_changes, null, 2)}</pre>
          </div>
        );
    }
  };

  const pendingCount = pendingChanges.filter(c => c.status === 'pending').length;
  const approvedCount = pendingChanges.filter(c => c.status === 'approved').length;
  const rejectedCount = pendingChanges.filter(c => c.status === 'rejected').length;

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Change Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Change Requests
          </CardTitle>
          <CardDescription>
            Review and approve or reject admin change requests
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingChanges.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No change requests found.
            </div>
          ) : (
            pendingChanges.map((change) => (
              <Card key={change.id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getChangeIcon(change.change_type)}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{getChangeTypeLabel(change.change_type)}</h3>
                            {getStatusBadge(change.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Requested by {change.requester_name} • {formatDistanceToNow(new Date(change.requested_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="font-medium text-sm">Summary:</p>
                      <p className="text-sm">{change.change_summary}</p>
                    </div>

                    {/* Change Details */}
                    {renderChangeDetails(change)}

                    {/* Review Section */}
                    {change.status === 'pending' && (
                      <div className="border-t pt-4">
                        {reviewingId === change.id ? (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="reviewNotes">Review Notes (Optional)</Label>
                              <Textarea
                                id="reviewNotes"
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                placeholder="Add any notes about your decision..."
                                className="min-h-[80px]"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleReview(change.id, 'approve')}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleReview(change.id, 'reject')}
                                variant="destructive"
                                className="flex items-center gap-2"
                              >
                                <XCircle className="h-4 w-4" />
                                Reject
                              </Button>
                              <Button
                                onClick={() => {
                                  setReviewingId(null);
                                  setReviewNotes('');
                                }}
                                variant="outline"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            onClick={() => setReviewingId(change.id)}
                            className="flex items-center gap-2"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Review Request
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Review History */}
                    {change.status !== 'pending' && (
                      <div className="border-t pt-4">
                        <div className="text-sm">
                          <p className="font-medium">
                            {change.status === 'approved' ? 'Approved' : 'Rejected'} {formatDistanceToNow(new Date(change.reviewed_at!), { addSuffix: true })}
                          </p>
                          {change.review_notes && (
                            <p className="text-muted-foreground mt-1">
                              Notes: {change.review_notes}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}