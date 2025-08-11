import { supabase } from '@/integrations/supabase/client';

export type CreateEstimateInput = {
  item_name: string;
  unit: string;
  trade_id?: string;
  quantity?: number;
  currency?: string; // defaults to EGP
  location?: string;
  specs?: string;
  project_id?: string;
};

export type AiEstimateResult = {
  unit_rate: number;
  currency: string;
  confidence: number;
  rationale: string;
  breakdown: Array<{ category: string; name: string; qty: number; unit: string; unit_price: number; total: number }>;
  baseline: number | null;
  context_size: number;
  context_window: number;
  generated_at: string;
  top_context?: Array<{ id: string; item_name: string; unit: string; rate: number | null; currency: string | null; created_at: string }>
};

export class EstimateService {
  async createDraft(input: CreateEstimateInput) {
    const {
      item_name,
      unit,
      trade_id,
      quantity,
      currency = 'EGP',
      location,
      specs,
      project_id,
    } = input;

    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) throw new Error('You must be logged in to create an estimate');

    const payload: any = {
      user_id: user.id,
      status: 'draft',
      item_name,
      unit,
      trade_id: trade_id ?? null,
      quantity: quantity ?? null,
      currency,
      location: location ?? null,
      specs: specs ?? null,
      project_id: project_id ?? null,
    };

    const { data, error } = await supabase
      .from('estimates')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async getById(id: string) {
    const { data, error } = await supabase
      .from('estimates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async listMyRecent(limit = 10) {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) throw new Error('You must be logged in');

    const { data, error } = await supabase
      .from('estimates')
      .select('id, item_name, unit, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data ?? [];
  }

  async estimateWithAI(input: CreateEstimateInput & { k?: number; decay_months?: number }) {
    const { data, error } = await supabase.functions.invoke('estimate-with-ai', {
      body: input,
    });
    if (error) throw error;
    return data as AiEstimateResult;
  }

  async saveEstimateFromResult(input: CreateEstimateInput, result: AiEstimateResult) {
    // Create a draft first to ensure ownership via RLS
    const draft = await this.createDraft(input as any);

    const sourceIds = result.top_context?.map((t) => t.id) ?? null;

    // Update the estimate with AI fields
    const { data: updated, error: upErr } = await supabase
      .from('estimates')
      .update({
        ai_rate: result.unit_rate,
        ai_confidence: result.confidence,
        ai_notes: result.rationale,
        final_rate: result.unit_rate,
        source_item_ids: sourceIds,
      })
      .eq('id', draft.id)
      .select('*')
      .single();
    if (upErr) throw upErr;

    // Insert line items
    const mapType = (cat: string): 'material' | 'labor' | 'equipment' | 'overhead' => {
      const c = (cat || '').toLowerCase();
      if (c.startsWith('material')) return 'material';
      if (c.startsWith('labor')) return 'labor';
      if (c.startsWith('equip')) return 'equipment';
      return 'overhead';
    };

    const lines = (result.breakdown || []).map((l) => ({
      estimate_id: draft.id,
      type: mapType((l as any).category) as any,
      name: (l as any).name,
      unit: (l as any).unit,
      qty: (l as any).qty,
      unit_price: (l as any).unit_price,
      total_price: (l as any).total,
      source_ref: null,
    }));

    if (lines.length) {
      const { error: liErr } = await supabase.from('estimate_line_items').insert(lines as any);
      if (liErr) throw liErr;
    }

    return updated?.id ?? draft.id as string;
  }

  async submitFeedback(estimate_id: string, rating: 'accurate' | 'too_high' | 'too_low' | 'wrong_composition', reason?: string) {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) throw new Error('You must be logged in to submit feedback');

    const { error } = await supabase.from('estimate_feedback').insert({
      estimate_id,
      user_id: user.id,
      rating,
      reason: reason ?? null,
    } as any);
    if (error) throw error;
  }
}

export const estimateService = new EstimateService();
