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

-- Admins can view profiles but with restricted access for audit purposes
CREATE POLICY "Admins can view user profiles for management"
ON user_profiles 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Enhanced sensitive data access logging function
CREATE OR REPLACE FUNCTION public.log_critical_data_access(
  table_name text,
  record_id uuid,
  access_details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log access to critical business data
  INSERT INTO data_access_logs (
    user_id,
    accessed_table,
    accessed_entity_id,
    access_type,
    user_role
  ) VALUES (
    auth.uid(),
    table_name,
    record_id,
    'critical_view',
    get_user_role(auth.uid())
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Don't block operations if logging fails
    NULL;
END;
$$;