import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, Shield, ShieldCheck, Search, Trash2, Mail } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface User {
  id: string;
  email: string;
  display_name: string;
  role: 'owner' | 'admin' | 'user';
  registered_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
}

export function UserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Try to use the RPC function first
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_users');
      
      if (rpcError) {
        console.warn('RPC function not available, using fallback:', rpcError);
        
        // Fallback: Query profiles with user roles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select(`
            *,
            user_roles(role)
          `);
        
        if (profilesError) throw profilesError;
        
        // Transform data to match expected format
        const transformedData = profilesData?.map(user => {
          const roles = user.user_roles || [];
          let userRole: 'owner' | 'admin' | 'user' = 'user';
          
          if (roles.find((r: any) => r.role === 'owner')) {
            userRole = 'owner';
          } else if (roles.find((r: any) => r.role === 'admin')) {
            userRole = 'admin';
          }
          
          return {
            id: user.user_id,
            email: user.email,
            display_name: user.display_name,
            role: userRole,
            registered_at: user.created_at,
            last_sign_in_at: null,
            email_confirmed_at: user.created_at
          };
        }) || [];
        
        setUsers(transformedData);
      } else {
        setUsers(rpcData || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserRole = async (userId: string, currentRole: 'owner' | 'admin' | 'user') => {
    setUpdatingRole(userId);
    try {
      // Check if current user is owner (only owners can change roles)
      const { data: currentUserRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
      
      const isCurrentUserOwner = currentUserRoles?.some(r => r.role === 'owner');
      
      if (!isCurrentUserOwner) {
        // Submit change request for admin users
        const originalData = users.find(u => u.id === userId);
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        
        const { error } = await supabase.rpc('submit_change_request', {
          _change_type: 'user_role_change',
          _target_id: userId,
          _original_data: originalData,
          _proposed_changes: {
            action: newRole === 'admin' ? 'add_role' : 'remove_role',
            role: 'admin'
          },
          _change_summary: `Change user role from ${currentRole} to ${newRole}`
        });
        
        if (error) throw error;
        
        toast({
          title: "Change Request Submitted",
          description: "Your role change request has been submitted for owner approval",
        });
        return;
      }
      
      // Owner can make direct changes
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      
      if (newRole === 'admin') {
        // Add admin role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });
        
        if (error) throw error;
      } else {
        // Remove admin role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');
        
        if (error) throw error;
      }

      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    } finally {
      setUpdatingRole(null);
    }
  };

  const makeOwner = async (userId: string) => {
    if (!confirm('Are you sure you want to make this user an owner? This action cannot be undone by admins.')) return;
    
    setUpdatingRole(userId);
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'owner' });
      
      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: 'owner' } : user
      ));

      toast({
        title: "Success",
        description: "User promoted to owner",
      });
      
      fetchUsers(); // Refresh to get updated data
    } catch (error) {
      console.error('Error making user owner:', error);
      toast({
        title: "Error",
        description: "Failed to make user owner",
        variant: "destructive",
      });
    } finally {
      setUpdatingRole(null);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ownerCount = users.filter(user => user.role === 'owner').length;
  const adminCount = users.filter(user => user.role === 'admin').length;
  const userCount = users.filter(user => user.role === 'user').length;

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Owners</p>
                <p className="text-2xl font-bold text-purple-600">{ownerCount}</p>
              </div>
              <ShieldCheck className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Administrators</p>
                <p className="text-2xl font-bold text-blue-600">{adminCount}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Regular Users</p>
                <p className="text-2xl font-bold">{userCount}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Manage user roles and permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Users List */}
          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{user.display_name}</h4>
                      <Badge variant={
                        user.role === 'owner' ? 'default' : 
                        user.role === 'admin' ? 'secondary' : 'outline'
                      } className={
                        user.role === 'owner' ? 'bg-purple-600' :
                        user.role === 'admin' ? 'bg-blue-600' : ''
                      }>
                        {user.role === 'owner' ? (
                          <>
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Owner
                          </>
                        ) : user.role === 'admin' ? (
                          <>
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </>
                        ) : (
                          'User'
                        )}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </span>
                      <span>
                        Joined {formatDistanceToNow(new Date(user.registered_at), { addSuffix: true })}
                      </span>
                      {user.last_sign_in_at && (
                        <span>
                          Last active {formatDistanceToNow(new Date(user.last_sign_in_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {user.role !== 'owner' && (
                    <>
                      <Button
                        variant={user.role === 'admin' ? 'destructive' : 'default'}
                        size="sm"
                        onClick={() => toggleUserRole(user.id, user.role)}
                        disabled={updatingRole === user.id}
                      >
                        {updatingRole === user.id ? (
                          'Updating...'
                        ) : user.role === 'admin' ? (
                          'Remove Admin'
                        ) : (
                          'Make Admin'
                        )}
                      </Button>
                      
                      {/* Only current owners can make new owners */}
                      {user.role !== 'owner' && ownerCount > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => makeOwner(user.id)}
                          disabled={updatingRole === user.id}
                          className="border-purple-600 text-purple-600 hover:bg-purple-50"
                        >
                          Make Owner
                        </Button>
                      )}
                    </>
                  )}
                  
                  {user.role === 'owner' && (
                    <Badge variant="outline" className="text-purple-600 border-purple-600">
                      Cannot be modified
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'No users found matching your search.' : 'No users found.'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}