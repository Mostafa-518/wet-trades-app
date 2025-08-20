-- Create a function that makes HTTP requests to send emails
CREATE EXTENSION IF NOT EXISTS http;

-- Create a function to call the edge function directly
CREATE OR REPLACE FUNCTION public.call_send_alert_notification(alert_data JSONB)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  edge_function_url TEXT;
  response_data TEXT;
BEGIN
  -- Edge function URL
  edge_function_url := 'https://mcjdeqfqbucfterqzglp.supabase.co/functions/v1/send-alert-notification';
  
  -- Make HTTP POST request to edge function
  SELECT content INTO response_data
  FROM http((
    'POST',
    edge_function_url,
    ARRAY[
      http_header('Content-Type', 'application/json'),
      http_header('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true))
    ],
    'application/json',
    alert_data::text
  )::http_request);
  
  -- Log the response for debugging
  RAISE NOTICE 'Email notification response: %', response_data;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE NOTICE 'Failed to send email notification: %', SQLERRM;
END;
$function$;

-- Update the email notification trigger to call the edge function directly
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

  -- Call the edge function directly
  PERFORM call_send_alert_notification(notification_payload);
  
  RETURN NEW;
END;
$function$;