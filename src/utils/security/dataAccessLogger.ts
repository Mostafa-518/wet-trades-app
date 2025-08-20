import { supabase } from '@/integrations/supabase/client';

/**
 * Logs access to sensitive data for audit purposes
 */
export const logSensitiveDataAccess = async (
  tableName: string,
  recordId: string,
  accessType: 'view' | 'export' | 'print' = 'view',
  additionalDetails?: Record<string, any>
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('Attempted data access without authentication');
      return;
    }

    // Call the database function for critical data access logging
    const { error } = await supabase.rpc('log_critical_data_access', {
      table_name: tableName,
      record_id: recordId,
      access_details: {
        access_type: accessType,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        ip_address: 'client_side', // Server-side logging would capture real IP
        ...additionalDetails
      }
    });

    if (error) {
      console.error('Failed to log data access:', error);
    }
  } catch (error) {
    console.error('Error in data access logging:', error);
  }
};

/**
 * Logs bulk data access (like exports)
 */
export const logBulkDataAccess = async (
  tableName: string,
  recordCount: number,
  accessType: 'export' | 'print' | 'view',
  filters?: Record<string, any>
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('Attempted bulk data access without authentication');
      return;
    }

    // Use a generic ID for bulk operations
    await logSensitiveDataAccess(tableName, 'bulk_operation', accessType, {
      record_count: recordCount,
      filters: filters,
      operation_type: 'bulk'
    });
  } catch (error) {
    console.error('Error in bulk data access logging:', error);
  }
};

/**
 * Logs user management actions
 */
export const logUserManagementAction = async (
  action: 'role_change' | 'profile_view' | 'user_create' | 'user_delete',
  targetUserId: string,
  details?: Record<string, any>
) => {
  try {
    await logSensitiveDataAccess('user_profiles', targetUserId, 'view', {
      management_action: action,
      ...details
    });
  } catch (error) {
    console.error('Error logging user management action:', error);
  }
};