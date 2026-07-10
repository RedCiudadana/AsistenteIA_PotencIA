/*
# Documents Management Schema

## Summary
Creates the document management system for the Red Ciudadana AI assistant platform.
This is a single-tenant (no auth) schema — policies allow anon + authenticated access.

## New Tables

### 1. document_categories
Stores user-defined categories for organizing documents.
- `id` — UUID primary key
- `name` — Category name (unique, required)
- `color` — Hex color string for UI badge (default teal)
- `description` — Optional text description
- `doc_count` — Computed via view; not stored here
- `created_at` — Timestamp

### 2. documents
Stores document metadata. Actual file content is not stored (upload is simulated in the MVP).
- `id` — UUID primary key
- `name` — Document name (without extension)
- `ext` — File extension: pdf, docx, xlsx, txt
- `size_label` — Human-readable file size string (e.g. "1.2 MB")
- `size_bytes` — Numeric size for sorting
- `category_id` — Nullable FK to document_categories; NULL means "Sin categoría"
- `description` — Optional notes about the document
- `tags` — Array of free-form text tags
- `status` — active | archived (default active)
- `created_at`, `updated_at` — Timestamps

## Security
- RLS enabled on both tables.
- Policies use `TO anon, authenticated` because the app has no sign-in screen.
- All CRUD allowed for both roles — data is institutional/shared.

## Notes
1. Foreign key from documents.category_id → document_categories.id uses ON DELETE SET NULL
   so deleting a category never loses the documents, just unassigns them.
2. update_updated_at trigger keeps `updated_at` fresh automatically.
3. All statements are idempotent (IF NOT EXISTS / DROP POLICY IF EXISTS).
*/

-- ─── Trigger function ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── document_categories ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS document_categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  color       text NOT NULL DEFAULT '#0d9488',
  description text,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_document_categories" ON document_categories;
CREATE POLICY "anon_select_document_categories" ON document_categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_document_categories" ON document_categories;
CREATE POLICY "anon_insert_document_categories" ON document_categories FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_document_categories" ON document_categories;
CREATE POLICY "anon_update_document_categories" ON document_categories FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_document_categories" ON document_categories;
CREATE POLICY "anon_delete_document_categories" ON document_categories FOR DELETE
  TO anon, authenticated USING (true);

-- ─── documents ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  ext          text NOT NULL CHECK (ext IN ('pdf','docx','xlsx','txt')),
  size_label   text NOT NULL DEFAULT '—',
  size_bytes   bigint NOT NULL DEFAULT 0,
  category_id  uuid REFERENCES document_categories(id) ON DELETE SET NULL,
  description  text,
  tags         text[] NOT NULL DEFAULT '{}',
  status       text NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived')),
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS documents_category_idx ON documents(category_id);
CREATE INDEX IF NOT EXISTS documents_status_idx ON documents(status);
CREATE INDEX IF NOT EXISTS documents_created_at_idx ON documents(created_at DESC);

DROP TRIGGER IF EXISTS trg_documents_updated_at ON documents;
CREATE TRIGGER trg_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_documents" ON documents;
CREATE POLICY "anon_select_documents" ON documents FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_documents" ON documents;
CREATE POLICY "anon_insert_documents" ON documents FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_documents" ON documents;
CREATE POLICY "anon_update_documents" ON documents FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_documents" ON documents;
CREATE POLICY "anon_delete_documents" ON documents FOR DELETE
  TO anon, authenticated USING (true);

-- ─── Seed default categories ──────────────────────────────────────────────────
INSERT INTO document_categories (name, color, description) VALUES
  ('Normativa', '#2563eb', 'Leyes, reglamentos y disposiciones legales'),
  ('Procedimientos', '#0d9488', 'Manuales y guías de procedimientos internos'),
  ('Formatos', '#7c3aed', 'Plantillas y formatos oficiales'),
  ('Transparencia', '#059669', 'Documentos de acceso a la información pública')
ON CONFLICT DO NOTHING;

-- ─── Seed sample documents ────────────────────────────────────────────────────
INSERT INTO documents (name, ext, size_label, size_bytes, description, tags)
VALUES
  ('Manual de procedimientos administrativos', 'pdf', '1.2 MB', 1258291,
   'Manual general de procedimientos para el área administrativa.',
   ARRAY['procedimientos','administración','manual']),
  ('Ley de acceso a la información pública', 'pdf', '890 KB', 911360,
   'Texto completo de la ley de transparencia vigente.',
   ARRAY['ley','transparencia','normativa']),
  ('Formato de oficio estándar', 'docx', '45 KB', 46080,
   'Plantilla oficial para redacción de oficios institucionales.',
   ARRAY['formato','oficio','plantilla']),
  ('Reglamento interno institucional', 'pdf', '2.1 MB', 2202009,
   'Reglamento de organización y funcionamiento interno.',
   ARRAY['reglamento','interno','normas']),
  ('Lineamientos de transparencia', 'pdf', '670 KB', 685875,
   'Lineamientos para el cumplimiento de obligaciones de transparencia.',
   ARRAY['transparencia','lineamientos','obligaciones'])
ON CONFLICT DO NOTHING;

-- ─── Assign seed documents to categories ─────────────────────────────────────
DO $$
DECLARE
  cat_normativa uuid;
  cat_procedimientos uuid;
  cat_formatos uuid;
  cat_transparencia uuid;
BEGIN
  SELECT id INTO cat_normativa      FROM document_categories WHERE name = 'Normativa'       LIMIT 1;
  SELECT id INTO cat_procedimientos FROM document_categories WHERE name = 'Procedimientos'   LIMIT 1;
  SELECT id INTO cat_formatos       FROM document_categories WHERE name = 'Formatos'         LIMIT 1;
  SELECT id INTO cat_transparencia  FROM document_categories WHERE name = 'Transparencia'    LIMIT 1;

  UPDATE documents SET category_id = cat_procedimientos
    WHERE name = 'Manual de procedimientos administrativos' AND category_id IS NULL;

  UPDATE documents SET category_id = cat_normativa
    WHERE name = 'Ley de acceso a la información pública' AND category_id IS NULL;

  UPDATE documents SET category_id = cat_formatos
    WHERE name = 'Formato de oficio estándar' AND category_id IS NULL;

  UPDATE documents SET category_id = cat_normativa
    WHERE name = 'Reglamento interno institucional' AND category_id IS NULL;

  UPDATE documents SET category_id = cat_transparencia
    WHERE name = 'Lineamientos de transparencia' AND category_id IS NULL;
END $$;
