-- 1) Update audit logging to include subcontract_trade_items and subcontract_responsibilities
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

  insert into public.audit_logs (user_id, action, entity, entity_id, before_snapshot, after_snapshot)
  values (auth.uid(), v_action, v_entity, v_entity_id, coalesce(v_before, '{}'::jsonb), coalesce(v_after, '{}'::jsonb));

  if TG_OP = 'DELETE' then
    return OLD;
  else
    return NEW;
  end if;
end;
$function$;

-- Ensure triggers exist for all allowed tables (only INSERT/DELETE)
DROP TRIGGER IF EXISTS trg_audit_subcontracts ON public.subcontracts;
CREATE TRIGGER trg_audit_subcontracts
AFTER INSERT OR DELETE ON public.subcontracts
FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

DROP TRIGGER IF EXISTS trg_audit_projects ON public.projects;
CREATE TRIGGER trg_audit_projects
AFTER INSERT OR DELETE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

DROP TRIGGER IF EXISTS trg_audit_subcontractors ON public.subcontractors;
CREATE TRIGGER trg_audit_subcontractors
AFTER INSERT OR DELETE ON public.subcontractors
FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

DROP TRIGGER IF EXISTS trg_audit_trades ON public.trades;
CREATE TRIGGER trg_audit_trades
AFTER INSERT OR DELETE ON public.trades
FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

DROP TRIGGER IF EXISTS trg_audit_trade_items ON public.trade_items;
CREATE TRIGGER trg_audit_trade_items
AFTER INSERT OR DELETE ON public.trade_items
FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

-- New: triggers for subcontract_trade_items and subcontract_responsibilities
DROP TRIGGER IF EXISTS trg_audit_subcontract_trade_items ON public.subcontract_trade_items;
CREATE TRIGGER trg_audit_subcontract_trade_items
AFTER INSERT OR DELETE ON public.subcontract_trade_items
FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

DROP TRIGGER IF EXISTS trg_audit_subcontract_responsibilities ON public.subcontract_responsibilities;
CREATE TRIGGER trg_audit_subcontract_responsibilities
AFTER INSERT OR DELETE ON public.subcontract_responsibilities
FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

-- 2) Enhance admin_undo_subcontract to restore related items/responsibilities when undoing a DELETE
CREATE OR REPLACE FUNCTION public.admin_undo_subcontract(p_log_id uuid)
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
  rec_item record;
BEGIN
  -- Require admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can undo actions';
  END IF;

  SELECT * INTO rec FROM public.audit_logs WHERE id = p_log_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Audit log not found';
  END IF;
  IF rec.entity <> 'subcontracts' THEN
    RAISE EXCEPTION 'This undo function only supports subcontracts';
  END IF;

  before := rec.before_snapshot;
  after := rec.after_snapshot;

  IF rec.action = 'insert' THEN
    -- Delete the inserted row
    target_id := (after->>'id')::uuid;
    DELETE FROM public.subcontracts WHERE id = target_id;

  ELSIF rec.action = 'update' THEN
    -- Revert to previous values
    target_id := (after->>'id')::uuid;
    UPDATE public.subcontracts SET
      contract_number       = NULLIF(before->>'contract_number',''),
      project_id            = NULLIF(before->>'project_id','')::uuid,
      subcontractor_id      = NULLIF(before->>'subcontractor_id','')::uuid,
      status                = COALESCE((before->>'status')::subcontract_status, status),
      total_value           = NULLIF(before->>'total_value','')::numeric,
      start_date            = NULLIF(before->>'start_date','')::date,
      end_date              = NULLIF(before->>'end_date','')::date,
      date_of_issuing       = NULLIF(before->>'date_of_issuing','')::date,
      description           = before->>'description',
      contract_type         = COALESCE(before->>'contract_type', contract_type),
      addendum_number       = NULLIF(before->>'addendum_number',''),
      parent_subcontract_id = NULLIF(before->>'parent_subcontract_id','')::uuid,
      pdf_url               = NULLIF(before->>'pdf_url',''),
      updated_at            = now()
    WHERE id = target_id;

  ELSIF rec.action = 'delete' THEN
    -- Recreate the deleted row
    target_id := (before->>'id')::uuid;
    INSERT INTO public.subcontracts (
      id, parent_subcontract_id, project_id, subcontractor_id, status, total_value,
      start_date, created_at, updated_at, date_of_issuing, end_date,
      addendum_number, description, contract_number, contract_type, pdf_url
    ) VALUES (
      target_id,
      NULLIF(before->>'parent_subcontract_id','')::uuid,
      NULLIF(before->>'project_id','')::uuid,
      NULLIF(before->>'subcontractor_id','')::uuid,
      (before->>'status')::subcontract_status,
      NULLIF(before->>'total_value','')::numeric,
      NULLIF(before->>'start_date','')::date,
      COALESCE((before->>'created_at')::timestamptz, now()),
      now(),
      NULLIF(before->>'date_of_issuing','')::date,
      NULLIF(before->>'end_date','')::date,
      NULLIF(before->>'addendum_number',''),
      before->>'description',
      NULLIF(before->>'contract_number',''),
      COALESCE(before->>'contract_type','subcontract'),
      NULLIF(before->>'pdf_url','')
    ) ON CONFLICT (id) DO UPDATE SET
      parent_subcontract_id = EXCLUDED.parent_subcontract_id,
      project_id            = EXCLUDED.project_id,
      subcontractor_id      = EXCLUDED.subcontractor_id,
      status                = EXCLUDED.status,
      total_value           = EXCLUDED.total_value,
      start_date            = EXCLUDED.start_date,
      updated_at            = now(),
      date_of_issuing       = EXCLUDED.date_of_issuing,
      end_date              = EXCLUDED.end_date,
      addendum_number       = EXCLUDED.addendum_number,
      description           = EXCLUDED.description,
      contract_number       = EXCLUDED.contract_number,
      contract_type         = EXCLUDED.contract_type,
      pdf_url               = EXCLUDED.pdf_url;

    -- Restore related trade items
    FOR rec_item IN
      SELECT before_snapshot FROM public.audit_logs
      WHERE entity = 'subcontract_trade_items'
        AND action = 'delete'
        AND before_snapshot->>'subcontract_id' = before->>'id'
    LOOP
      INSERT INTO public.subcontract_trade_items (
        id, subcontract_id, trade_item_id, quantity, unit_price, total_price, wastage_percentage, created_at
      ) VALUES (
        (rec_item.before_snapshot->>'id')::uuid,
        target_id,
        NULLIF(rec_item.before_snapshot->>'trade_item_id','')::uuid,
        NULLIF(rec_item.before_snapshot->>'quantity','')::numeric,
        NULLIF(rec_item.before_snapshot->>'unit_price','')::numeric,
        NULLIF(rec_item.before_snapshot->>'total_price','')::numeric,
        COALESCE(NULLIF(rec_item.before_snapshot->>'wastage_percentage','')::numeric, 0),
        COALESCE((rec_item.before_snapshot->>'created_at')::timestamptz, now())
      ) ON CONFLICT (id) DO UPDATE SET
        subcontract_id     = EXCLUDED.subcontract_id,
        trade_item_id      = EXCLUDED.trade_item_id,
        quantity           = EXCLUDED.quantity,
        unit_price         = EXCLUDED.unit_price,
        total_price        = EXCLUDED.total_price,
        wastage_percentage = EXCLUDED.wastage_percentage,
        created_at         = EXCLUDED.created_at;
    END LOOP;

    -- Restore related responsibilities
    FOR rec_item IN
      SELECT before_snapshot FROM public.audit_logs
      WHERE entity = 'subcontract_responsibilities'
        AND action = 'delete'
        AND before_snapshot->>'subcontract_id' = before->>'id'
    LOOP
      INSERT INTO public.subcontract_responsibilities (
        id, subcontract_id, responsibility_id, created_at
      ) VALUES (
        (rec_item.before_snapshot->>'id')::uuid,
        target_id,
        NULLIF(rec_item.before_snapshot->>'responsibility_id','')::uuid,
        COALESCE((rec_item.before_snapshot->>'created_at')::timestamptz, now())
      ) ON CONFLICT (id) DO UPDATE SET
        subcontract_id   = EXCLUDED.subcontract_id,
        responsibility_id = EXCLUDED.responsibility_id,
        created_at        = EXCLUDED.created_at;
    END LOOP;
  END IF;
END;
$function$;

-- 3) Allow admins to delete audit logs (selected or all) via RPCs and policy
CREATE OR REPLACE FUNCTION public.admin_delete_audit_logs(ids uuid[])
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  cnt integer := 0;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can delete audit logs';
  END IF;

  DELETE FROM public.audit_logs WHERE id = ANY(ids);
  GET DIAGNOSTICS cnt = ROW_COUNT;
  RETURN cnt;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_clear_audit_logs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  cnt integer := 0;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can clear audit logs';
  END IF;

  DELETE FROM public.audit_logs;
  GET DIAGNOSTICS cnt = ROW_COUNT;
  RETURN cnt;
END;
$function$;

-- Add DELETE policy for admins if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'audit_logs' AND policyname = 'Admins can delete audit logs'
  ) THEN
    CREATE POLICY "Admins can delete audit logs"
    ON public.audit_logs
    FOR DELETE
    USING (public.is_admin(auth.uid()));
  END IF;
END $$;