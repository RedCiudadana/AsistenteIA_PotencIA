/*
# App Settings Schema — Ajustes

## Summary
Creates the application settings table for the Red Ciudadana platform.
Single-tenant, single-row table — one record per deployment.
Policies use `TO anon, authenticated`.

## New Tables

### app_settings
Stores all configurable preferences for the platform across four domains:
institution profile, AI assistant behavior, appearance, and advanced options.

Columns:

#### Institución
- `institution_name`    — Display name of the public institution
- `institution_dept`    — Department or area within the institution
- `institution_state`   — State/entity of Mexico
- `institution_website` — Official website URL
- `institution_email`   — Institutional contact email

#### Asistente IA
- `ai_name`             — Custom name for the AI assistant
- `ai_role`             — Description of the AI's role/persona shown to users
- `response_style`      — Formality level: muy_formal | formal | semiformal
- `ai_cite_sources`     — Whether the AI should cite article/law references
- `ai_suggest_next`     — Whether the AI suggests follow-up actions
- `ai_use_emojis`       — Allow the AI to use emojis in responses

#### Apariencia
- `compact_mode`         — Reduce padding/spacing for denser layout
- `show_timestamps`      — Show timestamps on chat messages
- `show_typing_indicator`— Animate typing indicator while AI responds

#### Notificaciones
- `notify_ai_errors`     — Alert when AI encounters an error
- `notify_new_docs`      — Alert when a document is uploaded
- `notify_flow_complete` — Alert when a workflow step is completed

#### Avanzado
- `max_context_tokens`   — Max tokens sent as context to AI (4096/8192/16384/32768)
- `enable_telemetry`     — Send anonymous usage data
- `show_debug_info`      — Show performance/debug overlay

#### Meta
- `id`         — Fixed UUID (00...0002) — always UPDATE, never INSERT new rows
- `updated_at` — Auto-updated via trigger

## Security
- RLS enabled.
- `TO anon, authenticated` — single-tenant, no sign-in.

## Notes
1. All statements are idempotent.
2. A single row is seeded with sensible defaults for a Mexican public institution.
3. Frontend always UPDATEs the fixed-ID row — never INSERTs.
*/

CREATE TABLE IF NOT EXISTS app_settings (
  id                    uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Institución
  institution_name      text    NOT NULL DEFAULT 'Institución Pública',
  institution_dept      text,
  institution_state     text,
  institution_website   text,
  institution_email     text,
  -- Asistente IA
  ai_name               text    NOT NULL DEFAULT 'Asistente IA',
  ai_role               text    NOT NULL DEFAULT 'Asistente institucional para redacción y consulta de documentos oficiales del sector público.',
  response_style        text    NOT NULL DEFAULT 'formal'
                          CHECK (response_style IN ('muy_formal','formal','semiformal')),
  ai_cite_sources       boolean NOT NULL DEFAULT true,
  ai_suggest_next       boolean NOT NULL DEFAULT true,
  ai_use_emojis         boolean NOT NULL DEFAULT false,
  -- Apariencia
  compact_mode          boolean NOT NULL DEFAULT false,
  show_timestamps       boolean NOT NULL DEFAULT true,
  show_typing_indicator boolean NOT NULL DEFAULT true,
  -- Notificaciones
  notify_ai_errors      boolean NOT NULL DEFAULT true,
  notify_new_docs       boolean NOT NULL DEFAULT false,
  notify_flow_complete  boolean NOT NULL DEFAULT true,
  -- Avanzado
  max_context_tokens    int     NOT NULL DEFAULT 16384,
  enable_telemetry      boolean NOT NULL DEFAULT false,
  show_debug_info       boolean NOT NULL DEFAULT false,
  -- Meta
  updated_at            timestamptz DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_app_settings_updated_at ON app_settings;
CREATE TRIGGER trg_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_app_settings" ON app_settings;
CREATE POLICY "anon_select_app_settings" ON app_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_app_settings" ON app_settings;
CREATE POLICY "anon_insert_app_settings" ON app_settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_app_settings" ON app_settings;
CREATE POLICY "anon_update_app_settings" ON app_settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- Seed default row
INSERT INTO app_settings (
  id,
  institution_name, institution_dept, institution_state, institution_website, institution_email,
  ai_name, ai_role, response_style, ai_cite_sources, ai_suggest_next, ai_use_emojis,
  compact_mode, show_timestamps, show_typing_indicator,
  notify_ai_errors, notify_new_docs, notify_flow_complete,
  max_context_tokens, enable_telemetry, show_debug_info
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Gobierno del Estado', 'Dirección de Transparencia', 'Ciudad de México',
  'https://www.institucion.gob.mx', 'contacto@institucion.gob.mx',
  'Asistente IA',
  'Asistente institucional para redacción y consulta de documentos oficiales del sector público.',
  'formal', true, true, false,
  false, true, true,
  true, false, true,
  16384, false, false
)
ON CONFLICT (id) DO NOTHING;
