
-- Drop ALL existing policies for user_profiles table
DO $$ 
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name IN 
        SELECT pol.polname 
        FROM pg_policy pol 
        JOIN pg_class cls ON pol.polrelid = cls.oid 
        WHERE cls.relname = 'user_profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_profiles', policy_name);
    END LOOP;
END $$;

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
