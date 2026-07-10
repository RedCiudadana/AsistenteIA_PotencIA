/*
# Add search_country to app_settings

## Summary
Adds a new column `search_country` to the `app_settings` table to configure
the geographic scope of AI assistant responses. The default value is
'Guatemala', meaning all AI responses will be focused on that country's
legal framework, norms, and institutional context.

## New Columns
### app_settings
- `search_country` (text, NOT NULL, DEFAULT 'Guatemala') —
  Defines the country scope for AI assistant responses. Responses will be
  contextualized to this country's laws, regulations, and institutional
  framework.

## Security
- No changes to existing RLS policies. The table already has full CRUD
  policies for `anon, authenticated`.

## Notes
1. Idempotent — uses DO $$ block to check column existence before adding.
2. Existing rows are backfilled with 'Guatemala' via the column DEFAULT.
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'app_settings' AND column_name = 'search_country'
  ) THEN
    ALTER TABLE app_settings
      ADD COLUMN search_country text NOT NULL DEFAULT 'Guatemala';
  END IF;
END $$;
