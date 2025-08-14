-- Fix subcontractors security issue by restricting read access
-- Only users with manage_subcontractors permission should access sensitive business data

-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view subcontractors" ON public.subcontractors;

-- Create a new restrictive SELECT policy for subcontractors
-- Only admin, procurement_manager, and procurement_engineer roles can view subcontractors
CREATE POLICY "Procurement staff can view subcontractors" ON public.subcontractors
FOR SELECT 
TO authenticated
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'procurement_manager'::user_role, 'procurement_engineer'::user_role]));

-- Keep the existing modification policy unchanged as it's already properly restrictive
-- Policy: Admin/PM can modify subcontractors (admin and procurement_manager only)