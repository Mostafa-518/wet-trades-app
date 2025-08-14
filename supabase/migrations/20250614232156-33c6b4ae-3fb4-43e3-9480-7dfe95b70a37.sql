
-- Create the subcontract_responsibilities junction table
CREATE TABLE public.subcontract_responsibilities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subcontract_id uuid REFERENCES public.subcontracts(id) ON DELETE CASCADE,
  responsibility_id uuid REFERENCES public.responsibilities(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(subcontract_id, responsibility_id)
);

-- Enable Row Level Security
ALTER TABLE public.subcontract_responsibilities ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (adjust based on your auth requirements)
CREATE POLICY "Enable read access for all users" ON public.subcontract_responsibilities FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.subcontract_responsibilities FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.subcontract_responsibilities FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.subcontract_responsibilities FOR DELETE USING (true);
