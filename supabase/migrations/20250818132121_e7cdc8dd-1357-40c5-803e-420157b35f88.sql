-- Fix remaining function security issues - add search_path to all functions

CREATE OR REPLACE FUNCTION public.log_role_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_last_login()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.user_profiles 
  SET last_login = NOW(), updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't block login if this fails
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_role_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.check_subcontractor_amounts()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  project_subcontractor_total NUMERIC;
  existing_alert_id UUID;
  alert_title TEXT;
  alert_message TEXT;
BEGIN
  -- Calculate total amount for this subcontractor in this project
  SELECT COALESCE(SUM(s.total_value), 0)
  INTO project_subcontractor_total
  FROM subcontracts s
  WHERE s.project_id = NEW.project_id 
    AND s.subcontractor_id = NEW.subcontractor_id
    AND s.status != 'cancelled';

  -- Check if amount exceeds 5M EGP
  IF project_subcontractor_total > 5000000 THEN
    -- Check if alert already exists for this project-subcontractor combination
    SELECT id INTO existing_alert_id
    FROM alerts 
    WHERE project_id = NEW.project_id 
      AND subcontractor_id = NEW.subcontractor_id 
      AND type = 'subcontractor_limit_exceeded'
      AND is_dismissed = false;

    -- Prepare alert content
    SELECT 
      'Subcontractor Limit Exceeded',
      'Subcontractor ' || sc.company_name || ' has exceeded EGP 5M limit in project ' || p.name || ' with total amount of EGP ' || TO_CHAR(project_subcontractor_total, 'FM999,999,999.00')
    INTO alert_title, alert_message
    FROM subcontractors sc, projects p
    WHERE sc.id = NEW.subcontractor_id AND p.id = NEW.project_id;

    IF existing_alert_id IS NULL THEN
      -- Create new alert
      INSERT INTO alerts (
        type, title, message, project_id, subcontractor_id, 
        total_amount, threshold_amount
      ) VALUES (
        'subcontractor_limit_exceeded', 
        alert_title,
        alert_message,
        NEW.project_id, 
        NEW.subcontractor_id, 
        project_subcontractor_total, 
        5000000
      );
    ELSE
      -- Update existing alert with new amount
      UPDATE alerts 
      SET 
        total_amount = project_subcontractor_total,
        message = alert_message,
        updated_at = now(),
        is_read = false  -- Mark as unread since amount changed
      WHERE id = existing_alert_id;
    END IF;
  ELSE
    -- If amount is below threshold, dismiss any existing alerts
    UPDATE alerts 
    SET is_dismissed = true
    WHERE project_id = NEW.project_id 
      AND subcontractor_id = NEW.subcontractor_id 
      AND type = 'subcontractor_limit_exceeded'
      AND is_dismissed = false;
  END IF;

  -- ALWAYS return NEW to allow the operation to proceed
  RETURN NEW;
END;
$function$;

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