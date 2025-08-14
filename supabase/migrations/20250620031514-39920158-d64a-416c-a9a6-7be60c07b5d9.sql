
-- Fix RLS policies for alerts table to allow the trigger to work

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can view alerts" ON public.alerts;
DROP POLICY IF EXISTS "Authenticated users can update alerts" ON public.alerts;

-- Create policy for inserting alerts (allow system/trigger to create alerts)
CREATE POLICY "Allow alert creation" 
  ON public.alerts 
  FOR INSERT 
  WITH CHECK (true);

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

-- Ensure the alerts table has RLS enabled
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
