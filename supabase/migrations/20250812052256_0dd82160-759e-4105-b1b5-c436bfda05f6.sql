-- Create missing admin undo functions for proper TypeScript support
CREATE OR REPLACE FUNCTION public.admin_undo_project(p_log_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  rec audit_logs%rowtype;
  before jsonb;
  after jsonb;
  target_id uuid;
BEGIN
  -- Require admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can undo actions';
  END IF;

  SELECT * INTO rec FROM public.audit_logs WHERE id = p_log_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Audit log not found';
  END IF;
  IF rec.entity <> 'projects' THEN
    RAISE EXCEPTION 'This undo function only supports projects';
  END IF;

  before := rec.before_snapshot;
  after := rec.after_snapshot;

  IF rec.action = 'insert' THEN
    -- Delete the inserted row
    target_id := (after->>'id')::uuid;
    DELETE FROM public.projects WHERE id = target_id;

  ELSIF rec.action = 'update' THEN
    -- Revert to previous values
    target_id := (after->>'id')::uuid;
    UPDATE public.projects SET
      name = before->>'name',
      code = before->>'code',
      location = before->>'location',
      updated_at = now()
    WHERE id = target_id;

  ELSIF rec.action = 'delete' THEN
    -- Recreate the deleted row
    target_id := (before->>'id')::uuid;
    INSERT INTO public.projects (
      id, name, code, location, created_at, updated_at
    ) VALUES (
      target_id,
      before->>'name',
      before->>'code',
      before->>'location',
      COALESCE((before->>'created_at')::timestamptz, now()),
      now()
    ) ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      code = EXCLUDED.code,
      location = EXCLUDED.location,
      updated_at = now();
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_undo_subcontractor(p_log_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  rec audit_logs%rowtype;
  before jsonb;
  after jsonb;
  target_id uuid;
BEGIN
  -- Require admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can undo actions';
  END IF;

  SELECT * INTO rec FROM public.audit_logs WHERE id = p_log_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Audit log not found';
  END IF;
  IF rec.entity <> 'subcontractors' THEN
    RAISE EXCEPTION 'This undo function only supports subcontractors';
  END IF;

  before := rec.before_snapshot;
  after := rec.after_snapshot;

  IF rec.action = 'insert' THEN
    -- Delete the inserted row
    target_id := (after->>'id')::uuid;
    DELETE FROM public.subcontractors WHERE id = target_id;

  ELSIF rec.action = 'update' THEN
    -- Revert to previous values
    target_id := (after->>'id')::uuid;
    UPDATE public.subcontractors SET
      company_name = before->>'company_name',
      representative_name = before->>'representative_name',
      email = before->>'email',
      phone = before->>'phone',
      commercial_registration = before->>'commercial_registration',
      tax_card_no = before->>'tax_card_no',
      updated_at = now()
    WHERE id = target_id;

  ELSIF rec.action = 'delete' THEN
    -- Recreate the deleted row
    target_id := (before->>'id')::uuid;
    INSERT INTO public.subcontractors (
      id, company_name, representative_name, email, phone, 
      commercial_registration, tax_card_no, created_at, updated_at
    ) VALUES (
      target_id,
      before->>'company_name',
      before->>'representative_name',
      before->>'email',
      before->>'phone',
      before->>'commercial_registration',
      before->>'tax_card_no',
      COALESCE((before->>'created_at')::timestamptz, now()),
      now()
    ) ON CONFLICT (id) DO UPDATE SET
      company_name = EXCLUDED.company_name,
      representative_name = EXCLUDED.representative_name,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      commercial_registration = EXCLUDED.commercial_registration,
      tax_card_no = EXCLUDED.tax_card_no,
      updated_at = now();
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_undo_trade(p_log_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  rec audit_logs%rowtype;
  before jsonb;
  after jsonb;
  target_id uuid;
BEGIN
  -- Require admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can undo actions';
  END IF;

  SELECT * INTO rec FROM public.audit_logs WHERE id = p_log_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Audit log not found';
  END IF;
  IF rec.entity <> 'trades' THEN
    RAISE EXCEPTION 'This undo function only supports trades';
  END IF;

  before := rec.before_snapshot;
  after := rec.after_snapshot;

  IF rec.action = 'insert' THEN
    -- Delete the inserted row
    target_id := (after->>'id')::uuid;
    DELETE FROM public.trades WHERE id = target_id;

  ELSIF rec.action = 'update' THEN
    -- Revert to previous values
    target_id := (after->>'id')::uuid;
    UPDATE public.trades SET
      name = before->>'name',
      category = before->>'category',
      description = before->>'description',
      updated_at = now()
    WHERE id = target_id;

  ELSIF rec.action = 'delete' THEN
    -- Recreate the deleted row
    target_id := (before->>'id')::uuid;
    INSERT INTO public.trades (
      id, name, category, description, created_at, updated_at
    ) VALUES (
      target_id,
      before->>'name',
      before->>'category',
      before->>'description',
      COALESCE((before->>'created_at')::timestamptz, now()),
      now()
    ) ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      category = EXCLUDED.category,
      description = EXCLUDED.description,
      updated_at = now();
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_undo_trade_item(p_log_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  rec audit_logs%rowtype;
  before jsonb;
  after jsonb;
  target_id uuid;
BEGIN
  -- Require admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can undo actions';
  END IF;

  SELECT * INTO rec FROM public.audit_logs WHERE id = p_log_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Audit log not found';
  END IF;
  IF rec.entity <> 'trade_items' THEN
    RAISE EXCEPTION 'This undo function only supports trade_items';
  END IF;

  before := rec.before_snapshot;
  after := rec.after_snapshot;

  IF rec.action = 'insert' THEN
    -- Delete the inserted row
    target_id := (after->>'id')::uuid;
    DELETE FROM public.trade_items WHERE id = target_id;

  ELSIF rec.action = 'update' THEN
    -- Revert to previous values
    target_id := (after->>'id')::uuid;
    UPDATE public.trade_items SET
      name = before->>'name',
      description = before->>'description',
      unit = before->>'unit',
      trade_id = NULLIF(before->>'trade_id','')::uuid,
      updated_at = now()
    WHERE id = target_id;

  ELSIF rec.action = 'delete' THEN
    -- Recreate the deleted row
    target_id := (before->>'id')::uuid;
    INSERT INTO public.trade_items (
      id, name, description, unit, trade_id, created_at, updated_at
    ) VALUES (
      target_id,
      before->>'name',
      before->>'description',
      before->>'unit',
      NULLIF(before->>'trade_id','')::uuid,
      COALESCE((before->>'created_at')::timestamptz, now()),
      now()
    ) ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      unit = EXCLUDED.unit,
      trade_id = EXCLUDED.trade_id,
      updated_at = now();
  END IF;
END;
$function$;

-- SECURITY FIX: Replace the insecure RLS policies for subcontract_responsibilities
-- The current policies allow unrestricted access to all users, which exposes sensitive business contract data

-- Drop the existing insecure policies
DROP POLICY IF EXISTS "Enable delete for all users" ON public.subcontract_responsibilities;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.subcontract_responsibilities;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.subcontract_responsibilities;
DROP POLICY IF EXISTS "Enable update for all users" ON public.subcontract_responsibilities;

-- Create secure policies that restrict access based on user roles
-- Only Admin and Procurement Manager can modify subcontract responsibilities
CREATE POLICY "Admin/PM can modify subcontract responsibilities" 
ON public.subcontract_responsibilities 
FOR ALL 
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'procurement_manager'::user_role]));

-- All authenticated users can view subcontract responsibilities (read-only access for other roles)
CREATE POLICY "Authenticated users can view subcontract responsibilities" 
ON public.subcontract_responsibilities 
FOR SELECT 
USING (auth.role() = 'authenticated'::text);