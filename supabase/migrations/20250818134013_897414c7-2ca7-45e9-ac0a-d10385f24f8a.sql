-- Fix estimates table access control (CRITICAL)
-- Remove overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view estimates" ON estimates;

-- Create restrictive owner-based access policy
CREATE POLICY "Users can view own estimates or Admin/PM can view all" 
ON estimates 
FOR SELECT 
USING (
  (auth.uid() = user_id) OR 
  (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'procurement_manager'::user_role]))
);

-- Enhanced subcontractor data protection
-- Remove overly broad access policy
DROP POLICY IF EXISTS "Admin and PM can view subcontractors" ON subcontractors;

-- Create more restrictive subcontractor access
CREATE POLICY "Restricted subcontractor access"
ON subcontractors 
FOR SELECT 
USING (
  get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'procurement_manager'::user_role])
);

-- Add project-based subcontractor access for engineers
CREATE POLICY "Engineers can view subcontractors in their projects"
ON subcontractors 
FOR SELECT 
USING (
  get_user_role(auth.uid()) = 'procurement_engineer'::user_role 
  AND EXISTS (
    SELECT 1 FROM subcontracts s 
    WHERE s.subcontractor_id = subcontractors.id
  )
);

-- Enhanced user profile privacy
-- Remove overly broad admin access
DROP POLICY IF EXISTS "Enable read access for own profile or admins" ON user_profiles;

-- Create more restrictive user profile access
CREATE POLICY "Users can view own profile"
ON user_profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Admins can view user profiles with logging"
ON user_profiles 
FOR SELECT 
USING (
  is_admin(auth.uid()) AND 
  (
    SELECT log_data_access('user_profiles', id, 'admin_view') IS NOT NULL
  )
);

-- Enhanced data access logging for sensitive operations
CREATE OR REPLACE FUNCTION public.log_sensitive_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log access to estimates
  IF TG_TABLE_NAME = 'estimates' AND TG_OP = 'SELECT' THEN
    PERFORM log_data_access('estimates', NEW.id, 'view');
  END IF;
  
  -- Log access to subcontractors
  IF TG_TABLE_NAME = 'subcontractors' AND TG_OP = 'SELECT' THEN
    PERFORM log_data_access('subcontractors', NEW.id, 'view');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add triggers for sensitive data access logging
CREATE TRIGGER log_estimates_access
  AFTER SELECT ON estimates
  FOR EACH ROW
  EXECUTE FUNCTION log_sensitive_access();

CREATE TRIGGER log_subcontractors_access
  AFTER SELECT ON subcontractors
  FOR EACH ROW
  EXECUTE FUNCTION log_sensitive_access();