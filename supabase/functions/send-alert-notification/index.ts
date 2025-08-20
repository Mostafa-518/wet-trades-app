import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AlertNotificationRequest {
  alertId: string;
  type: string;
  title: string;
  message: string;
  totalAmount?: number;
  thresholdAmount?: number;
  projectName?: string;
  subcontractorName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('=== Alert notification function called ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      alertId, 
      type, 
      title, 
      message, 
      totalAmount, 
      thresholdAmount, 
      projectName, 
      subcontractorName 
    }: AlertNotificationRequest = await req.json();

    console.log('Processing alert notification:', { alertId, type, title });

    // Get Zapier webhook URL
    const zapierWebhookUrl = Deno.env.get("ZAPIER_WEBHOOK_URL");
    
    if (!zapierWebhookUrl) {
      console.log('ZAPIER_WEBHOOK_URL is not set - skipping notification');
      return new Response(JSON.stringify({
        success: false,
        message: 'Zapier webhook URL is not configured. Please set ZAPIER_WEBHOOK_URL secret.',
        results: []
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get admin and procurement manager users
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('email, full_name, role')
      .in('role', ['admin', 'procurement_manager'])
      .not('email', 'is', null);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    if (!users || users.length === 0) {
      console.log('No admin or procurement manager users found');
      return new Response(JSON.stringify({ success: true, message: 'No recipients found' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Filter users with valid email addresses
    const validUsers = users.filter(user => user.email && user.email.trim() !== '');
    
    console.log(`Found ${users.length} total users, ${validUsers.length} users with valid emails`);

    if (validUsers.length === 0) {
      console.log('No users with valid email addresses found');
      return new Response(JSON.stringify({ success: true, message: 'No valid email recipients found' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Prepare formatted data for Zapier (matching the email template structure)
    const alertLink = `https://mostafa-518.github.io/wet-trades-app/#/alerts`;
    const formattedAmount = totalAmount ? new Intl.NumberFormat('en-US').format(totalAmount) : '';
    const formattedThreshold = thresholdAmount ? new Intl.NumberFormat('en-US').format(thresholdAmount) : '';
    
    // Prepare webhook payload with formatted email data
    const webhookPayload = {
      alertId,
      type,
      title,
      message,
      projectName,
      subcontractorName,
      totalAmount,
      thresholdAmount,
      formattedAmount,
      formattedThreshold,
      alertLink,
      recipients: validUsers.map(user => user.email),
      subject: `🚨 ${title} - Action Required`,
      timestamp: new Date().toISOString(),
      // Email content structure for Zapier to format
      emailContent: {
        header: `🚨 ${title}`,
        alertMessage: message,
        details: [
          ...(projectName ? [`**Project:** ${projectName}`] : []),
          ...(subcontractorName ? [`**Subcontractor:** ${subcontractorName}`] : []),
          ...(totalAmount ? [`**Total Amount:** EGP ${formattedAmount}`] : []),
          ...(thresholdAmount ? [`**Threshold:** EGP ${formattedThreshold}`] : [])
        ],
        actionButton: {
          text: "View Alert Details",
          url: alertLink
        },
        footer: "This is an automated alert from your procurement management system. Please review the details and take appropriate action.",
        signature: "Orascom Construction - Procurement Management System"
      }
    };

    try {
      // Send to Zapier webhook
      const response = await fetch(zapierWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });

      if (!response.ok) {
        throw new Error(`Zapier webhook failed: ${response.status} ${response.statusText}`);
      }

      const webhookResult = await response.json();
      console.log('Zapier webhook triggered successfully:', webhookResult);

      return new Response(JSON.stringify({
        success: true,
        message: `Alert notification sent to ${validUsers.length} recipients via Zapier`,
        totalRecipients: validUsers.length,
        webhookResult
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });

    } catch (webhookError) {
      console.error('Zapier webhook error:', webhookError);
      
      return new Response(JSON.stringify({
        success: false,
        message: 'Failed to trigger Zapier webhook',
        error: webhookError.message
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

  } catch (error: any) {
    console.error("Error in send-alert-notification function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);