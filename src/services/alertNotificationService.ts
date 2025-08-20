import { supabase } from '@/integrations/supabase/client';

class AlertNotificationService {
  private isListening = false;
  private emailChannel: any = null;

  async startListening() {
    if (this.isListening) return;
    
    console.log('Starting alert notification listener...');
    const session = await supabase.auth.getSession();
    console.log('Current user session:', session.data.session?.user?.email || 'No user logged in');
    this.isListening = true;

    // Listen for database notifications to send emails
    this.emailChannel = supabase
      .channel('alert_email_notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'alerts'
      }, async (payload) => {
        console.log('New alert created, sending email notification:', payload.new);
        
        if (payload.new) {
          await this.sendEmailNotification(payload.new as any);
        }
      })
      .subscribe();

    console.log('Alert notification listener started');
  }

  private async sendEmailNotification(alert: any) {
    try {
      console.log('Sending email notification for alert:', alert.id);
      
      // Call the edge function to send email notifications
      const { data, error } = await supabase.functions.invoke('send-alert-notification', {
        body: {
          alertId: alert.id,
          type: alert.type,
          title: alert.title,
          message: alert.message,
          totalAmount: alert.total_amount,
          thresholdAmount: alert.threshold_amount,
          projectName: alert.project_name,
          subcontractorName: alert.subcontractor_name
        }
      });

      if (error) {
        console.error('Failed to send alert notification:', error);
      } else {
        console.log('Email notification sent successfully:', data);
      }
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  stopListening() {
    if (this.emailChannel) {
      supabase.removeChannel(this.emailChannel);
      this.emailChannel = null;
    }
    this.isListening = false;
    console.log('Alert notification listener stopped');
  }
}

export const alertNotificationService = new AlertNotificationService();