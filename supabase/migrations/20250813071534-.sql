-- Enable real-time for all relevant tables
ALTER TABLE public.projects REPLICA IDENTITY FULL;
ALTER TABLE public.subcontractors REPLICA IDENTITY FULL;
ALTER TABLE public.subcontracts REPLICA IDENTITY FULL;
ALTER TABLE public.trades REPLICA IDENTITY FULL;
ALTER TABLE public.trade_items REPLICA IDENTITY FULL;
ALTER TABLE public.responsibilities REPLICA IDENTITY FULL;
ALTER TABLE public.subcontract_trade_items REPLICA IDENTITY FULL;
ALTER TABLE public.subcontract_responsibilities REPLICA IDENTITY FULL;
ALTER TABLE public.alerts REPLICA IDENTITY FULL;
ALTER TABLE public.user_profiles REPLICA IDENTITY FULL;