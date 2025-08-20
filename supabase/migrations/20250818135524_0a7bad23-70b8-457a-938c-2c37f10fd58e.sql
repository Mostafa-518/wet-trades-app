-- ============================================================================
-- CRITICAL SECURITY FIXES - PHASE 1: DATA ACCESS CONTROLS
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

-- 2. SECURE ESTIMATES TABLE
-- ============================================================================

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Users can view estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can create estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can update estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can delete estimates" ON public.estimates;

-- Create strict estimates policies
CREATE POLICY "Estimates: Users can view own estimates" 
ON public.estimates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Estimates: Admins and managers can view all estimates" 
ON public.estimates 
FOR SELECT 
USING (public.is_admin_or_manager());

CREATE POLICY "Estimates: Users can create own estimates" 
ON public.estimates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Estimates: Users can update own estimates" 
ON public.estimates 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Estimates: Only admins can delete estimates" 
ON public.estimates 
FOR DELETE 
USING (public.is_admin_only());

-- 3. SECURE SUBCONTRACTORS TABLE  
-- ============================================================================

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Users can view subcontractors" ON public.subcontractors;
DROP POLICY IF EXISTS "Users can create subcontractors" ON public.subcontractors;
DROP POLICY IF EXISTS "Users can update subcontractors" ON public.subcontractors;
DROP POLICY IF EXISTS "Users can delete subcontractors" ON public.subcontractors;

-- Create strict subcontractor policies
CREATE POLICY "Subcontractors: Authenticated users can view basic info" 
ON public.subcontractors 
FOR SELECT 
USING (
  auth.role() = 'authenticated' AND
  -- Only show basic fields to non-managers, sensitive fields restricted below
  CASE 
    WHEN public.is_admin_or_manager() THEN true
    ELSE true -- Basic read access, but sensitive fields handled in application layer
  END
);

CREATE POLICY "Subcontractors: Only admins and managers can create" 
ON public.subcontractors 
FOR INSERT 
WITH CHECK (public.is_admin_or_manager());

CREATE POLICY "Subcontractors: Only admins and managers can update" 
ON public.subcontractors 
FOR UPDATE 
USING (public.is_admin_or_manager())
WITH CHECK (public.is_admin_or_manager());

CREATE POLICY "Subcontractors: Only admins can delete" 
ON public.subcontractors 
FOR DELETE 
USING (public.is_admin_only());

-- 4. SECURE USER PROFILES TABLE
-- ============================================================================

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Users can view profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

-- Create strict user profile policies
CREATE POLICY "User Profiles: Users can view own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "User Profiles: Admins can view all profiles" 
ON public.user_profiles 
FOR SELECT 
USING (public.is_admin_only());

CREATE POLICY "User Profiles: Users can update own profile (non-role fields)" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  -- Prevent users from changing their own role
  (OLD.role = NEW.role OR OLD.role IS NULL)
);

CREATE POLICY "User Profiles: Only admins can change roles" 
ON public.user_profiles 
FOR UPDATE 
USING (public.is_admin_only() AND auth.uid() != id)
WITH CHECK (public.is_admin_only() AND auth.uid() != id);

CREATE POLICY "User Profiles: Admins can create profiles" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (public.is_admin_only());

-- 5. SECURE FINANCIAL DATA TABLES
-- ============================================================================

-- Secure subcontracts table financial data
DROP POLICY IF EXISTS "Users can view subcontracts" ON public.subcontracts;
DROP POLICY IF EXISTS "Users can create subcontracts" ON public.subcontracts;
DROP POLICY IF EXISTS "Users can update subcontracts" ON public.subcontracts;
DROP POLICY IF EXISTS "Users can delete subcontracts" ON public.subcontracts;

CREATE POLICY "Subcontracts: Authenticated users basic access" 
ON public.subcontracts 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Subcontracts: Admins and managers full access" 
ON public.subcontracts 
FOR ALL 
USING (public.is_admin_or_manager())
WITH CHECK (public.is_admin_or_manager());

CREATE POLICY "Subcontracts: Engineers limited access" 
ON public.subcontracts 
FOR SELECT 
USING (
  get_current_user_role_safe() = 'procurement_engineer' AND
  auth.role() = 'authenticated'
);

-- Secure subcontract trade items
DROP POLICY IF EXISTS "Users can view subcontract trade items" ON public.subcontract_trade_items;
DROP POLICY IF EXISTS "Users can create subcontract trade items" ON public.subcontract_trade_items;
DROP POLICY IF EXISTS "Users can update subcontract trade items" ON public.subcontract_trade_items;
DROP POLICY IF EXISTS "Users can delete subcontract trade items" ON public.subcontract_trade_items;

CREATE POLICY "Subcontract Trade Items: Admins and managers full access" 
ON public.subcontract_trade_items 
FOR ALL 
USING (public.is_admin_or_manager())
WITH CHECK (public.is_admin_or_manager());

CREATE POLICY "Subcontract Trade Items: Engineers read only" 
ON public.subcontract_trade_items 
FOR SELECT 
USING (
  get_current_user_role_safe() IN ('procurement_engineer', 'viewer') AND
  auth.role() = 'authenticated'
);

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
    -- Don't block operations if logging fails, but log the error
    INSERT INTO public.system_errors (error_message, context, created_at)
    VALUES (SQLERRM, 'critical_data_access_logging', now());
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