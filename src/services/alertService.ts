
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

  async sendEmailNotification(alert: Alert): Promise<void> {
    try {
      console.log('Sending email notification for alert:', alert.id);
      
      // Get project and subcontractor details
      const [projectData, subcontractorData] = await Promise.all([
        alert.project_id 
          ? supabase.from('projects').select('name').eq('id', alert.project_id).single()
          : { data: null },
        alert.subcontractor_id 
          ? supabase.from('subcontractors').select('company_name').eq('id', alert.subcontractor_id).single()
          : { data: null }
      ]);

      console.log('Project data:', projectData.data);
      console.log('Subcontractor data:', subcontractorData.data);

      // Call the edge function to send email notifications
      const { data, error } = await supabase.functions.invoke('send-alert-notification', {
        body: {
          alertId: alert.id,
          type: alert.type,
          title: alert.title,
          message: alert.message,
          totalAmount: alert.total_amount,
          thresholdAmount: alert.threshold_amount,
          projectName: projectData.data?.name,
          subcontractorName: subcontractorData.data?.company_name
        }
      });

      if (error) {
        console.error('Failed to send alert notification:', error);
        throw error;
      }
      
      console.log('Email notification sent successfully:', data);
    } catch (error) {
      console.error('Error sending email notification:', error);
      // Don't throw error to avoid blocking alert creation
    }
  }

  async createWithNotification(alertData: AlertInsert): Promise<Alert> {
    console.log('Creating alert with notification:', alertData);
    
    const { data, error } = await supabase
      .from('alerts')
      .insert(alertData)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('Alert created:', data);
    
    // Send email notification in background
    this.sendEmailNotification(data);
    
    return data;
  }
}

export const alertService = new AlertService();
