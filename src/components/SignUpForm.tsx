
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
  password: '',
  confirmPassword: ''
};

export function SignUpForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    formValues,
    getInputProps,
    resetForm,
    hasPersistedData
  } = usePersistentFormState(initialFormData, {
    customKey: 'signup-form',
    syncWithUrl: false, // Don't sync credentials with URL for security
    excludeFields: ['password', 'confirmPassword'], // Don't persist passwords for security
    expirationHours: 1,
    debounceMs: 100
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formValues.password !== formValues.confirmPassword) {
      toast({
        title: 'Password mismatch',
        description: 'Please make sure your passwords match.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: formValues.email,
        password: formValues.password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        toast({
          title: 'Sign up failed',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      if (data.user) {
        toast({
          title: 'Account created successfully!',
          description: 'Please check your email to verify your account.',
        });
        
        // Clear form data after successful signup
        resetForm();
        navigate('/login');
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
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Enter your details to create a new account
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                required
                disabled={isLoading}
                {...getInputProps('confirmPassword')}
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
                Create Account
              </Button>
            </div>
            <div className="text-center text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign in here
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
