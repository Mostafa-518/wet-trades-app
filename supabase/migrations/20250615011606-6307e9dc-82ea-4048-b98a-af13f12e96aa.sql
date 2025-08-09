
-- Add new columns to the subcontractors table
ALTER TABLE public.subcontractors 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS representative_name TEXT,
ADD COLUMN IF NOT EXISTS commercial_registration TEXT,
ADD COLUMN IF NOT EXISTS tax_card_no TEXT;

-- Update existing columns to match the new requirements
-- Note: email and phone already exist, representative_name replaces contact_person
UPDATE public.subcontractors 
SET representative_name = contact_person 
WHERE contact_person IS NOT NULL AND representative_name IS NULL;

-- We can keep the existing contact_person column for backward compatibility
-- but the UI will primarily use representative_name
