
-- Remove the columns from the projects table
ALTER TABLE public.projects 
DROP COLUMN description,
DROP COLUMN start_date,
DROP COLUMN end_date,
DROP COLUMN status;
