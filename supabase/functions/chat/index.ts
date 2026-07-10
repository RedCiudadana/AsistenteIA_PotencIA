import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Environment variable names per provider_key — set these in Supabase Secrets dashboard
// for maximum security (they take precedence over the DB-stored key)
const PROVIDER_ENV_KEY: Record<string, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  openai:    "OPENAI_API_KEY",
  groq:      "GROQ_API_KEY",
  together:  "TOGETHER_API_KEY",
};

// o-series reasoning models: no temperature, use max_completion_tokens
function isReasoningModel(modelId: string): boolean {
  return /^o[1-9]/.test(modelId) || modelId === "o1" || modelId === "o1-mini";
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
  model_record_id: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const { messages, model_record_id } = body;

    if (!messages?.length || !model_record_id) {
      return new Response(
        JSON.stringify({ error: "Se requieren messages y model_record_id." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch model + provider using service role (bypasses RLS, reads api_key)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: model, error: modelError } = await supabase
      .from("ai_models")
      .select("*, ai_providers(*)")
      .eq("id", model_record_id)
      .maybeSingle();

    if (modelError || !model) {
      return new Response(
        JSON.stringify({ error: "Modelo no encontrado." }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const provider = model.ai_providers as {
      type: string;
      base_url: string | null;
      api_key: string | null;
      is_enabled: boolean;
      name: string;
      provider_key: string;
    };

    if (!provider.is_enabled) {
      return new Response(
        JSON.stringify({ error: `El proveedor "${provider.name}" no está habilitado. Configúralo en Ajustes → Modelos.` }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Resolve API key: Supabase Secret takes precedence, DB value is the fallback
    const envKeyName = PROVIDER_ENV_KEY[provider.provider_key];
    const apiKey = (envKeyName ? Deno.env.get(envKeyName) : undefined) || provider.api_key || null;

    // ── Anthropic ─────────────────────────────────────────────────────────────
    if (provider.type === "anthropic") {
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: "Clave de API de Anthropic no configurada. Agrégala en Ajustes → Modelos o como secreto ANTHROPIC_API_KEY." }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const systemMsg = messages.find((m) => m.role === "system")?.content;
      const chatMessages = messages.filter((m) => m.role !== "system");

      const anthropicBody: Record<string, unknown> = {
        model: model.model_id,
        max_tokens: 2048,
        messages: chatMessages,
      };
      if (systemMsg) anthropicBody.system = systemMsg;

      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify(anthropicBody),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        return new Response(
          JSON.stringify({ error: `Error de Anthropic (${resp.status}): ${errText}` }),
          { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const data = await resp.json();
      const content = data?.content?.[0]?.text ?? "";
      return new Response(
        JSON.stringify({ content, model: model.display_name, provider: provider.name }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // ── OpenAI-compatible (OpenAI, Groq, Together AI, Ollama, custom) ─────────
    const baseUrl = provider.base_url;
    if (!baseUrl) {
      return new Response(
        JSON.stringify({ error: `URL base no configurada para "${provider.name}".` }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!apiKey && provider.provider_key !== "ollama") {
      return new Response(
        JSON.stringify({ error: `Clave de API de ${provider.name} no configurada. Agrégala en Ajustes → Modelos.` }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

    // Build request body — reasoning models (o-series) don't accept temperature
    const reasoning = isReasoningModel(model.model_id);
    const chatBody: Record<string, unknown> = {
      model: model.model_id,
      messages,
    };
    if (reasoning) {
      chatBody.max_completion_tokens = 4096;
    } else {
      chatBody.max_tokens = 2048;
      chatBody.temperature = 0.7;
    }

    const resp = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(chatBody),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return new Response(
        JSON.stringify({ error: `Error de ${provider.name} (${resp.status}): ${errText}` }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content ?? "";
    return new Response(
      JSON.stringify({ content, model: model.display_name, provider: provider.name }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: `Error interno: ${(err as Error).message}` }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
