
-- Remove unused columns from subcontractors table
ALTER TABLE public.subcontractors 
DROP COLUMN IF EXISTS address,
DROP COLUMN IF EXISTS license_number,
DROP COLUMN IF EXISTS rating,
DROP COLUMN IF EXISTS contact_person;

-- The remaining columns that will be kept:
-- - id (primary key)
-- - name (will be used as Company Name)
-- - company_name (Company Name)
-- - representative_name (Representative Name)
-- - commercial_registration (Commercial Registration)
-- - tax_card_no (Tax Card No.)
-- - phone (Phone Contact)
-- - email (Mail)
-- - created_at, updated_at (system columns)
