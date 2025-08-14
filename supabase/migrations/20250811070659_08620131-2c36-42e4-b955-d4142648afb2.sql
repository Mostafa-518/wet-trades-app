-- Restrict audit logging to only INSERT/DELETE for specific entities
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
  if v_entity not in ('subcontracts','projects','subcontractors','trades','trade_items') then
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

-- Ensure triggers exist only for allowed tables and only for INSERT/DELETE
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