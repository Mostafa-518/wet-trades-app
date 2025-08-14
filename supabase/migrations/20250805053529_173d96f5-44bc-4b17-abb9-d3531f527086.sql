-- First, let's see what enum values currently exist
SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role');

-- Add the new enum values first
ALTER TYPE user_role ADD VALUE 'procurement_manager';
ALTER TYPE user_role ADD VALUE 'procurement_engineer';

-- Update any existing user profiles to use new role names
UPDATE user_profiles 
SET role = 'procurement_manager' 
WHERE role = 'project_manager';

UPDATE user_profiles 
SET role = 'procurement_engineer' 
WHERE role = 'supervisor';

-- Update RLS policies to use the new role names
-- Projects table policies
DROP POLICY IF EXISTS "Admin/PM can modify projects" ON projects;
CREATE POLICY "Admin/PM can modify projects" 
ON projects 
FOR ALL 
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'procurement_manager'::user_role]));

-- Subcontractors table policies  
DROP POLICY IF EXISTS "Admin/PM can modify subcontractors" ON subcontractors;
CREATE POLICY "Admin/PM can modify subcontractors" 
ON subcontractors 
FOR ALL 
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'procurement_manager'::user_role]));

-- Subcontracts table policies
DROP POLICY IF EXISTS "Admin/PM can modify subcontracts" ON subcontracts;
CREATE POLICY "Admin/PM can modify subcontracts" 
ON subcontracts 
FOR ALL 
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'procurement_manager'::user_role]));

-- Subcontract trade items table policies
DROP POLICY IF EXISTS "Admin/PM can modify subcontract trade items" ON subcontract_trade_items;
CREATE POLICY "Admin/PM can modify subcontract trade items" 
ON subcontract_trade_items 
FOR ALL 
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'procurement_manager'::user_role]));