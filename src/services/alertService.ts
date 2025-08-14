
import { BaseService } from './base/BaseService';
import { Alert, AlertInsert, AlertUpdate } from '@/types/alert';
import { supabase } from '@/integrations/supabase/client';

export class AlertService extends BaseService<Alert, AlertInsert, AlertUpdate> {
  constructor() {
    super('alerts');
  }

  async getAlerts(): Promise<Alert[]> {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getWithDetails() {
    const { data, error } = await supabase
      .from('alerts')
      .select(`
        *,
        projects(name, code),
        subcontractors(company_name, representative_name)
      `)
      .eq('is_dismissed', false)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async markAsRead(alertId: string): Promise<void> {
    const { error } = await supabase
      .from('alerts')
      .update({ is_read: true })
      .eq('id', alertId);
    
    if (error) throw error;
  }

  async markAsDismissed(alertId: string): Promise<void> {
    const { error } = await supabase
      .from('alerts')
      .update({ is_dismissed: true })
      .eq('id', alertId);
    
    if (error) throw error;
  }

  async dismissAlert(alertId: string): Promise<void> {
    const { error } = await supabase
      .from('alerts')
      .update({ is_dismissed: true })
      .eq('id', alertId);
    
    if (error) throw error;
  }

  async getUnreadCount(): Promise<number> {
    const { count, error } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)
      .eq('is_dismissed', false);
    
    if (error) throw error;
    return count || 0;
  }
}

export const alertService = new AlertService();
