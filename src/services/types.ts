
import { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];

// Type aliases for cleaner code
export type Project = Tables['projects']['Row'];
export type ProjectInsert = Tables['projects']['Insert'];
export type ProjectUpdate = Tables['projects']['Update'];

export type Subcontractor = Tables['subcontractors']['Row'];
export type SubcontractorInsert = Tables['subcontractors']['Insert'];
export type SubcontractorUpdate = Tables['subcontractors']['Update'];

export type Trade = Tables['trades']['Row'];
export type TradeInsert = Tables['trades']['Insert'];
export type TradeUpdate = Tables['trades']['Update'];

export type TradeItem = Tables['trade_items']['Row'];
export type TradeItemInsert = Tables['trade_items']['Insert'];
export type TradeItemUpdate = Tables['trade_items']['Update'];

export type Subcontract = Tables['subcontracts']['Row'];
export type SubcontractInsert = Tables['subcontracts']['Insert'];
export type SubcontractUpdate = Tables['subcontracts']['Update'];

export type SubcontractTradeItem = Tables['subcontract_trade_items']['Row'];
export type SubcontractTradeItemInsert = Tables['subcontract_trade_items']['Insert'];
export type SubcontractTradeItemUpdate = Tables['subcontract_trade_items']['Update'];

export type SubcontractResponsibility = Tables['subcontract_responsibilities']['Row'];
export type SubcontractResponsibilityInsert = Tables['subcontract_responsibilities']['Insert'];
export type SubcontractResponsibilityUpdate = Tables['subcontract_responsibilities']['Update'];

export type Responsibility = Tables['responsibilities']['Row'];
export type ResponsibilityInsert = Tables['responsibilities']['Insert'];
export type ResponsibilityUpdate = Tables['responsibilities']['Update'];

export type UserProfile = Tables['user_profiles']['Row'];
export type UserProfileInsert = Tables['user_profiles']['Insert'];
export type UserProfileUpdate = Tables['user_profiles']['Update'];
