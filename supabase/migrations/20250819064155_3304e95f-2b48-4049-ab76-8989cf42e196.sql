-- Fix audit_logs action check constraint to allow role_change
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_action_check;

-- Create new constraint that includes role_change
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_action_check 
CHECK (action IN ('insert', 'update', 'delete', 'role_change'));