import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';

export function UserRoleDebug() {
  const { user, profile, loading } = useAuth();
  
  // Debug component - no console logs needed in production

  if (loading) {
    return <div>Loading auth state...</div>;
  }

  return (
    <Card className="max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle>User Role Debugging</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="font-semibold">User ID:</div>
          <div>{user?.id || 'Not logged in'}</div>
          
          <div className="font-semibold">Email:</div>
          <div>{user?.email || 'N/A'}</div>
          
          <div className="font-semibold">Role:</div>
          <div>{profile?.role || 'Not set'}</div>
          
          <div className="font-semibold">Full Name:</div>
          <div>{profile?.full_name || 'Not set'}</div>
          
          <div className="font-semibold">Can Modify:</div>
          <div>{profile?.role !== 'viewer' ? 'Yes' : 'No'}</div>
        </div>
      </CardContent>
    </Card>
  );
}