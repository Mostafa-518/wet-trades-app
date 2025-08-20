-- Fix the role management system permanently

-- 1. First, let's check and fix the is_admin function to be more reliable
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = user_id 
    AND role = 'admin'
  );
$$;

-- 2. Update the role change validation to be less restrictive for admins
CREATE OR REPLACE FUNCTION public.validate_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Skip validation if no role change
  IF OLD.role IS NOT DISTINCT FROM NEW.role THEN
    RETURN NEW;
  END IF;

  -- Prevent users from changing their own role (except for the initial setup)
  IF auth.uid() = NEW.id AND OLD.role IS NOT NULL THEN
    RAISE EXCEPTION 'Users cannot modify their own role';
  END IF;
  
  -- Only admins can change roles (but allow system/service role updates)
  IF auth.uid() IS NOT NULL AND NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only administrators can change user roles';
  END IF;
  
  RETURN NEW;
END;
$$;

-- 3. Drop and recreate the trigger to ensure it works properly
DROP TRIGGER IF EXISTS validate_role_change_trigger ON public.user_profiles;
CREATE TRIGGER validate_role_change_trigger
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_role_change();

-- 4. Update RLS policies to be more permissive for admins
DROP POLICY IF EXISTS "Admins can update user roles (not own)" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update own profile (non-role)" ON public.user_profiles;

-- Create a comprehensive admin update policy
CREATE POLICY "Admins can update any user profile"
ON public.user_profiles
FOR UPDATE
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Allow users to update their own non-role fields
CREATE POLICY "Users can update own profile non-role fields"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  AND role = (SELECT role FROM public.user_profiles WHERE id = auth.uid())
);

-- 5. Ensure the current admin user has proper permissions
-- Update the current user to admin if they're the main user
UPDATE public.user_profiles 
SET role = 'admin'
WHERE email = 'mostafa.ashraf@orascom.com'
AND role != 'admin';