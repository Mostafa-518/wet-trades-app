-- 1) Audit logs table
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null check (action in ('insert','update','delete')),
  entity text not null,
  entity_id uuid,
  before_snapshot jsonb,
  after_snapshot jsonb,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.audit_logs enable row level security;

-- Policies: authenticated can read; only security definer functions insert
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='audit_logs' and policyname='Authenticated can read audit logs'
  ) then
    create policy "Authenticated can read audit logs"
    on public.audit_logs for select
    to authenticated
    using (true);
  end if;
end $$;

-- 2) Trigger function to write audit logs
create or replace function public.log_audit_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_action text;
  v_before jsonb;
  v_after jsonb;
  v_entity text := TG_TABLE_NAME;
  v_entity_id uuid;
begin
  if TG_OP = 'INSERT' then
    v_action := 'insert';
    v_after := to_jsonb(NEW);
    v_entity_id := NEW.id;
  elsif TG_OP = 'UPDATE' then
    v_action := 'update';
    v_before := to_jsonb(OLD);
    v_after := to_jsonb(NEW);
    v_entity_id := NEW.id;
  elsif TG_OP = 'DELETE' then
    v_action := 'delete';
    v_before := to_jsonb(OLD);
    v_entity_id := OLD.id;
  end if;

  insert into public.audit_logs (user_id, action, entity, entity_id, before_snapshot, after_snapshot)
  values (auth.uid(), v_action, v_entity, v_entity_id, coalesce(v_before, '{}'::jsonb), coalesce(v_after, '{}'::jsonb));

  if TG_OP = 'DELETE' then
    return OLD;
  else
    return NEW;
  end if;
end;
$$;

-- 3) Attach triggers to key tables
-- Helper DO block to avoid duplicate trigger errors
DO $$
BEGIN
  -- subcontracts
  if not exists (select 1 from pg_trigger where tgname = 'tr_audit_subcontracts') then
    create trigger tr_audit_subcontracts
    after insert or update or delete on public.subcontracts
    for each row execute function public.log_audit_change();
  end if;

  -- subcontract_trade_items
  if not exists (select 1 from pg_trigger where tgname = 'tr_audit_subcontract_trade_items') then
    create trigger tr_audit_subcontract_trade_items
    after insert or update or delete on public.subcontract_trade_items
    for each row execute function public.log_audit_change();
  end if;

  -- subcontract_responsibilities
  if not exists (select 1 from pg_trigger where tgname = 'tr_audit_subcontract_responsibilities') then
    create trigger tr_audit_subcontract_responsibilities
    after insert or update or delete on public.subcontract_responsibilities
    for each row execute function public.log_audit_change();
  end if;

  -- projects
  if not exists (select 1 from pg_trigger where tgname = 'tr_audit_projects') then
    create trigger tr_audit_projects
    after insert or update or delete on public.projects
    for each row execute function public.log_audit_change();
  end if;

  -- subcontractors
  if not exists (select 1 from pg_trigger where tgname = 'tr_audit_subcontractors') then
    create trigger tr_audit_subcontractors
    after insert or update or delete on public.subcontractors
    for each row execute function public.log_audit_change();
  end if;
END$$;

-- 4) Admin-only undo function for subcontracts
create or replace function public.admin_undo_subcontract(p_log_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
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
    INSERT INTO public.subcontracts (
      id, parent_subcontract_id, project_id, subcontractor_id, status, total_value,
      start_date, created_at, updated_at, date_of_issuing, end_date,
      addendum_number, description, contract_number, contract_type, pdf_url
    ) VALUES (
      (before->>'id')::uuid,
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
  END IF;
END;
$$;