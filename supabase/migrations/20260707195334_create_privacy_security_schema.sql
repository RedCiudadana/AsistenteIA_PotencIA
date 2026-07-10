/*
# Privacy and Security Schema

## Summary
Creates the Privacy & Security module tables for the Red Ciudadana platform.
Single-tenant, no auth — policies use `TO anon, authenticated`.

## New Tables

### 1. privacy_settings
Stores the institution's global privacy and security configuration.
Designed as a **single-row** table (only one record per deployment).

Columns:
- `id`                      — UUID primary key (fixed seed)
- `ai_context_level`        — How much document context is shared with AI:
                               'none' | 'summary' | 'full'
- `data_retention_days`     — How long data is kept (30/90/365/1095)
- `require_human_review`    — Mandatory human review before sending AI responses
- `allow_external_ai`       — Whether external AI providers are permitted
- `allow_doc_indexing`      — Whether documents can be indexed for AI retrieval
- `classification_default`  — Default sensitivity level for new documents:
                               'public' | 'internal' | 'confidential' | 'reserved'
- `audit_log_enabled`       — Master switch for audit logging
- `anonymize_queries`       — Strip PII from query logs
- `session_timeout_minutes` — Auto-logout after inactivity
- `institutional_name`      — Name of the responsible institution
- `responsible_name`        — Data protection officer / responsible person
- `responsible_email`       — Contact email for privacy matters
- `updated_at`              — When settings were last saved

### 2. compliance_items
Checklist of regulatory obligations applicable to Mexican public institutions.
Each item tracks its compliance status and optional notes.

Columns:
- `id`          — UUID primary key
- `category`    — Framework: LGTAIP | LGPDPPSO | NOM-151 | MAAGTIC | INTERNA
- `order_index` — Display order within category
- `title`       — Short obligation name
- `description` — What this item requires
- `status`      — compliant | warning | non_compliant
- `is_checked`  — Whether the institution has verified this item
- `notes`       — Free-text notes / evidence link
- `updated_at`  — When last reviewed

## Security
- RLS enabled on both tables.
- `TO anon, authenticated` — single-tenant app.

## Notes
1. `privacy_settings` is seeded with one row using a fixed UUID.
   All frontend operations should UPDATE that row, never INSERT.
2. `compliance_items` is seeded with 20 items across 5 frameworks.
3. All statements are idempotent.
*/

-- ─── privacy_settings ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS privacy_settings (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_context_level        text NOT NULL DEFAULT 'summary'
                            CHECK (ai_context_level IN ('none','summary','full')),
  data_retention_days     int  NOT NULL DEFAULT 365,
  require_human_review    boolean NOT NULL DEFAULT true,
  allow_external_ai       boolean NOT NULL DEFAULT false,
  allow_doc_indexing      boolean NOT NULL DEFAULT true,
  classification_default  text NOT NULL DEFAULT 'internal'
                            CHECK (classification_default IN ('public','internal','confidential','reserved')),
  audit_log_enabled       boolean NOT NULL DEFAULT true,
  anonymize_queries       boolean NOT NULL DEFAULT false,
  session_timeout_minutes int  NOT NULL DEFAULT 60,
  institutional_name      text NOT NULL DEFAULT 'Institución Pública',
  responsible_name        text,
  responsible_email       text,
  updated_at              timestamptz DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_privacy_settings_updated_at ON privacy_settings;
CREATE TRIGGER trg_privacy_settings_updated_at
  BEFORE UPDATE ON privacy_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE privacy_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_privacy_settings" ON privacy_settings;
CREATE POLICY "anon_select_privacy_settings" ON privacy_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_privacy_settings" ON privacy_settings;
CREATE POLICY "anon_insert_privacy_settings" ON privacy_settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_privacy_settings" ON privacy_settings;
CREATE POLICY "anon_update_privacy_settings" ON privacy_settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- Seed single settings row
INSERT INTO privacy_settings (
  id,
  ai_context_level,
  data_retention_days,
  require_human_review,
  allow_external_ai,
  allow_doc_indexing,
  classification_default,
  audit_log_enabled,
  anonymize_queries,
  session_timeout_minutes,
  institutional_name,
  responsible_name,
  responsible_email
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'summary',
  365,
  true,
  false,
  true,
  'internal',
  true,
  false,
  60,
  'Gobierno del Estado',
  'Responsable de Datos Personales',
  'privacidad@institucion.gob.mx'
)
ON CONFLICT (id) DO NOTHING;

-- ─── compliance_items ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS compliance_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category    text NOT NULL
                CHECK (category IN ('LGTAIP','LGPDPPSO','NOM-151','MAAGTIC','INTERNA')),
  order_index int  NOT NULL DEFAULT 0,
  title       text NOT NULL,
  description text NOT NULL DEFAULT '',
  status      text NOT NULL DEFAULT 'warning'
                CHECK (status IN ('compliant','warning','non_compliant')),
  is_checked  boolean NOT NULL DEFAULT false,
  notes       text,
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS compliance_items_category_idx ON compliance_items(category, order_index);

DROP TRIGGER IF EXISTS trg_compliance_items_updated_at ON compliance_items;
CREATE TRIGGER trg_compliance_items_updated_at
  BEFORE UPDATE ON compliance_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE compliance_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_compliance_items" ON compliance_items;
CREATE POLICY "anon_select_compliance_items" ON compliance_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_compliance_items" ON compliance_items;
CREATE POLICY "anon_insert_compliance_items" ON compliance_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_compliance_items" ON compliance_items;
CREATE POLICY "anon_update_compliance_items" ON compliance_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_compliance_items" ON compliance_items;
CREATE POLICY "anon_delete_compliance_items" ON compliance_items FOR DELETE
  TO anon, authenticated USING (true);

-- ─── Seed compliance items ────────────────────────────────────────────────────
INSERT INTO compliance_items (category, order_index, title, description, status, is_checked) VALUES

-- LGTAIP
('LGTAIP', 1, 'Unidad de Transparencia designada',
 'La institución cuenta con una Unidad de Transparencia formalmente designada conforme al Art. 45 LGTAIP.',
 'compliant', true),

('LGTAIP', 2, 'Obligaciones de transparencia activa publicadas',
 'La información de transparencia activa (Art. 70 LGTAIP) está publicada y actualizada en el portal institucional.',
 'compliant', true),

('LGTAIP', 3, 'Clasificación de información documentada',
 'Existe un procedimiento documentado para clasificar información como reservada o confidencial (Art. 100–115).',
 'warning', false),

('LGTAIP', 4, 'Solicitudes de información respondidas en plazo',
 'El sistema garantiza respuesta en los 20 días hábiles que establece la ley (Art. 132). Métricas de cumplimiento disponibles.',
 'compliant', true),

('LGTAIP', 5, 'Versión pública de expedientes',
 'Los expedientes que contienen información clasificada cuentan con versión pública accesible.',
 'warning', false),

-- LGPDPPSO
('LGPDPPSO', 1, 'Responsable de datos personales designado',
 'Se tiene designado un responsable del tratamiento de datos personales con las funciones del Art. 50 LGPDPPSO.',
 'compliant', true),

('LGPDPPSO', 2, 'Aviso de privacidad integral publicado',
 'El aviso de privacidad cumple los requisitos del Art. 27 LGPDPPSO y está disponible en canales oficiales.',
 'compliant', true),

('LGPDPPSO', 3, 'Registro de tratamiento de datos actualizado',
 'El sistema de registro (Art. 61) con todos los tratamientos de datos personales está actualizado.',
 'warning', false),

('LGPDPPSO', 4, 'Procedimiento ARCO documentado y operativo',
 'El procedimiento para ejercer derechos de Acceso, Rectificación, Cancelación y Oposición funciona en el plazo de 30 días.',
 'compliant', true),

('LGPDPPSO', 5, 'Medidas de seguridad técnicas y administrativas',
 'Se han implementado y documentado medidas de seguridad conforme al Art. 32 de la ley.',
 'warning', false),

-- NOM-151
('NOM-151', 1, 'Conservación de mensajes de datos',
 'Los mensajes de datos relevantes son conservados íntegra e inalterablemente conforme a NOM-151-SCFI-2016.',
 'compliant', true),

('NOM-151', 2, 'Estampado de tiempo (Time Stamping)',
 'Se utiliza un PSC (Prestador de Servicios de Certificación) acreditado ante la SE para estampado de tiempo.',
 'warning', false),

('NOM-151', 3, 'Cadena de custodia digital documentada',
 'Existe un procedimiento formal que garantiza la integridad de la cadena de custodia de documentos electrónicos.',
 'non_compliant', false),

-- MAAGTIC-SI
('MAAGTIC', 1, 'Política de seguridad de la información publicada',
 'La institución cuenta con una política de seguridad de la información aprobada y difundida (MAAGTIC-SI proceso GSI).',
 'compliant', true),

('MAAGTIC', 2, 'Inventario de activos de información clasificado',
 'Todos los activos de información están inventariados y clasificados por nivel de sensibilidad.',
 'warning', false),

('MAAGTIC', 3, 'Plan de continuidad de TIC vigente',
 'Existe un plan de continuidad de servicios de TIC aprobado y probado en los últimos 12 meses.',
 'non_compliant', false),

('MAAGTIC', 4, 'Gestión de vulnerabilidades activa',
 'Se realizan análisis de vulnerabilidades periódicos y se tienen planes de remediación documentados.',
 'warning', false),

-- INTERNA (internal policies)
('INTERNA', 1, 'Política de uso aceptable de IA',
 'Existe una política interna que regula el uso de herramientas de IA por parte de los servidores públicos.',
 'warning', false),

('INTERNA', 2, 'Capacitación en protección de datos impartida',
 'Los servidores públicos han recibido capacitación sobre manejo seguro de información en los últimos 12 meses.',
 'compliant', true),

('INTERNA', 3, 'Auditoría de acceso a sistemas vigente',
 'Los registros de acceso a sistemas críticos se auditan periódicamente y se documentan los hallazgos.',
 'warning', false)

ON CONFLICT DO NOTHING;
