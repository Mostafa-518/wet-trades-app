
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];
type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];

export class UserService {
  static async getAll() {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data;
  }

  static async getById(id: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  }

  static async create(user: UserProfileInsert) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(user)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  }

  static async update(id: string, user: UserProfileUpdate) {
    console.log('=== UserService.update called ===');
    console.log('Updating user ID:', id);
    console.log('Update data:', user);
    
    const updatePayload = { 
      ...user, 
      updated_at: new Date().toISOString() 
    };
    
    console.log('Final update payload:', updatePayload);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();
    
    console.log('Supabase update response:', { data, error });
    
    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }
    
    console.log('UserService.update successful:', data);
    return data;
  }

  static async delete(id: string) {
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
  }
}

// Export an instance as well for consistency
export const userService = UserService;
