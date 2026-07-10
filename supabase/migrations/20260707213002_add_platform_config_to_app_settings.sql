-- Add configurable platform identity + quick actions to app_settings
ALTER TABLE app_settings
  ADD COLUMN IF NOT EXISTS platform_name    text    DEFAULT 'Red Ciudadana',
  ADD COLUMN IF NOT EXISTS platform_tagline text    DEFAULT 'Plataforma Institucional',
  ADD COLUMN IF NOT EXISTS quick_actions    jsonb   DEFAULT '["Redactar un oficio", "Resumir un documento", "Buscar normativa vigente", "Crear una plantilla"]';

UPDATE app_settings
  SET platform_name    = COALESCE(platform_name,    'Red Ciudadana'),
      platform_tagline = COALESCE(platform_tagline, 'Plataforma Institucional'),
      quick_actions    = COALESCE(quick_actions,    '["Redactar un oficio", "Resumir un documento", "Buscar normativa vigente", "Crear una plantilla"]')
  WHERE id = '00000000-0000-0000-0000-000000000002';
