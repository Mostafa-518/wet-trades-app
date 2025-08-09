
import { supabase } from '@/integrations/supabase/client';
import { BaseService } from './base/BaseService';
import { TradeItem, TradeItemInsert, TradeItemUpdate } from './types';

export class TradeItemService extends BaseService<TradeItem, TradeItemInsert, TradeItemUpdate> {
  constructor() {
    super('trade_items');
  }

  async getByTradeId(tradeId: string) {
    const { data, error } = await supabase
      .from('trade_items')
      .select('*')
      .eq('trade_id', tradeId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as TradeItem[];
  }
}

export const tradeItemService = new TradeItemService();
