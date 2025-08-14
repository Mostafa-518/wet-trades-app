-- Add pdf_url column to store external contract PDF links
ALTER TABLE public.subcontracts
ADD COLUMN IF NOT EXISTS pdf_url text;