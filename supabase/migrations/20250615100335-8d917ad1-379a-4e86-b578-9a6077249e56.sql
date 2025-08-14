
-- Add contract_type column to subcontracts: value can be 'subcontract' or 'ADD'
ALTER TABLE public.subcontracts
ADD COLUMN contract_type text NOT NULL DEFAULT 'subcontract';

-- Add addendum_number column (nullable) to store the addendum number
ALTER TABLE public.subcontracts
ADD COLUMN addendum_number text;

-- Add parent_subcontract_id column (nullable) for addendum references
ALTER TABLE public.subcontracts
ADD COLUMN parent_subcontract_id uuid REFERENCES public.subcontracts(id);

-- Add comments for clarity
COMMENT ON COLUMN public.subcontracts.contract_type IS 'Type of contract: subcontract or ADD (addendum)';
COMMENT ON COLUMN public.subcontracts.addendum_number IS 'Addendum number (only for addendums)';
COMMENT ON COLUMN public.subcontracts.parent_subcontract_id IS 'Reference to parent subcontract if this is an addendum';
