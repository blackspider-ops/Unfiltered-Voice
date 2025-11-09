import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AuditLogEntry {
    id: string;
    post_id: string;
    action: string;
    old_data: any;
    new_data: any;
    changed_at: string;
    changed_by: string | null;
    user_email?: string;
}

export function AuditLog() {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAuditLogs();
    }, []);

    const fetchAuditLogs = async () => {
        try {
            const { data, error } = await supabase
                .from('posts_audit_log_with_users')
                .select('*')
                .order('changed_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            
            setLogs((data || []).map(log => ({
                ...log,
                user_email: log.user_email || 'System'
            })));
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'INSERT':
                return 'bg-green-500';
            case 'UPDATE':
                return 'bg-blue-500';
            case 'DELETE':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getActionLabel = (action: string) => {
        switch (action) {
            case 'INSERT':
                return 'Created';
            case 'UPDATE':
                return 'Updated';
            case 'DELETE':
                return 'Deleted';
            default:
                return action;
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Audit Log
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        Loading audit logs...
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (logs.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Audit Log
                    </CardTitle>
                    <CardDescription>
                        Track all changes made to blog posts
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No audit logs available yet.</p>
                        <p className="text-sm mt-1">Changes will appear here once the audit system is active.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Audit Log
                </CardTitle>
                <CardDescription>
                    Recent changes to blog posts (last 50 entries)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                        {logs.map((log) => (
                            <div
                                key={log.id}
                                className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2 flex-1">
                                        <Badge className={getActionColor(log.action)}>
                                            {getActionLabel(log.action)}
                                        </Badge>
                                        <span className="text-sm font-medium">
                                            {log.action === 'DELETE' 
                                                ? log.old_data?.title 
                                                : log.new_data?.title || 'Unknown Post'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(log.changed_at), { addSuffix: true })}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            by {log.user_email || 'Unknown'}
                                        </span>
                                    </div>
                                </div>

                                {log.action === 'UPDATE' && log.old_data && log.new_data && (
                                    <div className="text-sm text-muted-foreground mt-2 space-y-1">
                                        {log.old_data.title !== log.new_data.title && (
                                            <div>
                                                <span className="font-medium">Title:</span>{' '}
                                                <span className="line-through">{log.old_data.title}</span>
                                                {' → '}
                                                <span>{log.new_data.title}</span>
                                            </div>
                                        )}
                                        {log.old_data.is_published !== log.new_data.is_published && (
                                            <div>
                                                <span className="font-medium">Status:</span>{' '}
                                                {log.new_data.is_published ? 'Published' : 'Unpublished'}
                                            </div>
                                        )}
                                        {log.old_data.content !== log.new_data.content && (
                                            <div>
                                                <span className="font-medium">Content updated</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {log.action === 'DELETE' && log.old_data && (
                                    <div className="text-sm text-muted-foreground mt-2">
                                        <span className="font-medium">Category:</span> {log.old_data.category}
                                    </div>
                                )}

                                {log.action === 'INSERT' && log.new_data && (
                                    <div className="text-sm text-muted-foreground mt-2">
                                        <span className="font-medium">Category:</span> {log.new_data.category}
                                        {log.new_data.is_published && (
                                            <span className="ml-2">• Published</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
