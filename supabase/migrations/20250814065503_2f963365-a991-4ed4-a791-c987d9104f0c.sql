-- Fix audit_logs security issue by adding proper RLS policies
-- Only administrators should be able to access audit logs

-- Enable RLS on audit_logs table if not already enabled
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to ensure clean state
DROP POLICY IF EXISTS "audit_logs_admin_access" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_select" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_update" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_delete" ON public.audit_logs;

-- Create comprehensive admin-only policies for audit logs
CREATE POLICY "audit_logs_admin_select" ON public.audit_logs
FOR SELECT 
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "audit_logs_admin_insert" ON public.audit_logs
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "audit_logs_admin_update" ON public.audit_logs
FOR UPDATE 
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "audit_logs_admin_delete" ON public.audit_logs
FOR DELETE 
TO authenticated
USING (public.is_admin(auth.uid()));

-- Also allow system inserts for the audit trigger (when auth.uid() is NULL)
CREATE POLICY "audit_logs_system_insert" ON public.audit_logs
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NULL OR public.is_admin(auth.uid()));

-- Update the audit trigger function to handle system inserts
CREATE OR REPLACE FUNCTION public.log_audit_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  v_action text;
  v_before jsonb;
  v_after jsonb;
  v_entity text := TG_TABLE_NAME;
  v_entity_id uuid;
  v_user_id uuid;
begin
  -- Only log for allowed entities
  if v_entity not in (
    'subcontracts',
    'projects',
    'subcontractors',
    'trades',
    'trade_items',
    'subcontract_trade_items',
    'subcontract_responsibilities'
  ) then
    if TG_OP = 'DELETE' then
      return OLD;
    else
      return NEW;
    end if;
  end if;

  -- Only log inserts and deletes
  if TG_OP = 'INSERT' then
    v_action := 'insert';
    v_after := to_jsonb(NEW);
    v_entity_id := NEW.id;
  elsif TG_OP = 'DELETE' then
    v_action := 'delete';
    v_before := to_jsonb(OLD);
    v_entity_id := OLD.id;
  else
    -- ignore updates
    return NEW;
  end if;

  -- Get current user ID, defaulting to NULL for system operations
  v_user_id := auth.uid();

  -- Insert audit log with elevated privileges (SECURITY DEFINER)
  insert into public.audit_logs (user_id, action, entity, entity_id, before_snapshot, after_snapshot)
  values (v_user_id, v_action, v_entity, v_entity_id, coalesce(v_before, '{}'::jsonb), coalesce(v_after, '{}'::jsonb));

  if TG_OP = 'DELETE' then
    return OLD;
  else
    return NEW;
  end if;
end;
$function$;