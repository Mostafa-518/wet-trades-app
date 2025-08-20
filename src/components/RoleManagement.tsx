
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { UserService } from '@/services/userService';
import { Permission, Role } from '@/hooks/usePermissions';
import { User } from '@/types/user';
import { useAuth } from '@/hooks/useAuth';

const AVAILABLE_PERMISSIONS: Permission[] = [
  'read',
  'create',
  'update',
  'delete',
  'manage_users',
  'view_reports',
  'manage_projects',
  'manage_subcontractors',
  'manage_trades',
  'manage_responsibilities',
  'manage_subcontracts'
];

const PERMISSION_LABELS: Record<Permission, string> = {
  'read': 'View Data',
  'create': 'Create Records',
  'update': 'Update Records',
  'delete': 'Delete Records',
  'manage_users': 'Manage Users',
  'view_reports': 'View Reports',
  'manage_projects': 'Manage Projects',
  'manage_subcontractors': 'Manage Subcontractors',
  'manage_trades': 'Manage Trades',
  'manage_responsibilities': 'Manage Responsibilities',
  'manage_subcontracts': 'Manage Subcontracts'
};

export function RoleManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const data = await UserService.getAll();
      return data.map(user => ({
        id: user.id,
        name: user.full_name || '',
        email: user.email || '',
        role: user.role as Role,
        phone: user.phone || '',
        department: 'General',
        status: 'active' as const,
        createdAt: user.created_at,
        lastLogin: user.last_login,
        avatar: user.avatar_url
      }));
    }
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: Role }) => {
      console.log('=== Role Update Started ===');
      console.log('Updating user role:', { userId, role });
      
      try {
        const result = await UserService.update(userId, { role });
        console.log('Role update service result:', result);
        return result;
      } catch (error) {
        console.error('Role update service error:', error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      console.log('=== Role Update Success ===');
      console.log('Role update successful:', data);
      console.log('Variables:', variables);
      
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.refetchQueries({ queryKey: ['users'] });
      
      toast({
        title: "Role updated",
        description: `User role has been successfully updated to ${variables.role.replace('_', ' ')}.`,
      });
    },
    onError: (error: any) => {
      console.error('=== Role Update Error ===');
      console.error('Role update error:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      });
      
      toast({
        title: "Error",
        description: error.message || "Failed to update user role. Please check your permissions.",
        variant: "destructive"
      });
    }
  });

  const handleRoleChange = (userId: string, newRole: Role) => {
    console.log('=== handleRoleChange called ===');
    console.log('Role change requested:', { userId, newRole });
    console.log('Current profile:', profile);
    console.log('Is mutation pending?', updateUserRoleMutation.isPending);
    
    // Security: Prevent self-role modification
    if (userId === profile?.id) {
      console.log('Blocking self-role modification');
      toast({
        title: "Error",
        description: "You cannot modify your own role",
        variant: "destructive"
      });
      return;
    }
    
    console.log('Calling mutation with:', { userId, role: newRole });
    updateUserRoleMutation.mutate({ userId, role: newRole });
  };

  const getRolePermissions = (role: Role): Permission[] => {
    const rolePermissions = {
      admin: [
        'read', 'create', 'update', 'delete', 'manage_users', 'view_reports',
        'manage_projects', 'manage_subcontractors', 'manage_trades',
        'manage_responsibilities', 'manage_subcontracts'
      ] as Permission[],
      procurement_manager: [
        'read', 'create', 'update', 'delete', 'view_reports', 'manage_projects',
        'manage_subcontractors', 'manage_trades', 'manage_responsibilities',
        'manage_subcontracts'
      ] as Permission[],
      procurement_engineer: [
        'read', 'create', 'update', 'delete', 'view_reports', 'manage_subcontractors',
        'manage_trades', 'manage_responsibilities', 'manage_subcontracts'
      ] as Permission[],
      viewer: ['read', 'view_reports'] as Permission[]
    };
    return rolePermissions[role] || [];
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Role & Permission Management</h2>
        <p className="text-muted-foreground">
          Manage user roles and their associated permissions.
        </p>
      </div>

      {/* Role Definitions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(['admin', 'procurement_manager', 'procurement_engineer', 'viewer'] as Role[]).map((role) => (
          <Card key={role}>
            <CardHeader>
              <CardTitle className="capitalize">{role.replace('_', ' ')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm font-medium">Permissions:</div>
                <div className="flex flex-wrap gap-1">
                  {getRolePermissions(role).map((permission) => (
                    <Badge key={permission} variant="secondary" className="text-xs">
                      {PERMISSION_LABELS[permission]}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Role Assignment */}
      <Card>
        <CardHeader>
          <CardTitle>User Role Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Badge variant={
                    user.role === 'admin' ? 'default' : 
                    user.role === 'procurement_manager' ? 'secondary' : 
                    user.role === 'procurement_engineer' ? 'secondary' : 'outline'
                  }>
                    {user.role.replace('_', ' ')}
                  </Badge>
                  
                  <div className="flex gap-2">
                    {(['admin', 'procurement_manager', 'procurement_engineer', 'viewer'] as Role[]).map((role) => {
                      // Security: Prevent self-role modification
                      const isOwnProfile = user.id === profile?.id;
                      const isDisabled = updateUserRoleMutation.isPending || isOwnProfile;
                      
                      return (
                        <Button
                          key={role}
                          variant={user.role === role ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleRoleChange(user.id, role)}
                          disabled={isDisabled}
                          title={isOwnProfile ? "Cannot modify your own role" : undefined}
                        >
                          {role.replace('_', ' ')}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
