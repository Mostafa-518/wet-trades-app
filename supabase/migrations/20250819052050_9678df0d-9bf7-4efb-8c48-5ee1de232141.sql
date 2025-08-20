-- ============================================================================
-- CRITICAL SECURITY FIXES - PHASE 1: DATA ACCESS CONTROLS (FIXED)
-- ============================================================================

-- 1. CREATE SECURITY HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user is admin or procurement manager
CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'procurement_manager')
  );
$$;

-- Function to check if user is admin only
CREATE OR REPLACE FUNCTION public.is_admin_only()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- Function to get current user role safely
CREATE OR REPLACE FUNCTION public.get_current_user_role_safe()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(role::text, 'viewer') 
  FROM public.user_profiles 
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- 2. SECURE ESTIMATES TABLE (Already has good policies)
-- ============================================================================
-- The estimates table already has proper security policies, keeping them as is

-- 3. SECURE SUBCONTRACTORS TABLE  
-- ============================================================================

-- Drop existing permissive policies for subcontractors
DROP POLICY IF EXISTS "Engineers can view subcontractors in their projects" ON public.subcontractors;
DROP POLICY IF EXISTS "Restricted subcontractor access" ON public.subcontractors;

-- Create more restrictive subcontractor policies
CREATE POLICY "Subcontractors: Admins and managers full access" 
ON public.subcontractors 
FOR ALL 
USING (public.is_admin_or_manager())
WITH CHECK (public.is_admin_or_manager());

CREATE POLICY "Subcontractors: Engineers limited project access" 
ON public.subcontractors 
FOR SELECT 
USING (
  get_current_user_role_safe() = 'procurement_engineer' AND
  EXISTS (
    SELECT 1 FROM subcontracts s 
    WHERE s.subcontractor_id = subcontractors.id
  )
);

-- 4. SECURE USER PROFILES TABLE
-- ============================================================================

-- The user_profiles table already has good restrictive policies, keeping them

-- 5. ADD MISSING COLUMNS TO DATA_ACCESS_LOGS
-- ============================================================================

-- Add missing columns to data_access_logs table
ALTER TABLE public.data_access_logs 
ADD COLUMN IF NOT EXISTS additional_context jsonb DEFAULT '{}'::jsonb;

-- 6. ENHANCED DATA ACCESS LOGGING
-- ============================================================================

-- Improve the existing log_critical_data_access function
CREATE OR REPLACE FUNCTION public.log_critical_data_access(
  table_name text, 
  record_id text, 
  access_details jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Enhanced logging with user context
  INSERT INTO data_access_logs (
    user_id,
    accessed_table,
    accessed_entity_id,
    access_type,
    user_role,
    ip_address,
    user_agent,
    additional_context
  ) VALUES (
    auth.uid(),
    table_name,
    CASE 
      WHEN record_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
      THEN record_id::uuid 
      ELSE null 
    END,
    COALESCE(access_details->>'access_type', 'view'),
    get_user_role(auth.uid()),
    COALESCE(access_details->>'ip_address', 'unknown'),
    COALESCE(access_details->>'user_agent', 'unknown'),
    access_details
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Don't block operations if logging fails
    NULL;
END;
$$;

-- 7. CREATE SYSTEM ERRORS TABLE FOR BETTER ERROR TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.system_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  error_message text NOT NULL,
  context text,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on system errors
ALTER TABLE public.system_errors ENABLE ROW LEVEL SECURITY;

-- Only admins can view system errors
CREATE POLICY "System Errors: Admins only" 
ON public.system_errors 
FOR ALL 
USING (public.is_admin_only())
WITH CHECK (public.is_admin_only());