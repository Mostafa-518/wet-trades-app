-- First, let's see what the current enum looks like and update it
-- Update the user_role enum to use the new role names
ALTER TYPE user_role RENAME VALUE 'project_manager' TO 'procurement_manager';
ALTER TYPE user_role RENAME VALUE 'supervisor' TO 'procurement_engineer';

-- Update any existing user roles in the database to use new names
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