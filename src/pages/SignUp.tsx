
import { AuthGuard } from '@/components/AuthGuard';
import { SignUpForm } from '@/components/SignUpForm';

export function SignUp() {
  return (
    <AuthGuard requireAuth={false}>
      <SignUpForm />
    </AuthGuard>
  );
}
