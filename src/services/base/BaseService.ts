
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];

// Base service class with common CRUD operations
export abstract class BaseService<T, TInsert, TUpdate> {
  protected tableName: keyof Tables;

  constructor(tableName: keyof Tables) {
    this.tableName = tableName;
  }

  async getAll() {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as T[];
  }

  async getById(id: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as T;
  }

  async create(item: TInsert) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(item)
      .select()
      .single();
    
    if (error) throw error;
    return data as T;
  }

  async update(id: string, item: TUpdate) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({ ...item, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as T;
  }

  async delete(id: string) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}
