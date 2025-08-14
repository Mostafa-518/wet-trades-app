-- SECURITY FIX: Fix publicly accessible subcontractors table
-- The current SELECT policy uses "true" which allows public access to sensitive contractor data
-- This exposes emails, phone numbers, and business registration details to anyone

-- Drop the insecure policy that allows public access
DROP POLICY IF EXISTS "Authenticated users can view all subcontractors" ON public.subcontractors;

-- Create a secure policy that requires authentication
CREATE POLICY "Authenticated users can view subcontractors" 
ON public.subcontractors 
FOR SELECT 
USING (auth.role() = 'authenticated'::text);

-- Ensure the modify policy is also properly secured (it already was, but let's be explicit)
DROP POLICY IF EXISTS "Admin/PM can modify subcontractors" ON public.subcontractors;

CREATE POLICY "Admin/PM can modify subcontractors" 
ON public.subcontractors 
FOR ALL 
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'procurement_manager'::user_role]));