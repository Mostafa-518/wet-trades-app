-- Security Fix: Restrict subcontractor sensitive data access
-- Remove procurement engineer access to sensitive business information
-- Only admin and procurement_manager should access email, phone, tax info, etc.

-- Drop the current SELECT policy that allows procurement engineers
DROP POLICY IF EXISTS "Procurement staff can view subcontractors" ON public.subcontractors;

-- Create a more restrictive SELECT policy
-- Only admin and procurement_manager can view sensitive subcontractor data
CREATE POLICY "Admin and PM can view subcontractors" ON public.subcontractors
FOR SELECT 
TO authenticated
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'procurement_manager'::user_role]));

-- The modification policy remains unchanged (already properly restrictive)
-- Policy: Admin/PM can modify subcontractors (admin and procurement_manager only)