
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { UserForm } from '@/components/UserForm';
import { User } from '@/types/user';

interface UserDialogsProps {
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  editingUser: User | null;
  onFormSubmit: (data: any) => Promise<void>;
  onFormCancel: () => void;
  onConfirmDelete: () => void;
  canModify: boolean;
  isDeleting: boolean;
}

export function UserDialogs({
  isFormOpen,
  setIsFormOpen,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  editingUser,
  onFormSubmit,
  onFormCancel,
  onConfirmDelete,
  canModify,
  isDeleting
}: UserDialogsProps) {
  return (
    <>
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Edit User' : 'Add New User'}
              </DialogTitle>
              <DialogDescription>
                {editingUser ? 'Update user information and permissions.' : 'Create a new user account with the required information.'}
              </DialogDescription>
            </DialogHeader>
            <UserForm
              user={editingUser || undefined}
              onSubmit={onFormSubmit}
              onCancel={onFormCancel}
            />
          </DialogContent>
        </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              account and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {canModify && (
              <AlertDialogAction 
                onClick={onConfirmDelete}
                disabled={isDeleting}
              >
                Delete
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
