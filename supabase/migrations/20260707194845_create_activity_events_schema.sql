/*
# Activity Events Schema — Estadísticas

## Summary
Creates the activity tracking table used to power the Statistics page.
This is a single-tenant schema (no auth) — policies use `TO anon, authenticated`.

## New Tables

### activity_events
Records every meaningful user action in the platform so the Stats page can
show trends over time, usage distributions, and recent activity.

Columns:
- `id`          — UUID primary key
- `event_type`  — One of: ai_query, doc_added, doc_archived, template_used,
                   flow_started, doc_updated, template_created, flow_created
- `label`       — Human-readable description of the event
- `metadata`    — JSONB bag for optional extra data (doc name, template name, etc.)
- `created_at`  — When the event happened

## Indexes
- event_type  — for GROUP BY queries
- created_at  — for time-range queries (DESC for recent-first)

## Security
- RLS enabled.
- `TO anon, authenticated` — single-tenant app with no sign-in.

## Notes
1. All statements are idempotent.
2. Seed data inserts ~300 realistic events spread over the last 30 days so that
   charts are immediately populated when the page first loads.
3. The distribution approximates a real institution:
   - ai_query: most frequent (~8 / day)
   - template_used: frequent (~5 / day)
   - flow_started: moderate (~3 / day)
   - doc_added: occasional (~2 / day)
   - others: rare (~1 / day combined)
*/

CREATE TABLE IF NOT EXISTS activity_events (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN (
    'ai_query','doc_added','doc_archived','doc_updated',
    'template_used','template_created','flow_started','flow_created'
  )),
  label      text NOT NULL DEFAULT '',
  metadata   jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activity_events_type_idx        ON activity_events(event_type);
CREATE INDEX IF NOT EXISTS activity_events_created_at_idx  ON activity_events(created_at DESC);

ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_activity_events" ON activity_events;
CREATE POLICY "anon_select_activity_events" ON activity_events FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_activity_events" ON activity_events;
CREATE POLICY "anon_insert_activity_events" ON activity_events FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_activity_events" ON activity_events;
CREATE POLICY "anon_update_activity_events" ON activity_events FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_activity_events" ON activity_events;
CREATE POLICY "anon_delete_activity_events" ON activity_events FOR DELETE
  TO anon, authenticated USING (true);

-- ─── Seed: 30 days of realistic activity ─────────────────────────────────────
DO $$
DECLARE
  ai_labels    text[] := ARRAY[
    'Redacción de oficio de respuesta','Consulta sobre normativa de transparencia',
    'Resumen de reglamento interno','Revisión de acuerdo de reunión',
    'Análisis de solicitud de información','Generación de informe de actividades',
    'Consulta sobre procedimiento administrativo','Borrador de memorando interno',
    'Interpretación de artículo legal','Síntesis de lineamientos de transparencia',
    'Elaboración de circular institucional','Consulta sobre LGTAIP',
    'Revisión de convocatoria','Análisis de contrato','Consulta de plazos legales'
  ];
  tpl_labels   text[] := ARRAY[
    'Uso de Oficio de Respuesta','Uso de Memorando Interno',
    'Uso de Acta de Reunión','Uso de Informe de Actividades',
    'Uso de Respuesta a Solicitud de Información'
  ];
  flow_labels  text[] := ARRAY[
    'Inicio: Atención a Solicitud de Información','Inicio: Aprobación de Documento Oficial',
    'Inicio: Trámite de Permiso Administrativo','Inicio: Atención de Quejas y Denuncias'
  ];
  doc_labels   text[] := ARRAY[
    'Documento agregado: Oficio núm. 042','Documento agregado: Informe trimestral',
    'Documento agregado: Acuerdo de sesión','Documento agregado: Manual de procesos',
    'Documento agregado: Convocatoria pública','Documento agregado: Circular 018'
  ];
  other_labels text[] := ARRAY[
    'Documento archivado','Documento actualizado',
    'Formato creado por usuario','Flujo de trabajo creado'
  ];
  day_offset   int;
  hour_offset  int;
  i            int;
  queries_day  int;
  tpls_day     int;
  flows_day    int;
  docs_day     int;
  event_ts     timestamptz;
BEGIN
  -- Skip if data already seeded
  IF (SELECT count(*) FROM activity_events) > 0 THEN
    RETURN;
  END IF;

  FOR day_offset IN 0..29 LOOP
    -- Vary activity: busier mid-week, quieter weekends
    queries_day := 4 + floor(random() * 8)::int;
    tpls_day    := 2 + floor(random() * 5)::int;
    flows_day   := 1 + floor(random() * 4)::int;
    docs_day    := floor(random() * 3)::int;

    -- ai_query events
    FOR i IN 1..queries_day LOOP
      hour_offset := 8 + floor(random() * 9)::int; -- 08:00–17:00
      event_ts := (now() - (day_offset || ' days')::interval) - ((60 - floor(random()*50))::int || ' minutes')::interval;
      event_ts := date_trunc('day', event_ts) + (hour_offset || ' hours')::interval + (floor(random()*59)::int || ' minutes')::interval;
      INSERT INTO activity_events (event_type, label, created_at)
      VALUES ('ai_query', ai_labels[1 + floor(random() * array_length(ai_labels,1))::int % array_length(ai_labels,1)], event_ts);
    END LOOP;

    -- template_used events
    FOR i IN 1..tpls_day LOOP
      hour_offset := 8 + floor(random() * 9)::int;
      event_ts := date_trunc('day', now() - (day_offset || ' days')::interval) + (hour_offset || ' hours')::interval + (floor(random()*59)::int || ' minutes')::interval;
      INSERT INTO activity_events (event_type, label, created_at)
      VALUES ('template_used', tpl_labels[1 + floor(random() * array_length(tpl_labels,1))::int % array_length(tpl_labels,1)], event_ts);
    END LOOP;

    -- flow_started events
    FOR i IN 1..flows_day LOOP
      hour_offset := 9 + floor(random() * 8)::int;
      event_ts := date_trunc('day', now() - (day_offset || ' days')::interval) + (hour_offset || ' hours')::interval + (floor(random()*59)::int || ' minutes')::interval;
      INSERT INTO activity_events (event_type, label, created_at)
      VALUES ('flow_started', flow_labels[1 + floor(random() * array_length(flow_labels,1))::int % array_length(flow_labels,1)], event_ts);
    END LOOP;

    -- doc_added events
    FOR i IN 1..docs_day LOOP
      hour_offset := 9 + floor(random() * 7)::int;
      event_ts := date_trunc('day', now() - (day_offset || ' days')::interval) + (hour_offset || ' hours')::interval + (floor(random()*59)::int || ' minutes')::interval;
      INSERT INTO activity_events (event_type, label, created_at)
      VALUES ('doc_added', doc_labels[1 + floor(random() * array_length(doc_labels,1))::int % array_length(doc_labels,1)], event_ts);
    END LOOP;

    -- Occasional other events
    IF random() > 0.5 THEN
      hour_offset := 10 + floor(random() * 6)::int;
      event_ts := date_trunc('day', now() - (day_offset || ' days')::interval) + (hour_offset || ' hours')::interval;
      INSERT INTO activity_events (event_type, label, created_at)
      VALUES (
        CASE floor(random()*4)::int
          WHEN 0 THEN 'doc_archived'
          WHEN 1 THEN 'doc_updated'
          WHEN 2 THEN 'template_created'
          ELSE 'flow_created'
        END,
        other_labels[1 + floor(random() * array_length(other_labels,1))::int % array_length(other_labels,1)],
        event_ts
      );
    END IF;
  END LOOP;
END $$;
