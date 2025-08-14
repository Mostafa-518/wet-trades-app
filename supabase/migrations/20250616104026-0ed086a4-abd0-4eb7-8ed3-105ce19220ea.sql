
-- Add last_login field to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS last_login timestamp with time zone;

-- Add avatar_url field for user avatars
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS avatar_url text;

-- Create index on role field for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- Update the default role to 'user' instead of 'viewer' (keeping backward compatibility)
ALTER TABLE public.user_profiles 
ALTER COLUMN role SET DEFAULT 'viewer'::user_role;

-- Add RLS policies to restrict access to user_profiles table
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
FOR UPDATE USING (auth.uid() = id);

-- Policy: Only admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy: Only admins can insert new profiles (for user creation)
CREATE POLICY "Admins can insert profiles" ON public.user_profiles
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy: Only admins can delete profiles
CREATE POLICY "Admins can delete profiles" ON public.user_profiles
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create function to update last_login on successful authentication
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_profiles 
  SET last_login = NOW(), updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't block login if this fails
    RETURN NEW;
END;
$$;

-- Create trigger to automatically update last_login when user signs in
DROP TRIGGER IF EXISTS on_auth_user_signin ON auth.users;
CREATE TRIGGER on_auth_user_signin
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW 
  WHEN (NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at)
  EXECUTE FUNCTION public.update_last_login();
