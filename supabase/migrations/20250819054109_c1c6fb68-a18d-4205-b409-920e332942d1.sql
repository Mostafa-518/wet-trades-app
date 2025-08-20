-- Fix security warning by setting search_path for the function
DROP FUNCTION IF EXISTS public.send_alert_notification();

-- Create a simpler approach - just log that an alert was created
-- The actual email sending will be handled by the application
CREATE OR REPLACE FUNCTION public.log_alert_creation()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log the alert creation for audit purposes
  INSERT INTO public.data_access_logs (
    user_id, 
    accessed_table, 
    accessed_entity_id, 
    access_type, 
    user_role,
    additional_context
  ) VALUES (
    auth.uid(),
    'alerts',
    NEW.id,
    'alert_created',
    get_user_role(auth.uid()),
    jsonb_build_object(
      'alert_type', NEW.type,
      'alert_title', NEW.title,
      'project_id', NEW.project_id,
      'subcontractor_id', NEW.subcontractor_id,
      'total_amount', NEW.total_amount
    )
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't block alert creation if logging fails
    RETURN NEW;
END;
$$;

-- Update trigger to use the new function
DROP TRIGGER IF EXISTS trigger_send_alert_notification ON public.alerts;
CREATE TRIGGER trigger_log_alert_creation
  AFTER INSERT ON public.alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.log_alert_creation();