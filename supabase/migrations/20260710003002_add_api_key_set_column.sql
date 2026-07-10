-- Add a safe boolean column so clients can know if a key is configured
-- without ever reading the actual key value
ALTER TABLE ai_providers ADD COLUMN IF NOT EXISTS api_key_set boolean NOT NULL DEFAULT false;

-- Sync existing rows
UPDATE ai_providers SET api_key_set = (api_key IS NOT NULL AND api_key <> '');

-- Keep api_key_set in sync automatically
CREATE OR REPLACE FUNCTION sync_api_key_set()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  NEW.api_key_set := (NEW.api_key IS NOT NULL AND NEW.api_key <> '');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_api_key_set ON ai_providers;
CREATE TRIGGER trg_sync_api_key_set
  BEFORE INSERT OR UPDATE ON ai_providers
  FOR EACH ROW EXECUTE FUNCTION sync_api_key_set();
