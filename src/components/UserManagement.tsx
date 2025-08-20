
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { UsersTable } from '@/components/UsersTable';
import { UserDetailView } from '@/components/UserDetailView';
import { UserDialogs } from '@/components/UserDialogs';
import { useUserMutations } from '@/hooks/useUserMutations';
import { UserService } from '@/services/userService';
import { User } from '@/types/user';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { logUserManagementAction } from '@/utils/security/dataAccessLogger';

export function UserManagement() {
  const location = useLocation();
  const { profile } = useAuth();
  const { canManageUsers } = usePermissions();
  const { createUserMutation, updateUserMutation, deleteUserMutation } = useUserMutations();
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const data = await UserService.getAll();
      return data.map(user => {
        return {
          id: user.id,
          name: user.full_name || '',
          email: user.email || '',
          role: user.role as 'admin' | 'procurement_manager' | 'procurement_engineer' | 'viewer',
          phone: user.phone || '',
          department: 'General',
          status: 'active' as const,
          createdAt: user.created_at,
          lastLogin: user.last_login,
          avatar: user.avatar_url
        };
      });
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  React.useEffect(() => {
    if (location.state?.editUser) {
      console.log('Opening edit form for user:', location.state.editUser);
      setEditingUser(location.state.editUser);
      setIsFormOpen(true);
    }
  }, [location.state]);

  const handleAddUser = () => {
    console.log('Adding new user');
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (user: User) => {
    console.log('Editing user:', user);
    setEditingUser(user);
    setIsFormOpen(true);
    setIsDetailOpen(false);
  };

  const handleViewUser = async (user: User) => {
    console.log('Viewing user:', user);
    // Log the profile view action
    await logUserManagementAction('profile_view', user.id);
    setSelectedUser(user);
    setIsDetailOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    console.log('Requesting deletion for user:', userId);
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      console.log('Confirming deletion for user:', userToDelete);
      // Log user deletion
      await logUserManagementAction('user_delete', userToDelete);
      deleteUserMutation.mutate(userToDelete);
    }
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      console.log('Submitting user form:', { editingUser: editingUser?.id, data });
      
      if (editingUser) {
        // Log role change if role is being modified
        if (data.role && data.role !== editingUser.role) {
          await logUserManagementAction('role_change', editingUser.id, {
            old_role: editingUser.role,
            new_role: data.role
          });
        }
        
        console.log('Updating existing user:', editingUser.id);
        await updateUserMutation.mutateAsync({ id: editingUser.id, userData: data });
      } else {
        console.log('Creating new user');
        const newUser = await createUserMutation.mutateAsync(data);
        // Log user creation
        if (newUser) {
          await logUserManagementAction('user_create', newUser.id, {
            created_role: data.role
          });
        }
      }
      
      console.log('User form submitted successfully');
      setIsFormOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error submitting user form:', error);
      // Error handling is done in mutation callbacks
    }
  };

  const handleFormCancel = () => {
    console.log('Canceling user form');
    setIsFormOpen(false);
    setEditingUser(null);
  };

  const handleDetailBack = () => {
    setIsDetailOpen(false);
    setSelectedUser(null);
  };

  if (isDetailOpen && selectedUser) {
    return (
      <UserDetailView
        user={selectedUser}
        onBack={handleDetailBack}
        onEdit={canManageUsers ? handleEditUser : () => {}}
      />
    );
  }

  return (
    <>
      <UsersTable
        users={users}
        onAdd={canManageUsers ? handleAddUser : undefined}
        onEdit={canManageUsers ? handleEditUser : undefined}
        onDelete={canManageUsers ? handleDeleteUser : undefined}
        onView={handleViewUser}
        loading={isLoading}
        canModify={canManageUsers}
      />

      <UserDialogs
        isFormOpen={isFormOpen}
        setIsFormOpen={setIsFormOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        editingUser={editingUser}
        onFormSubmit={handleFormSubmit}
        onFormCancel={handleFormCancel}
        onConfirmDelete={confirmDelete}
        canModify={canManageUsers}
        isDeleting={deleteUserMutation.isPending}
      />
    </>
  );
}
