/*
# AI Providers + Models Schema

## Summary
Enables the platform to connect to multiple AI model providers:
- Anthropic (Claude models)
- Groq (Llama 3.x via OpenAI-compatible API — free tier available)
- Together AI (Llama 3.x, Mistral via OpenAI-compatible API)
- Ollama (self-hosted local models)
- Custom (any OpenAI-compatible endpoint)

## Tables

### ai_providers
Each row is a model provider the platform can route chat requests to.

Columns:
- `id`           — UUID (fixed for seeded providers)
- `name`         — Display name ("Groq", "Together AI", …)
- `provider_key` — Internal key: 'anthropic'|'groq'|'together'|'ollama'|'custom'
- `type`         — Protocol: 'anthropic' uses the Anthropic SDK format;
                   'openai_compat' uses the OpenAI /chat/completions format
- `base_url`     — Required for openai_compat providers
- `api_key`      — API credential (nullable; Ollama local needs none)
- `is_enabled`   — Whether this provider is available for selection
- `sort_order`   — Display order in UI

### ai_models
Each row is a specific model variant offered by a provider.

Columns:
- `id`             — UUID (fixed for seeded models)
- `provider_id`    — FK → ai_providers
- `model_id`       — Exact identifier sent to the API (e.g., "llama-3.3-70b-versatile")
- `display_name`   — Human-readable name shown in the UI
- `description`    — Short capability description shown in the model selector
- `context_window` — Max context tokens (informational)

## Fixed UUIDs (idempotent seeds)
Providers: 1000…0001–0004
Models:    2000…0001–0009

## Security
RLS enabled; anon+authenticated can read, only authenticated can write.
Admins update provider API keys through the Settings → Modelos page.

## Notes
- Anthropic is enabled by default (uses ANTHROPIC_API_KEY env secret in the edge function).
- Other providers are seeded but disabled until the admin enters an API key.
- The edge function reads api_key from this table; never expose it client-side.
*/

-- ── Tables ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ai_providers (
  id           uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text    NOT NULL,
  provider_key text    NOT NULL,
  type         text    NOT NULL CHECK (type IN ('anthropic','openai_compat')),
  base_url     text,
  api_key      text,
  is_enabled   boolean NOT NULL DEFAULT false,
  sort_order   int     NOT NULL DEFAULT 0,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_models (
  id             uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id    uuid    NOT NULL REFERENCES ai_providers(id) ON DELETE CASCADE,
  model_id       text    NOT NULL,
  display_name   text    NOT NULL,
  description    text,
  context_window int,
  created_at     timestamptz DEFAULT now()
);

-- ── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_models    ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_ai_providers" ON ai_providers;
CREATE POLICY "anon_select_ai_providers" ON ai_providers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_update_ai_providers" ON ai_providers;
CREATE POLICY "anon_update_ai_providers" ON ai_providers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_ai_models" ON ai_models;
CREATE POLICY "anon_select_ai_models" ON ai_models FOR SELECT
  TO anon, authenticated USING (true);

-- ── Seed: providers ───────────────────────────────────────────────────────────

INSERT INTO ai_providers (id, name, provider_key, type, base_url, api_key, is_enabled, sort_order)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'Anthropic',   'anthropic', 'anthropic',    null,                               null, true,  0),
  ('10000000-0000-0000-0000-000000000002', 'Groq',        'groq',      'openai_compat','https://api.groq.com/openai/v1',   null, false, 1),
  ('10000000-0000-0000-0000-000000000003', 'Together AI', 'together',  'openai_compat','https://api.together.xyz/v1',      null, false, 2),
  ('10000000-0000-0000-0000-000000000004', 'Ollama',      'ollama',    'openai_compat','http://localhost:11434/v1',        null, false, 3)
ON CONFLICT (id) DO NOTHING;

-- ── Seed: models ─────────────────────────────────────────────────────────────

INSERT INTO ai_models (id, provider_id, model_id, display_name, description, context_window)
VALUES
  -- Anthropic
  ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','claude-sonnet-4-5',                          'Claude Sonnet 4',          'Respuestas completas y precisas',       200000),
  ('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','claude-haiku-4-5',                           'Claude Haiku 4',           'Respuestas rápidas y concisas',          48000),
  -- Groq (Llama)
  ('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000002','llama-3.3-70b-versatile',                   'Llama 3.3 · 70B',          'Llama versátil — máxima calidad',       128000),
  ('20000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000002','llama-3.1-8b-instant',                      'Llama 3.1 · 8B',           'Ultra rápido, ideal para consultas',    128000),
  -- Together AI (Llama)
  ('20000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000003','meta-llama/Llama-3.3-70B-Instruct-Turbo',   'Llama 3.3 · 70B Turbo',   'Llama de alta calidad vía Together',   131072),
  ('20000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000003','meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo','Llama 3.1 · 8B Turbo',  'Modelo ligero vía Together',           131072),
  -- Ollama (local)
  ('20000000-0000-0000-0000-000000000007','10000000-0000-0000-0000-000000000004','llama3.2',  'Llama 3.2',  'Modelo local — requiere Ollama corriendo', 128000),
  ('20000000-0000-0000-0000-000000000008','10000000-0000-0000-0000-000000000004','llama3.1',  'Llama 3.1',  'Modelo local — requiere Ollama corriendo', 128000),
  ('20000000-0000-0000-0000-000000000009','10000000-0000-0000-0000-000000000004','mistral',   'Mistral 7B', 'Modelo local — requiere Ollama corriendo',  32000)
ON CONFLICT (id) DO NOTHING;
