
export interface Trade {
  id: string;
  name: string;
  category: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface TradeFormData {
  name: string;
  category: string;
  description: string;
}

export interface TradeSearchFilters {
  name: string;
  category: string;
  description: string;
}

export interface TradeItem {
  id: string;
  trade_id: string;
  name: string;
  unit: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface TradeItemFormData {
  trade_id: string;
  name: string;
  unit: string;
  description: string;
}

export interface TradeItemSearchFilters {
  name: string;
  trade_id: string;
  unit: string;
}
