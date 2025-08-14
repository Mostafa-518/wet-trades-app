
-- Drop the existing trigger first
DROP TRIGGER IF EXISTS trigger_check_subcontractor_amounts ON subcontracts;

-- Update the function to only create alerts, not prevent operations
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
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER trigger_check_subcontractor_amounts
  AFTER INSERT OR UPDATE OF total_value, project_id, subcontractor_id
  ON subcontracts
  FOR EACH ROW
  EXECUTE FUNCTION check_subcontractor_amounts();
