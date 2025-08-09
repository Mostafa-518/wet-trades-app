import { useAuth } from '@/hooks/useAuth';

export type Permission = 
  | 'read'
  | 'create' 
  | 'update'
  | 'delete'
  | 'manage_users'
  | 'view_reports'
  | 'manage_projects'
  | 'manage_subcontractors'
  | 'manage_trades'
  | 'manage_responsibilities'
  | 'manage_subcontracts';

export type Role = 'admin' | 'procurement_manager' | 'procurement_engineer' | 'viewer';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
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
  ],
  procurement_manager: [
    'read',
    'create',
    'update',
    'view_reports',
    'manage_projects',
    'manage_subcontractors',
    'manage_trades',
    'manage_responsibilities',
    'manage_subcontracts'
  ],
  procurement_engineer: [
    'read',
    'create',
    'update',
    'view_reports',
    'manage_subcontractors',
    'manage_trades',
    'manage_responsibilities',
    'manage_subcontracts'
  ],
  viewer: [
    'read',
    'view_reports'
  ]
};

export function usePermissions() {
  const { profile } = useAuth();
  
  const userRole = profile?.role as Role || 'viewer';
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];

  const hasPermission = (permission: Permission): boolean => {
    return userPermissions.includes(permission);
  };

  const canManageUsers = hasPermission('manage_users');
  const canModify = hasPermission('update') || hasPermission('create');
  const canDelete = hasPermission('delete');
  const canViewReports = hasPermission('view_reports');

  return {
    userRole,
    userPermissions,
    hasPermission,
    canManageUsers,
    canModify,
    canDelete,
    canViewReports
  };
}