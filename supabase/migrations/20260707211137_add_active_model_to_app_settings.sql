-- Add active model reference to app_settings
ALTER TABLE app_settings
  ADD COLUMN IF NOT EXISTS active_model_id uuid REFERENCES ai_models(id);

-- Default to Claude Sonnet 4
UPDATE app_settings
  SET active_model_id = '20000000-0000-0000-0000-000000000001'
  WHERE id = '00000000-0000-0000-0000-000000000002'
    AND active_model_id IS NULL;
