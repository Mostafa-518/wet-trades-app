import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions, Permission } from '@/hooks/usePermissions';
import { Card, CardContent } from '@/components/ui/card';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: Permission;
  fallbackPath?: string;
}

export function PermissionGuard({ 
  children, 
  permission, 
  fallbackPath = '/dashboard' 
}: PermissionGuardProps) {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page.
            </p>
            <Navigate to={fallbackPath} replace />
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}