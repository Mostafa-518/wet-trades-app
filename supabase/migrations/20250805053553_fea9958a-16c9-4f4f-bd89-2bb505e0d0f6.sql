-- Step 1: Add new enum values (this must be in its own transaction)
ALTER TYPE user_role ADD VALUE 'procurement_manager';
ALTER TYPE user_role ADD VALUE 'procurement_engineer';