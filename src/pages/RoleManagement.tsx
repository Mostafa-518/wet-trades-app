import React from 'react';
import { RoleManagement } from '@/components/RoleManagement';
import { PermissionGuard } from '@/components/PermissionGuard';

export function RoleManagementPage() {
  return (
    <PermissionGuard permission="manage_users">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Control Panel</h1>
          <p className="text-muted-foreground">
            Manage user roles and control system access permissions.
          </p>
        </div>

        <RoleManagement />
      </div>
    </PermissionGuard>
  );
}