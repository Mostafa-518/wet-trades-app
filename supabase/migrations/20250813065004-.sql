-- Drop existing restrictive policies for trades, responsibilities, and trade_items
DROP POLICY IF EXISTS "Admin can modify trades" ON public.trades;
DROP POLICY IF EXISTS "Admin can modify responsibilities" ON public.responsibilities;
DROP POLICY IF EXISTS "Admin can modify trade items" ON public.trade_items;

-- Create new policies that allow procurement managers and engineers to modify
CREATE POLICY "Procurement staff can modify trades" 
ON public.trades 
FOR ALL 
TO authenticated 
USING (get_user_role(auth.uid()) IN ('admin'::user_role, 'procurement_manager'::user_role, 'procurement_engineer'::user_role))
WITH CHECK (get_user_role(auth.uid()) IN ('admin'::user_role, 'procurement_manager'::user_role, 'procurement_engineer'::user_role));

CREATE POLICY "Procurement staff can modify responsibilities" 
ON public.responsibilities 
FOR ALL 
TO authenticated 
USING (get_user_role(auth.uid()) IN ('admin'::user_role, 'procurement_manager'::user_role, 'procurement_engineer'::user_role))
WITH CHECK (get_user_role(auth.uid()) IN ('admin'::user_role, 'procurement_manager'::user_role, 'procurement_engineer'::user_role));

CREATE POLICY "Procurement staff can modify trade items" 
ON public.trade_items 
FOR ALL 
TO authenticated 
USING (get_user_role(auth.uid()) IN ('admin'::user_role, 'procurement_manager'::user_role, 'procurement_engineer'::user_role))
WITH CHECK (get_user_role(auth.uid()) IN ('admin'::user_role, 'procurement_manager'::user_role, 'procurement_engineer'::user_role));