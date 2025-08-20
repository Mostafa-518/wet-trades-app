-- Security Fix Phase 1: Critical Fixes

-- 1. Fix Role Management Privilege Escalation
-- Prevent users from modifying their own roles or escalating privileges
-- This prevents the critical security vulnerability where admins can change their own roles

-- Update user_profiles RLS policies to prevent self-role modification
-- Drop existing policies first
DROP POLICY IF EXISTS "Enable update access for own profile or admins" ON public.user_profiles;

-- Create new policies with enhanced security
-- Users can update their own profile BUT NOT their role
CREATE POLICY "Users can update own profile (non-role fields)" ON public.user_profiles
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  AND (
    -- If role is being updated, it must remain the same
    role = (SELECT role FROM public.user_profiles WHERE id = auth.uid())
  )
);

-- Only admins can update roles, but they cannot modify their own role
CREATE POLICY "Admins can update user roles (not own)" ON public.user_profiles
FOR UPDATE 
TO authenticated
USING (
  is_admin(auth.uid()) 
  AND id != auth.uid()  -- Cannot modify own role
)
WITH CHECK (
  is_admin(auth.uid()) 
  AND id != auth.uid()  -- Cannot modify own role
);

-- Admins can still update their own non-role fields
CREATE POLICY "Admins can update own profile (non-role)" ON public.user_profiles
FOR UPDATE 
TO authenticated
USING (
  is_admin(auth.uid()) 
  AND auth.uid() = id
)
WITH CHECK (
  is_admin(auth.uid()) 
  AND auth.uid() = id
  AND role = (SELECT role FROM public.user_profiles WHERE id = auth.uid())
);

-- 2. Add audit logging for role changes
-- Create a function to log role changes
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if role actually changed
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO public.audit_logs (
      user_id, 
      action, 
      entity, 
      entity_id, 
      before_snapshot, 
      after_snapshot
    ) VALUES (
      auth.uid(),
      'role_change',
      'user_profiles',
      NEW.id,
      jsonb_build_object('role', OLD.role, 'changed_user', OLD.full_name, 'changed_user_email', OLD.email),
      jsonb_build_object('role', NEW.role, 'changed_user', NEW.full_name, 'changed_user_email', NEW.email)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for role change logging
DROP TRIGGER IF EXISTS role_change_audit_trigger ON public.user_profiles;
CREATE TRIGGER role_change_audit_trigger
  AFTER UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_role_change();

-- 3. Restrict audit logs access to admins only
-- Drop existing policies and create admin-only access
DROP POLICY IF EXISTS "Authenticated can read audit logs" ON public.audit_logs;

CREATE POLICY "Admin only audit logs access" ON public.audit_logs
FOR SELECT 
TO authenticated
USING (is_admin(auth.uid()));

-- 4. Add database-level check to prevent role escalation
-- Create a function to validate role changes
CREATE OR REPLACE FUNCTION public.validate_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent users from changing their own role
  IF auth.uid() = NEW.id AND OLD.role IS DISTINCT FROM NEW.role THEN
    RAISE EXCEPTION 'Users cannot modify their own role';
  END IF;
  
  -- Only admins can change roles
  IF OLD.role IS DISTINCT FROM NEW.role AND NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only administrators can change user roles';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for role change validation
DROP TRIGGER IF EXISTS validate_role_change_trigger ON public.user_profiles;
CREATE TRIGGER validate_role_change_trigger
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_role_change();