
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { usePersistentFormState } from '@/hooks/persistent-form';
import { FormResetButton } from '@/components/FormResetButton';

const initialFormData = {
  email: '',
  password: ''
};

export function LoginForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    formValues,
    getInputProps,
    resetForm,
    hasPersistedData
  } = usePersistentFormState(initialFormData, {
    customKey: 'login-form',
    syncWithUrl: false, // Don't sync login credentials with URL for security
    excludeFields: ['password'], // Don't persist password for security
    expirationHours: 1,
    debounceMs: 100
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formValues.email,
        password: formValues.password,
      });

      if (error) {
        toast({
          title: 'Login failed',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      if (data.user) {
        toast({
          title: 'Welcome back!',
          description: 'You have been successfully logged in.',
        });
        
        // Clear form data after successful login
        resetForm();
        navigate('/');
      }
    } catch (error) {
      toast({
        title: 'An error occurred',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                required
                disabled={isLoading}
                {...getInputProps('email')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                required
                disabled={isLoading}
                {...getInputProps('password')}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="flex justify-between items-center w-full">
              <FormResetButton 
                onReset={resetForm}
                hasData={hasPersistedData()}
                variant="outline"
                size="sm"
              >
                Clear Form
              </FormResetButton>
              <Button type="submit" disabled={isLoading} className="flex-1 ml-2">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign in
              </Button>
            </div>
            <div className="text-center text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline">
                Sign up here
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
