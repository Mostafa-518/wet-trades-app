
import { supabase } from '@/integrations/supabase/client';
import { BaseService } from './base/BaseService';
import { SubcontractTradeItem, SubcontractTradeItemInsert, SubcontractTradeItemUpdate } from './types';

export class SubcontractTradeItemService extends BaseService<SubcontractTradeItem, SubcontractTradeItemInsert, SubcontractTradeItemUpdate> {
  constructor() {
    super('subcontract_trade_items');
  }

  async getBySubcontractId(subcontractId: string) {
    const { data, error } = await supabase
      .from('subcontract_trade_items')
      .select(`
        *,
        trade_items(*, trades(*))
      `)
      .eq('subcontract_id', subcontractId);
    
    if (error) throw error;
    return data;
  }

  async createMany(items: SubcontractTradeItemInsert[]) {
    const { data, error } = await supabase
      .from('subcontract_trade_items')
      .insert(items)
      .select();
    
    if (error) throw error;
    return data;
  }

  async deleteBySubcontractId(subcontractId: string) {
    const { error } = await supabase
      .from('subcontract_trade_items')
      .delete()
      .eq('subcontract_id', subcontractId);
    
    if (error) throw error;
  }
}

export const subcontractTradeItemService = new SubcontractTradeItemService();
