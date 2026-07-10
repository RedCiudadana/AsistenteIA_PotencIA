/*
# Flows and Templates Schema (Flujos y Formatos)

## Summary
Creates the Flujos y Formatos management system for the Red Ciudadana AI platform.
This is single-tenant (no auth) — policies allow anon + authenticated access.

## New Tables

### 1. flow_categories
Categories shared across both templates and flows.
- `id` — UUID primary key
- `name` — Category display name
- `color` — Hex color for UI badges
- `applies_to` — 'templates' | 'flows' | 'both'
- `created_at` — Timestamp

### 2. document_templates (Formatos)
Reusable document templates with placeholder variables.
- `id` — UUID primary key
- `title` — Template name
- `description` — Short description of use case
- `category_id` — Nullable FK to flow_categories
- `content` — Template body text with {{variable}} placeholders
- `placeholders` — JSONB array of {key, label, description} for each placeholder
- `tags` — Text array of free-form tags
- `usage_count` — Incremented each time a template is used
- `is_system` — TRUE for built-in templates; user-created = FALSE
- `created_at`, `updated_at` — Timestamps

### 3. workflow_flows (Flujos)
Multi-step administrative workflow definitions.
- `id` — UUID primary key
- `title` — Workflow name
- `description` — What this workflow achieves
- `category_id` — Nullable FK to flow_categories
- `status` — draft | active | archived
- `steps` — JSONB array of step objects: {id, order, title, description, responsible, duration, template_id?}
- `tags` — Text array
- `usage_count` — Incremented each time a flow is started
- `created_at`, `updated_at` — Timestamps

## Security
- RLS enabled on all three tables.
- Policies use `TO anon, authenticated` — no sign-in screen in this app.

## Notes
1. category FK uses ON DELETE SET NULL so deleting a category never destroys items.
2. updated_at is maintained via the existing update_updated_at() trigger function.
3. All statements are idempotent.
4. Seed data includes realistic Mexican public sector templates and workflows.
*/

-- ─── flow_categories ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS flow_categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  color      text NOT NULL DEFAULT '#2563eb',
  applies_to text NOT NULL DEFAULT 'both' CHECK (applies_to IN ('templates','flows','both')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE flow_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_flow_categories" ON flow_categories;
CREATE POLICY "anon_select_flow_categories" ON flow_categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_flow_categories" ON flow_categories;
CREATE POLICY "anon_insert_flow_categories" ON flow_categories FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_flow_categories" ON flow_categories;
CREATE POLICY "anon_update_flow_categories" ON flow_categories FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_flow_categories" ON flow_categories;
CREATE POLICY "anon_delete_flow_categories" ON flow_categories FOR DELETE
  TO anon, authenticated USING (true);

-- ─── document_templates ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS document_templates (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  description  text,
  category_id  uuid REFERENCES flow_categories(id) ON DELETE SET NULL,
  content      text NOT NULL DEFAULT '',
  placeholders jsonb NOT NULL DEFAULT '[]',
  tags         text[] NOT NULL DEFAULT '{}',
  usage_count  integer NOT NULL DEFAULT 0,
  is_system    boolean NOT NULL DEFAULT false,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS document_templates_category_idx ON document_templates(category_id);
CREATE INDEX IF NOT EXISTS document_templates_is_system_idx ON document_templates(is_system);

DROP TRIGGER IF EXISTS trg_document_templates_updated_at ON document_templates;
CREATE TRIGGER trg_document_templates_updated_at
  BEFORE UPDATE ON document_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_document_templates" ON document_templates;
CREATE POLICY "anon_select_document_templates" ON document_templates FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_document_templates" ON document_templates;
CREATE POLICY "anon_insert_document_templates" ON document_templates FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_document_templates" ON document_templates;
CREATE POLICY "anon_update_document_templates" ON document_templates FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_document_templates" ON document_templates;
CREATE POLICY "anon_delete_document_templates" ON document_templates FOR DELETE
  TO anon, authenticated USING (true);

-- ─── workflow_flows ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workflow_flows (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text,
  category_id uuid REFERENCES flow_categories(id) ON DELETE SET NULL,
  status      text NOT NULL DEFAULT 'active' CHECK (status IN ('draft','active','archived')),
  steps       jsonb NOT NULL DEFAULT '[]',
  tags        text[] NOT NULL DEFAULT '{}',
  usage_count integer NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workflow_flows_category_idx ON workflow_flows(category_id);
CREATE INDEX IF NOT EXISTS workflow_flows_status_idx ON workflow_flows(status);

DROP TRIGGER IF EXISTS trg_workflow_flows_updated_at ON workflow_flows;
CREATE TRIGGER trg_workflow_flows_updated_at
  BEFORE UPDATE ON workflow_flows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE workflow_flows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_workflow_flows" ON workflow_flows;
CREATE POLICY "anon_select_workflow_flows" ON workflow_flows FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_workflow_flows" ON workflow_flows;
CREATE POLICY "anon_insert_workflow_flows" ON workflow_flows FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_workflow_flows" ON workflow_flows;
CREATE POLICY "anon_update_workflow_flows" ON workflow_flows FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_workflow_flows" ON workflow_flows;
CREATE POLICY "anon_delete_workflow_flows" ON workflow_flows FOR DELETE
  TO anon, authenticated USING (true);

-- ─── Seed categories ──────────────────────────────────────────────────────────
INSERT INTO flow_categories (name, color, applies_to) VALUES
  ('Correspondencia',  '#2563eb', 'templates'),
  ('Acuerdos',         '#7c3aed', 'templates'),
  ('Informes',         '#0d9488', 'templates'),
  ('Transparencia',    '#059669', 'both'),
  ('Trámites',         '#d97706', 'flows'),
  ('Aprobaciones',     '#dc2626', 'flows'),
  ('Gestión Interna',  '#0891b2', 'flows')
ON CONFLICT DO NOTHING;

-- ─── Seed templates ───────────────────────────────────────────────────────────
DO $$
DECLARE
  cat_corr uuid;
  cat_acrd uuid;
  cat_inf  uuid;
  cat_tran uuid;
BEGIN
  SELECT id INTO cat_corr FROM flow_categories WHERE name = 'Correspondencia' LIMIT 1;
  SELECT id INTO cat_acrd FROM flow_categories WHERE name = 'Acuerdos'        LIMIT 1;
  SELECT id INTO cat_inf  FROM flow_categories WHERE name = 'Informes'        LIMIT 1;
  SELECT id INTO cat_tran FROM flow_categories WHERE name = 'Transparencia'   LIMIT 1;

  INSERT INTO document_templates (title, description, category_id, content, placeholders, tags, is_system)
  VALUES
  (
    'Oficio de Respuesta',
    'Formato estándar para responder solicitudes, peticiones o comunicados oficiales.',
    cat_corr,
    E'{{lugar}}, a {{fecha}}\n\nOFICIO NÚM. {{numero_oficio}}\n\n{{destinatario_nombre}}\n{{destinatario_cargo}}\n{{destinatario_institucion}}\nPresente.\n\nPor medio del presente, y en respuesta al oficio {{oficio_referencia}} de fecha {{fecha_referencia}}, mediante el cual solicita {{asunto_solicitud}}, me permito comunicar a usted lo siguiente:\n\n{{cuerpo_respuesta}}\n\nSin otro particular por el momento, quedo a sus apreciables órdenes.\n\nATENTAMENTE\n\n{{firmante_nombre}}\n{{firmante_cargo}}\n{{firmante_institucion}}',
    '[{"key":"lugar","label":"Lugar","description":"Ciudad de emisión"},{"key":"fecha","label":"Fecha","description":"Fecha completa"},{"key":"numero_oficio","label":"Número de oficio","description":"Folio del oficio"},{"key":"destinatario_nombre","label":"Nombre del destinatario","description":""},{"key":"destinatario_cargo","label":"Cargo del destinatario","description":""},{"key":"destinatario_institucion","label":"Institución destinataria","description":""},{"key":"oficio_referencia","label":"Oficio de referencia","description":"Número del oficio al que se responde"},{"key":"fecha_referencia","label":"Fecha de referencia","description":""},{"key":"asunto_solicitud","label":"Asunto de la solicitud","description":""},{"key":"cuerpo_respuesta","label":"Cuerpo de la respuesta","description":"Contenido principal de la respuesta"},{"key":"firmante_nombre","label":"Nombre del firmante","description":""},{"key":"firmante_cargo","label":"Cargo del firmante","description":""},{"key":"firmante_institucion","label":"Institución del firmante","description":""}]',
    ARRAY['oficio','respuesta','correspondencia'],
    true
  ),
  (
    'Memorando Interno',
    'Comunicación interna entre áreas o funcionarios de la misma institución.',
    cat_corr,
    E'MEMORANDO\n\nFECHA: {{fecha}}\nPARA: {{destinatario_nombre}}, {{destinatario_cargo}}\nDE: {{remitente_nombre}}, {{remitente_cargo}}\nASUNTO: {{asunto}}\n\n{{cuerpo_memorando}}\n\nPor lo anterior, solicito {{accion_solicitada}} a más tardar el {{fecha_limite}}.\n\nQuedo en espera de su respuesta.\n\n{{remitente_nombre}}\n{{remitente_cargo}}',
    '[{"key":"fecha","label":"Fecha","description":""},{"key":"destinatario_nombre","label":"Para (nombre)","description":""},{"key":"destinatario_cargo","label":"Para (cargo)","description":""},{"key":"remitente_nombre","label":"De (nombre)","description":""},{"key":"remitente_cargo","label":"De (cargo)","description":""},{"key":"asunto","label":"Asunto","description":"Tema principal del memorando"},{"key":"cuerpo_memorando","label":"Cuerpo del memorando","description":""},{"key":"accion_solicitada","label":"Acción solicitada","description":"Qué se pide que se haga"},{"key":"fecha_limite","label":"Fecha límite","description":""}]',
    ARRAY['memorando','interno','comunicado'],
    true
  ),
  (
    'Acta de Reunión',
    'Registro formal de los acuerdos y compromisos alcanzados en una reunión.',
    cat_acrd,
    E'ACTA DE REUNIÓN\n\nFecha: {{fecha}}\nHora de inicio: {{hora_inicio}} | Hora de cierre: {{hora_cierre}}\nLugar: {{lugar}}\nPresidió: {{presidente_reunion}}\n\nASISTENTES:\n{{lista_asistentes}}\n\nORDEN DEL DÍA:\n{{orden_del_dia}}\n\nDESARROLLO:\n{{desarrollo_reunion}}\n\nACUERDOS:\n{{acuerdos}}\n\nFECHA PARA PRÓXIMA REUNIÓN: {{proxima_reunion}}\n\n_________________________\n{{firma_presidente}}\n{{cargo_presidente}}',
    '[{"key":"fecha","label":"Fecha","description":""},{"key":"hora_inicio","label":"Hora de inicio","description":""},{"key":"hora_cierre","label":"Hora de cierre","description":""},{"key":"lugar","label":"Lugar","description":""},{"key":"presidente_reunion","label":"Presidente de la reunión","description":""},{"key":"lista_asistentes","label":"Lista de asistentes","description":"Nombres y cargos"},{"key":"orden_del_dia","label":"Orden del día","description":""},{"key":"desarrollo_reunion","label":"Desarrollo de la reunión","description":"Resumen de lo tratado"},{"key":"acuerdos","label":"Acuerdos tomados","description":"Lista numerada de acuerdos"},{"key":"proxima_reunion","label":"Próxima reunión","description":""},{"key":"firma_presidente","label":"Nombre del firmante","description":""},{"key":"cargo_presidente","label":"Cargo del firmante","description":""}]',
    ARRAY['acta','reunión','acuerdos','minuta'],
    true
  ),
  (
    'Informe de Actividades',
    'Reporte periódico de actividades realizadas por un área o funcionario.',
    cat_inf,
    E'INFORME DE ACTIVIDADES\n\nPERÍODO: {{periodo}}\nÁREA: {{area}}\nELABORÓ: {{elaboro}}\nCARGO: {{cargo}}\n\nI. INTRODUCCIÓN\n{{introduccion}}\n\nII. ACTIVIDADES REALIZADAS\n{{actividades_realizadas}}\n\nIII. METAS ALCANZADAS\n{{metas_alcanzadas}}\n\nIV. INCIDENCIAS\n{{incidencias}}\n\nV. CONCLUSIONES Y RECOMENDACIONES\n{{conclusiones}}\n\n_________________________\n{{elaboro}}\n{{cargo}}',
    '[{"key":"periodo","label":"Período del informe","description":"Ej: Enero–Marzo 2026"},{"key":"area","label":"Área","description":""},{"key":"elaboro","label":"Elaboró","description":"Nombre del funcionario"},{"key":"cargo","label":"Cargo","description":""},{"key":"introduccion","label":"Introducción","description":""},{"key":"actividades_realizadas","label":"Actividades realizadas","description":""},{"key":"metas_alcanzadas","label":"Metas alcanzadas","description":""},{"key":"incidencias","label":"Incidencias","description":""},{"key":"conclusiones","label":"Conclusiones","description":""}]',
    ARRAY['informe','actividades','reporte'],
    true
  ),
  (
    'Respuesta a Solicitud de Información',
    'Respuesta formal a solicitudes de acceso a la información pública (LGTAIP).',
    cat_tran,
    E'{{lugar}}, a {{fecha}}\n\nExpediente: {{numero_expediente}}\n\nC. {{nombre_solicitante}}\nPresente.\n\nEn atención a la solicitud de acceso a la información presentada el {{fecha_solicitud}}, con folio {{folio_solicitud}}, mediante la cual solicita: "{{descripcion_solicitud}}", con fundamento en los artículos {{articulos_legales}} de la Ley General de Transparencia y Acceso a la Información Pública, esta Unidad de Transparencia emite la siguiente:\n\nRESPUESTA\n\n{{respuesta}}\n\nLa información solicitada {{estado_informacion}} conforme a lo establecido en el artículo {{articulo_entrega}} de la ley en cita.\n\nATENTAMENTE\n\n{{nombre_titular_ut}}\nTitular de la Unidad de Transparencia\n{{institucion}}',
    '[{"key":"lugar","label":"Lugar","description":""},{"key":"fecha","label":"Fecha","description":""},{"key":"numero_expediente","label":"Número de expediente","description":""},{"key":"nombre_solicitante","label":"Nombre del solicitante","description":""},{"key":"fecha_solicitud","label":"Fecha de la solicitud","description":""},{"key":"folio_solicitud","label":"Folio de solicitud","description":""},{"key":"descripcion_solicitud","label":"Descripción de la solicitud","description":""},{"key":"articulos_legales","label":"Artículos legales","description":""},{"key":"respuesta","label":"Respuesta","description":"Información entregada o razones de clasificación"},{"key":"estado_informacion","label":"Estado de la información","description":"Ej: se entrega en formato PDF"},{"key":"articulo_entrega","label":"Artículo de entrega","description":""},{"key":"nombre_titular_ut","label":"Nombre del titular de UT","description":""},{"key":"institucion","label":"Institución","description":""}]',
    ARRAY['transparencia','solicitud','LGTAIP','acceso a la información'],
    true
  )
  ON CONFLICT DO NOTHING;
END $$;

-- ─── Seed flows ───────────────────────────────────────────────────────────────
DO $$
DECLARE
  cat_tram uuid;
  cat_apro uuid;
  cat_gest uuid;
  cat_tran uuid;
BEGIN
  SELECT id INTO cat_tram FROM flow_categories WHERE name = 'Trámites'        LIMIT 1;
  SELECT id INTO cat_apro FROM flow_categories WHERE name = 'Aprobaciones'    LIMIT 1;
  SELECT id INTO cat_gest FROM flow_categories WHERE name = 'Gestión Interna' LIMIT 1;
  SELECT id INTO cat_tran FROM flow_categories WHERE name = 'Transparencia'   LIMIT 1;

  INSERT INTO workflow_flows (title, description, category_id, status, steps, tags)
  VALUES
  (
    'Atención a Solicitud de Información Pública',
    'Proceso completo para recibir, procesar y responder solicitudes de acceso a la información bajo la LGTAIP.',
    cat_tran,
    'active',
    '[
      {"id":"s1","order":1,"title":"Recepción de solicitud","description":"Recibir la solicitud a través de la Plataforma Nacional de Transparencia (PNT) o de forma presencial. Asignar folio y fecha de ingreso.","responsible":"Unidad de Transparencia","duration":"1 día","required":true},
      {"id":"s2","order":2,"title":"Análisis de competencia","description":"Verificar que la solicitud sea de competencia de la institución. Si no lo es, orientar al solicitante a la institución correspondiente.","responsible":"Titular de la Unidad de Transparencia","duration":"2 días","required":true},
      {"id":"s3","order":3,"title":"Turno a área responsable","description":"Turnar la solicitud al área que genere, posea o administre la información solicitada.","responsible":"Unidad de Transparencia","duration":"1 día","required":true},
      {"id":"s4","order":4,"title":"Búsqueda y localización de información","description":"El área responsable realiza la búsqueda de la información. Si no la localiza, emite declaratoria de inexistencia.","responsible":"Área responsable","duration":"10 días","required":true},
      {"id":"s5","order":5,"title":"Revisión de clasificación","description":"Verificar si la información está clasificada como reservada o confidencial conforme a los artículos 100–115 LGTAIP.","responsible":"Titular de la Unidad de Transparencia","duration":"3 días","required":true},
      {"id":"s6","order":6,"title":"Elaboración de respuesta","description":"Redactar la respuesta formal con la información localizada o con la justificación de reserva/inexistencia.","responsible":"Unidad de Transparencia","duration":"2 días","required":true},
      {"id":"s7","order":7,"title":"Notificación al solicitante","description":"Notificar la respuesta al solicitante a través de la PNT o el medio elegido por el solicitante, dentro del plazo legal de 20 días hábiles.","responsible":"Unidad de Transparencia","duration":"1 día","required":true}
    ]',
    ARRAY['transparencia','LGTAIP','solicitud','acceso a la información']
  ),
  (
    'Proceso de Aprobación de Documento Oficial',
    'Flujo de revisión y validación para documentos que requieren firma de autoridad.',
    cat_apro,
    'active',
    '[
      {"id":"s1","order":1,"title":"Elaboración del borrador","description":"El área responsable elabora el borrador del documento con base en el formato institucional correspondiente.","responsible":"Área emisora","duration":"1–2 días","required":true},
      {"id":"s2","order":2,"title":"Revisión técnica interna","description":"El jefe de área revisa el borrador para verificar coherencia técnica, datos y redacción. Devuelve correcciones si aplica.","responsible":"Jefe de área","duration":"1 día","required":true},
      {"id":"s3","order":3,"title":"Revisión jurídica","description":"El área jurídica revisa el documento para verificar fundamento legal, competencia y redacción normativa.","responsible":"Área jurídica","duration":"2–3 días","required":false},
      {"id":"s4","order":4,"title":"Visto bueno del área directiva","description":"El director o titular del área emite visto bueno al documento revisado.","responsible":"Dirección / Titular","duration":"1 día","required":true},
      {"id":"s5","order":5,"title":"Firma de la autoridad competente","description":"El titular de la institución o quien tenga delegada la firma estampa su firma en el documento.","responsible":"Titular / Autoridad competente","duration":"1 día","required":true},
      {"id":"s6","order":6,"title":"Registro y foliación","description":"El documento firmado se registra en el sistema de control de gestión documental y se asigna folio oficial.","responsible":"Control documental","duration":"1 día","required":true},
      {"id":"s7","order":7,"title":"Envío y resguardo","description":"Se envía al destinatario por el medio oficial y se archiva una copia en el expediente institucional.","responsible":"Área emisora / Archivo","duration":"1 día","required":true}
    ]',
    ARRAY['aprobación','firma','documento','gestión documental']
  ),
  (
    'Trámite de Permiso Administrativo',
    'Proceso para solicitar y obtener un permiso de ausencia, comisión o licencia.',
    cat_tram,
    'active',
    '[
      {"id":"s1","order":1,"title":"Llenado de solicitud","description":"El servidor público llena el formato oficial de solicitud de permiso indicando tipo, fechas y motivo.","responsible":"Servidor público solicitante","duration":"1 día","required":true},
      {"id":"s2","order":2,"title":"Autorización del jefe inmediato","description":"El jefe inmediato revisa la solicitud, verifica disponibilidad operativa y emite autorización o rechazo fundamentado.","responsible":"Jefe inmediato","duration":"1–2 días","required":true},
      {"id":"s3","order":3,"title":"Validación de Recursos Humanos","description":"El área de RRHH valida el saldo de días disponibles, tipos de permiso y cumplimiento de requisitos.","responsible":"Recursos Humanos","duration":"1 día","required":true},
      {"id":"s4","order":4,"title":"Resolución y notificación","description":"Se emite resolución aprobatoria o denegatoria y se notifica al solicitante por escrito.","responsible":"Dirección de Administración","duration":"1 día","required":true},
      {"id":"s5","order":5,"title":"Registro en sistema","description":"Se registra el permiso en el sistema de control de asistencia y expediente personal del servidor público.","responsible":"Recursos Humanos","duration":"1 día","required":true}
    ]',
    ARRAY['permiso','licencia','RRHH','administración']
  ),
  (
    'Atención de Quejas y Denuncias Internas',
    'Proceso para recibir, investigar y resolver quejas o denuncias presentadas contra servidores públicos.',
    cat_gest,
    'active',
    '[
      {"id":"s1","order":1,"title":"Recepción y registro","description":"Recibir la queja o denuncia de forma escrita o verbal. Asignar número de expediente y fecha de ingreso.","responsible":"Órgano Interno de Control","duration":"1 día","required":true},
      {"id":"s2","order":2,"title":"Análisis de admisibilidad","description":"Revisar que la queja cumpla los requisitos de procedencia. Notificar al quejoso si requiere completar información.","responsible":"OIC — Área de Quejas","duration":"3 días","required":true},
      {"id":"s3","order":3,"title":"Notificación al señalado","description":"Notificar al servidor público señalado sobre la queja y otorgar plazo para presentar su versión de los hechos.","responsible":"OIC","duration":"5 días","required":true},
      {"id":"s4","order":4,"title":"Investigación y acopio de pruebas","description":"Realizar diligencias de investigación: recopilación de documentos, entrevistas y peritajes si son necesarios.","responsible":"OIC — Investigador asignado","duration":"20 días","required":true},
      {"id":"s5","order":5,"title":"Audiencia de resolución","description":"Celebrar audiencia con las partes para presentar conclusiones de la investigación y otorgar el derecho de audiencia.","responsible":"OIC — Titular","duration":"5 días","required":true},
      {"id":"s6","order":6,"title":"Emisión de resolución","description":"Emitir resolución fundada y motivada: archivo, amonestación, suspensión, inhabilitación u otras sanciones.","responsible":"OIC — Titular","duration":"5 días","required":true},
      {"id":"s7","order":7,"title":"Notificación y seguimiento","description":"Notificar resolución a las partes y dar seguimiento al cumplimiento de las sanciones o medidas impuestas.","responsible":"OIC","duration":"3 días","required":true}
    ]',
    ARRAY['queja','denuncia','OIC','sanción','servidor público']
  )
  ON CONFLICT DO NOTHING;
END $$;
