-- Create a function to send alert notifications via HTTP
CREATE OR REPLACE FUNCTION public.send_alert_email_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  project_name TEXT;
  subcontractor_name TEXT;
  notification_payload JSONB;
BEGIN
  -- Get project and subcontractor names
  SELECT p.name INTO project_name 
  FROM projects p 
  WHERE p.id = NEW.project_id;
  
  SELECT s.company_name INTO subcontractor_name 
  FROM subcontractors s 
  WHERE s.id = NEW.subcontractor_id;

  -- Build notification payload
  notification_payload := jsonb_build_object(
    'alertId', NEW.id,
    'type', NEW.type,
    'title', NEW.title,
    'message', NEW.message,
    'totalAmount', NEW.total_amount,
    'thresholdAmount', NEW.threshold_amount,
    'projectName', project_name,
    'subcontractorName', subcontractor_name
  );

  -- Use pg_notify to trigger email sending
  PERFORM pg_notify('send_alert_email', notification_payload::text);
  
  RETURN NEW;
END;
$function$;

-- Create trigger to send email notifications when alerts are created
DROP TRIGGER IF EXISTS send_alert_email_trigger ON alerts;
CREATE TRIGGER send_alert_email_trigger
  AFTER INSERT ON alerts
  FOR EACH ROW
  EXECUTE FUNCTION send_alert_email_notification();