import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

function median(values: number[]): number | null {
  const arr = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (!arr.length) return null;
  const mid = Math.floor(arr.length / 2);
  return arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
}

function tryParseJSON(text: string): any {
  try {
    return JSON.parse(text);
  } catch (_) {
    // try to extract from code fences
    const match = text.match(/```json\n([\s\S]*?)```/i) || text.match(/```[\s\S]*?\n([\s\S]*?)```/);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1]);
      } catch (_) {}
    }
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader ?? "" } },
    });

    const body = await req.json();
    const {
      item_name,
      unit,
      trade_id,
      specs,
      location,
      quantity,
      currency = "EGP",
      k = 12,
      decay_months = 12,
    } = body ?? {};

    if (!item_name || !unit) {
      return new Response(JSON.stringify({ error: "item_name and unit are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch recent similar estimates (lexical for now)
    const likeText = `%${item_name.split(" ").slice(0, 6).join("%")}%`;
    let query = supabase
      .from("estimates")
      .select("id, item_name, unit, trade_id, ai_rate, final_rate, created_at, currency")
      .eq("unit", unit)
      .order("created_at", { ascending: false })
      .limit(Math.max(2 * k, 20));

    if (trade_id) query = query.eq("trade_id", trade_id);
    // Prefer ilike match on item_name
    query = query.ilike("item_name", likeText);

    const { data: similar = [], error: simErr } = await query;
    if (simErr) throw simErr;

    // Pick usable rates and compute a simple median baseline
    const rates = similar
      .map((r) => Number(r.final_rate ?? r.ai_rate))
      .filter((n) => Number.isFinite(n)) as number[];

    const baseline = median(rates) ?? null;

    // Build compact context for the model
    const topContext = similar.slice(0, k).map((r) => ({
      id: r.id,
      item_name: r.item_name,
      unit: r.unit,
      rate: Number(r.final_rate ?? r.ai_rate) || null,
      currency: r.currency,
      created_at: r.created_at,
    }));

    const prompt = `Generate a precise cost breakdown for a construction trade item.\n
Item: ${item_name}\nUnit: ${unit}\nCurrency: ${currency}\nTrade: ${trade_id ?? "(unspecified)"}\nSpecs: ${specs ?? "-"}\nLocation: ${location ?? "-"}\nQuantity: ${quantity ?? "-"}\n
Context (similar past estimates):\n${topContext
  .map((c) => `- ${c.item_name} | ${c.unit} | rate=${c.rate ?? "-"} ${c.currency ?? ""} | date=${c.created_at}`)
  .join("\n")}\n
If context is weak, use reasonable local assumptions.\nReturn STRICT JSON with keys: unit_rate, currency, confidence (0-1), rationale, breakdown (array of {category,name,qty,unit,unit_price,total}). Ensure totals sum to unit_rate. Avoid negative values or mismatched units.`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [
          { role: "system", content: "You are a construction cost AI. Be concise, numeric, and consistent." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const text = await aiRes.text();
      return new Response(JSON.stringify({ error: "OpenAI API error", details: text }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiRes.json();
    const content = aiJson.choices?.[0]?.message?.content ?? "";
    const parsed = tryParseJSON(content);

    if (!parsed || typeof parsed !== "object") {
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const unit_rate = Math.max(0, Number(parsed.unit_rate ?? baseline ?? 0));
    const confidence = Math.max(0, Math.min(1, Number(parsed.confidence ?? 0.6)));
    const rationale = String(parsed.rationale ?? "Generated from similar items and assumptions.");
    const breakdown = Array.isArray(parsed.breakdown) ? parsed.breakdown : [];

    // Normalize breakdown and totals
    const normalized = breakdown
      .map((l: any) => ({
        category: String(l.category || "materials").toLowerCase(),
        name: String(l.name || "Line"),
        qty: Number(l.qty ?? 1),
        unit: String(l.unit || unit),
        unit_price: Number(l.unit_price ?? 0),
        total: Number(l.total ?? (Number(l.qty ?? 1) * Number(l.unit_price ?? 0))),
      }))
      .filter((l: any) => Number.isFinite(l.total) && l.total >= 0);

    const sumTotals = normalized.reduce((s: number, l: any) => s + (Number.isFinite(l.total) ? l.total : 0), 0);
    const final_unit_rate = sumTotals > 0 ? sumTotals : unit_rate;

    const result = {
      inputs: { item_name, unit, trade_id, specs, location, quantity, currency },
      baseline,
      unit_rate: final_unit_rate,
      currency,
      confidence,
      rationale,
      breakdown: normalized,
      context_size: topContext.length,
      context_window: decay_months,
      top_context: topContext,
      generated_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("estimate-with-ai error:", error);
    return new Response(JSON.stringify({ error: error?.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
