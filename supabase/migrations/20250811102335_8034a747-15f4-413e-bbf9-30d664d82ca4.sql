-- Create enums
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estimate_status') THEN
    CREATE TYPE public.estimate_status AS ENUM ('draft', 'final');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estimate_line_type') THEN
    CREATE TYPE public.estimate_line_type AS ENUM ('material', 'labor', 'equipment', 'overhead');
  END IF;
END $$;

-- Helper function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- estimates table
CREATE TABLE IF NOT EXISTS public.estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  project_id uuid NULL REFERENCES public.projects(id) ON DELETE SET NULL,
  trade_id uuid NULL REFERENCES public.trades(id) ON DELETE SET NULL,
  item_name text NOT NULL,
  unit text NOT NULL,
  specs text NULL,
  location text NULL,
  quantity numeric NULL,
  currency text NOT NULL DEFAULT 'EGP',
  inflation_ref_month date NULL,
  market_factor numeric NOT NULL DEFAULT 1.0,
  ai_rate numeric NULL,
  ai_confidence numeric NULL,
  ai_notes text NULL,
  source_item_ids uuid[] NULL,
  final_rate numeric NULL,
  status public.estimate_status NOT NULL DEFAULT 'draft'
);

-- estimate_line_items table
CREATE TABLE IF NOT EXISTS public.estimate_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  estimate_id uuid NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
  type public.estimate_line_type NOT NULL,
  name text NOT NULL,
  unit text NULL,
  qty numeric NULL,
  unit_price numeric NULL,
  total_price numeric NULL,
  source_ref text NULL
);

-- estimate_feedback table (thumbs + reason)
CREATE TABLE IF NOT EXISTS public.estimate_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  estimate_id uuid NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rating text NOT NULL CHECK (rating IN ('up','down')),
  reason text NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_estimates_created_at ON public.estimates (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_estimates_trade ON public.estimates (trade_id);
CREATE INDEX IF NOT EXISTS idx_estimates_project ON public.estimates (project_id);
CREATE INDEX IF NOT EXISTS idx_estimates_user ON public.estimates (user_id);
CREATE INDEX IF NOT EXISTS idx_estimates_source_items_gin ON public.estimates USING gin (source_item_ids);

CREATE INDEX IF NOT EXISTS idx_line_items_estimate ON public.estimate_line_items (estimate_id);
CREATE INDEX IF NOT EXISTS idx_feedback_estimate ON public.estimate_feedback (estimate_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON public.estimate_feedback (user_id);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trg_estimates_updated_at ON public.estimates;
CREATE TRIGGER trg_estimates_updated_at
BEFORE UPDATE ON public.estimates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_estimate_line_items_updated_at ON public.estimate_line_items;
CREATE TRIGGER trg_estimate_line_items_updated_at
BEFORE UPDATE ON public.estimate_line_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_feedback ENABLE ROW LEVEL SECURITY;

-- RLS policies for estimates
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'estimates' AND policyname = 'Authenticated users can view estimates'
  ) THEN
    CREATE POLICY "Authenticated users can view estimates"
    ON public.estimates
    FOR SELECT
    USING (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'estimates' AND policyname = 'Users can insert their own estimates or Admin/PM any'
  ) THEN
    CREATE POLICY "Users can insert their own estimates or Admin/PM any"
    ON public.estimates
    FOR INSERT
    WITH CHECK (
      (auth.uid() = user_id)
      OR (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'procurement_manager'::user_role]))
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'estimates' AND policyname = 'Users can update own estimates or Admin/PM any'
  ) THEN
    CREATE POLICY "Users can update own estimates or Admin/PM any"
    ON public.estimates
    FOR UPDATE
    USING (
      (auth.uid() = user_id)
      OR (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'procurement_manager'::user_role]))
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'estimates' AND policyname = 'Admin/PM can delete estimates'
  ) THEN
    CREATE POLICY "Admin/PM can delete estimates"
    ON public.estimates
    FOR DELETE
    USING (
      (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'procurement_manager'::user_role]))
    );
  END IF;
END $$;

-- RLS policies for estimate_line_items depend on parent estimate ownership/role
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'estimate_line_items' AND policyname = 'Read line items for accessible estimates'
  ) THEN
    CREATE POLICY "Read line items for accessible estimates"
    ON public.estimate_line_items
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.estimates e
        WHERE e.id = estimate_id
          AND (
            auth.role() = 'authenticated' AND (
              e.user_id = auth.uid()
              OR get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'procurement_manager'::user_role])
            )
          )
      )
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'estimate_line_items' AND policyname = 'Insert line items for accessible estimates'
  ) THEN
    CREATE POLICY "Insert line items for accessible estimates"
    ON public.estimate_line_items
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.estimates e
        WHERE e.id = estimate_id
          AND (
            e.user_id = auth.uid()
            OR get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'procurement_manager'::user_role])
          )
      )
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'estimate_line_items' AND policyname = 'Update line items for accessible estimates'
  ) THEN
    CREATE POLICY "Update line items for accessible estimates"
    ON public.estimate_line_items
    FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM public.estimates e
        WHERE e.id = estimate_id
          AND (
            e.user_id = auth.uid()
            OR get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'procurement_manager'::user_role])
          )
      )
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'estimate_line_items' AND policyname = 'Delete line items for accessible estimates'
  ) THEN
    CREATE POLICY "Delete line items for accessible estimates"
    ON public.estimate_line_items
    FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM public.estimates e
        WHERE e.id = estimate_id
          AND (
            e.user_id = auth.uid()
            OR get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'procurement_manager'::user_role])
          )
      )
    );
  END IF;
END $$;

-- RLS policies for estimate_feedback
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'estimate_feedback' AND policyname = 'Authenticated read feedback'
  ) THEN
    CREATE POLICY "Authenticated read feedback"
    ON public.estimate_feedback
    FOR SELECT
    USING (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'estimate_feedback' AND policyname = 'Insert own feedback'
  ) THEN
    CREATE POLICY "Insert own feedback"
    ON public.estimate_feedback
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'estimate_feedback' AND policyname = 'Admins can delete feedback'
  ) THEN
    CREATE POLICY "Admins can delete feedback"
    ON public.estimate_feedback
    FOR DELETE
    USING (is_admin(auth.uid()));
  END IF;
END $$;

-- Optional: Audit triggers (log inserts/deletes)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_estimates_ins'
  ) THEN
    CREATE TRIGGER trg_audit_estimates_ins
    AFTER INSERT ON public.estimates
    FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_estimates_del'
  ) THEN
    CREATE TRIGGER trg_audit_estimates_del
    AFTER DELETE ON public.estimates
    FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_estimate_line_items_ins'
  ) THEN
    CREATE TRIGGER trg_audit_estimate_line_items_ins
    AFTER INSERT ON public.estimate_line_items
    FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_estimate_line_items_del'
  ) THEN
    CREATE TRIGGER trg_audit_estimate_line_items_del
    AFTER DELETE ON public.estimate_line_items
    FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();
  END IF;
END $$;