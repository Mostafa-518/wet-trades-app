
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.user_profiles;

-- Create a security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_id 
    AND raw_user_meta_data->>'role' = 'admin'
  )
  OR EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = user_id 
    AND role = 'admin'
  );
$$;

-- Create simplified RLS policies using the function
CREATE POLICY "Enable read access for own profile or admins" ON public.user_profiles
FOR SELECT USING (
  auth.uid() = id OR public.is_admin(auth.uid())
);

CREATE POLICY "Enable update access for own profile or admins" ON public.user_profiles
FOR UPDATE USING (
  auth.uid() = id OR public.is_admin(auth.uid())
);

CREATE POLICY "Enable insert access for admins" ON public.user_profiles
FOR INSERT WITH CHECK (
  public.is_admin(auth.uid())
);

CREATE POLICY "Enable delete access for admins" ON public.user_profiles
FOR DELETE USING (
  public.is_admin(auth.uid())
);
