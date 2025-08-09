
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { UserDetailView } from '@/components/UserDetailView';
import { UserService } from '@/services/userService';



export function UserDetail() {
  const { id: userId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => UserService.getById(userId!),
    enabled: !!userId,
  });

  const handleBack = () => {
    navigate('/users');
  };

  const handleEdit = (user: any) => {
    navigate('/users', { state: { editUser: user } });
  };

  if (!userId) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
        <p className="text-muted-foreground">The requested user could not be found.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Loading...</h2>
        <p className="text-muted-foreground">Please wait while we load the user details.</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
        <p className="text-muted-foreground">The requested user could not be found.</p>
      </div>
    );
  }

  // Transform database user to User interface
  const roleMapping: Record<string, 'admin' | 'procurement_manager' | 'procurement_engineer' | 'viewer'> = {
    'admin': 'admin',
    'project_manager': 'procurement_manager',
    'procurement_manager': 'procurement_manager', 
    'supervisor': 'procurement_engineer',
    'procurement_engineer': 'procurement_engineer',
    'viewer': 'viewer'
  };
  
  const transformedUser = {
    id: user.id,
    name: user.full_name || '',
    email: user.email || '',
    role: roleMapping[user.role] || 'viewer',
    department: '', // Database doesn't have department field
    status: 'active' as const, // Database doesn't have status field
    createdAt: user.created_at,
    lastLogin: user.last_login || undefined,
    phone: user.phone || undefined,
    avatar: user.avatar_url || undefined,
  };

  return (
    <UserDetailView
      user={transformedUser}
      onBack={handleBack}
      onEdit={handleEdit}
    />
  );
}
