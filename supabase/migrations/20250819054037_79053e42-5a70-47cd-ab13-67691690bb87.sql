-- Create function to send alert notifications
CREATE OR REPLACE FUNCTION public.send_alert_notification()
RETURNS TRIGGER AS $$
DECLARE
  project_name TEXT;
  subcontractor_name TEXT;
BEGIN
  -- Get project name if project_id exists
  IF NEW.project_id IS NOT NULL THEN
    SELECT name INTO project_name FROM public.projects WHERE id = NEW.project_id;
  END IF;
  
  -- Get subcontractor name if subcontractor_id exists
  IF NEW.subcontractor_id IS NOT NULL THEN
    SELECT company_name INTO subcontractor_name FROM public.subcontractors WHERE id = NEW.subcontractor_id;
  END IF;
  
  -- Call the edge function to send email notifications
  -- This will be called asynchronously to avoid blocking the insert
  PERFORM
    net.http_post(
      url := (SELECT CONCAT(current_setting('app.settings.supabase_url'), '/functions/v1/send-alert-notification')),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', CONCAT('Bearer ', current_setting('app.settings.service_role_key'))
      ),
      body := jsonb_build_object(
        'alertId', NEW.id::text,
        'type', NEW.type,
        'title', NEW.title,
        'message', NEW.message,
        'totalAmount', NEW.total_amount,
        'thresholdAmount', NEW.threshold_amount,
        'projectName', project_name,
        'subcontractorName', subcontractor_name
      )
    );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block the alert creation
    INSERT INTO public.system_errors (error_message, context, user_id)
    VALUES (SQLERRM, 'send_alert_notification trigger', auth.uid());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically send notifications when alerts are created
DROP TRIGGER IF EXISTS trigger_send_alert_notification ON public.alerts;
CREATE TRIGGER trigger_send_alert_notification
  AFTER INSERT ON public.alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.send_alert_notification();