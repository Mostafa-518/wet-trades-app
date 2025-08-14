
-- Remove the name column from the subcontractors table since we'll use company_name as the primary identifier
ALTER TABLE public.subcontractors DROP COLUMN name;
