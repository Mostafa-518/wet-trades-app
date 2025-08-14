
-- Create alerts table to store system alerts
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'subcontractor_limit_exceeded',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id),
  subcontractor_id UUID REFERENCES public.subcontractors(id),
  total_amount NUMERIC,
  threshold_amount NUMERIC DEFAULT 5000000, -- 5M EGP
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_dismissed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing alerts (all authenticated users can view)
CREATE POLICY "Authenticated users can view alerts" 
  ON public.alerts 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Create policy for updating alerts (mark as read/dismissed)
CREATE POLICY "Authenticated users can update alerts" 
  ON public.alerts 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Create function to check subcontractor amounts and create alerts
CREATE OR REPLACE FUNCTION check_subcontractor_amounts()
RETURNS TRIGGER AS $$
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
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on subcontracts table
CREATE TRIGGER trigger_check_subcontractor_amounts
  AFTER INSERT OR UPDATE OF total_value, project_id, subcontractor_id
  ON subcontracts
  FOR EACH ROW
  EXECUTE FUNCTION check_subcontractor_amounts();

-- Create index for better performance
CREATE INDEX idx_alerts_project_subcontractor ON alerts(project_id, subcontractor_id, type);
CREATE INDEX idx_alerts_unread ON alerts(is_read, is_dismissed, created_at);
