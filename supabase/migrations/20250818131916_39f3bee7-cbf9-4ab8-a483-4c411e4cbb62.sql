-- Critical Security Fixes: Data Access Controls and Function Hardening

-- 1. RESTRICT PROJECT VISIBILITY - Only authenticated users with proper roles can view projects
DROP POLICY IF EXISTS "Authenticated users can view all projects" ON public.projects;
CREATE POLICY "Role-based project access" 
ON public.projects 
FOR SELECT 
USING (
  CASE 
    WHEN get_user_role(auth.uid()) IN ('admin', 'procurement_manager') THEN true
    WHEN get_user_role(auth.uid()) = 'procurement_engineer' THEN true -- Engineers can view projects
    ELSE false -- Viewers cannot see project details
  END
);

-- 2. SECURE CONTRACT DATA - Restrict subcontract access to authorized roles only
DROP POLICY IF EXISTS "Authenticated users can view all subcontracts" ON public.subcontracts;
CREATE POLICY "Role-based subcontract access" 
ON public.subcontracts 
FOR SELECT 
USING (
  get_user_role(auth.uid()) IN ('admin', 'procurement_manager', 'procurement_engineer')
);

-- 3. LOCK DOWN FINANCIAL INFORMATION - Restrict trade item pricing to managers only
DROP POLICY IF EXISTS "Authenticated users can view all subcontract trade items" ON public.subcontract_trade_items;
CREATE POLICY "Manager-only trade item access" 
ON public.subcontract_trade_items 
FOR SELECT 
USING (
  get_user_role(auth.uid()) IN ('admin', 'procurement_manager')
);

-- 4. SECURE TRADE ITEMS - Engineers and above can view but financial details restricted
DROP POLICY IF EXISTS "Authenticated users can view all trade items" ON public.trade_items;
CREATE POLICY "Role-based trade items access" 
ON public.trade_items 
FOR SELECT 
USING (
  get_user_role(auth.uid()) IN ('admin', 'procurement_manager', 'procurement_engineer')
);

-- 5. SECURE SUBCONTRACTORS - Only managers can view subcontractor details
-- This is already restricted correctly - keeping existing policy

-- 6. FIX DATABASE FUNCTION SECURITY - Add search_path protection
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
 RETURNS user_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role FROM public.user_profiles WHERE id = user_id;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'viewer',
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Failed to create user profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;

-- 7. ENHANCE AUDIT SECURITY - Create audit trail for data access attempts
CREATE TABLE IF NOT EXISTS public.data_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  accessed_table text NOT NULL,
  accessed_entity_id uuid,
  access_type text NOT NULL, -- 'read', 'write', 'delete'
  user_role user_role,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on access logs
ALTER TABLE public.data_access_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view access logs
CREATE POLICY "Admin only access logs" 
ON public.data_access_logs 
FOR ALL 
USING (is_admin(auth.uid()));

-- 8. ADD SECURITY MONITORING FUNCTIONS
CREATE OR REPLACE FUNCTION public.log_data_access(
  table_name text,
  entity_id uuid DEFAULT NULL,
  access_type text DEFAULT 'read'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.data_access_logs (
    user_id, 
    accessed_table, 
    accessed_entity_id, 
    access_type, 
    user_role
  ) VALUES (
    auth.uid(),
    table_name,
    entity_id,
    access_type,
    get_user_role(auth.uid())
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Don't block operations if logging fails
    NULL;
END;
$function$;