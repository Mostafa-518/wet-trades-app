
import { AuthGuard } from '@/components/AuthGuard';
import { LoginForm } from '@/components/LoginForm';
import { UserRoleDebug } from '@/components/UserRoleDebug';

export function Login() {
  return (
    <AuthGuard requireAuth={false}>
      <div className="space-y-8">
        <LoginForm />
        <UserRoleDebug />
      </div>
    </AuthGuard>
  );
}
