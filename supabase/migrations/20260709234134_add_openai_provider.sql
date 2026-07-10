-- Add OpenAI as a provider (openai_compat type, uses https://api.openai.com/v1)
INSERT INTO ai_providers (id, name, provider_key, type, base_url, api_key, is_enabled, sort_order)
VALUES (
  '10000000-0000-0000-0000-000000000005',
  'OpenAI',
  'openai',
  'openai_compat',
  'https://api.openai.com/v1',
  null,
  false,
  4
)
ON CONFLICT (id) DO NOTHING;

-- Seed OpenAI models
INSERT INTO ai_models (id, provider_id, model_id, display_name, description, context_window)
VALUES
  ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000005', 'gpt-4o',      'GPT-4o',       'Modelo más capaz de OpenAI, multimodal',  128000),
  ('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000005', 'gpt-4o-mini',  'GPT-4o mini',  'Versión rápida y económica de GPT-4o',    128000),
  ('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000005', 'o4-mini',      'o4-mini',      'Modelo de razonamiento compacto',         200000)
ON CONFLICT (id) DO NOTHING;
