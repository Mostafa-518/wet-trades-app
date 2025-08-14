
import { supabase } from '@/integrations/supabase/client';
import { BaseService } from './base/BaseService';
import { Database } from '@/integrations/supabase/types';

type SubcontractResponsibility = Database['public']['Tables']['subcontract_responsibilities']['Row'];
type SubcontractResponsibilityInsert = Database['public']['Tables']['subcontract_responsibilities']['Insert'];
type SubcontractResponsibilityUpdate = Database['public']['Tables']['subcontract_responsibilities']['Update'];

export class SubcontractResponsibilityService extends BaseService<
  SubcontractResponsibility,
  SubcontractResponsibilityInsert,
  SubcontractResponsibilityUpdate
> {
  constructor() {
    super('subcontract_responsibilities');
  }

  async getBySubcontractId(subcontractId: string) {
    const { data, error } = await supabase
      .from('subcontract_responsibilities')
      .select(`
        *,
        responsibilities(*)
      `)
      .eq('subcontract_id', subcontractId);
    
    if (error) throw error;
    return data;
  }

  async deleteBySubcontractId(subcontractId: string) {
    const { error } = await supabase
      .from('subcontract_responsibilities')
      .delete()
      .eq('subcontract_id', subcontractId);
    
    if (error) throw error;
  }

  async createMany(responsibilities: SubcontractResponsibilityInsert[]) {
    const { data, error } = await supabase
      .from('subcontract_responsibilities')
      .insert(responsibilities)
      .select();
    
    if (error) throw error;
    return data;
  }
}

export const subcontractResponsibilityService = new SubcontractResponsibilityService();
