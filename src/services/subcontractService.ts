
import { supabase } from '@/integrations/supabase/client';
import { BaseService } from './base/BaseService';
import { Subcontract, SubcontractInsert, SubcontractUpdate } from './types';
import { subcontractTradeItemService, subcontractResponsibilityService } from './';

export class SubcontractService extends BaseService<Subcontract, SubcontractInsert, SubcontractUpdate> {
  constructor() {
    super('subcontracts');
  }

  async getWithDetails(id: string) {
    const { data, error } = await supabase
      .from('subcontracts')
      .select(`
        *,
        projects(name, code),
        subcontractors(name, contact_person)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async getWithTradeItems() {
    const { data: subcontracts, error } = await supabase
      .from('subcontracts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;

    // Get trade items and responsibilities for each subcontract
    const subcontractsWithItems = await Promise.all(
      subcontracts.map(async (subcontract) => {
        const tradeItems = await subcontractTradeItemService.getBySubcontractId(subcontract.id);
        const responsibilities = await subcontractResponsibilityService.getBySubcontractId(subcontract.id);
        return { ...subcontract, tradeItems, responsibilities };
      })
    );

    return subcontractsWithItems;
  }
}

export const subcontractService = new SubcontractService();
