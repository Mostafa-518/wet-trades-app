
import React from 'react';
import { UserManagement } from '@/components/UserManagement';
import { PermissionGuard } from '@/components/PermissionGuard';

export function Users() {
  return (
    <PermissionGuard permission="manage_users">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions for your organization.
          </p>
        </div>

        <UserManagement />
      </div>
    </PermissionGuard>
  );
}
