
-- Add wastage percentage column to subcontract_trade_items table
ALTER TABLE public.subcontract_trade_items 
ADD COLUMN wastage_percentage numeric DEFAULT 0;

-- Add date of issuing column to subcontracts table
ALTER TABLE public.subcontracts 
ADD COLUMN date_of_issuing date;

-- Add comment for clarity
COMMENT ON COLUMN public.subcontract_trade_items.wastage_percentage IS 'Wastage percentage for the trade item (0-100)';
COMMENT ON COLUMN public.subcontracts.date_of_issuing IS 'Date when the contract was issued';
