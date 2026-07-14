/*
# Create institution_leads table

## Purpose
Stores contact submissions from the InstitutionCTA popup widget.
Public institutions can express interest in PotencIA pilots or request information
without needing an account — the form is fully public (anon key).

## New Tables
### institution_leads
- `id` (uuid, pk) — auto-generated primary key
- `type` (text, not null) — 'postular' or 'informacion'
- `email` (text, not null) — contact email address
- `whatsapp` (text, nullable) — WhatsApp number, optional
- `message` (text, not null) — institution description and needs
- `created_at` (timestamptz) — submission timestamp

## Security
- RLS enabled.
- INSERT allowed to anon + authenticated (public contact form, no login required).
- SELECT / UPDATE / DELETE intentionally restricted to service-role only.
  Leads are sensitive contact data; only admins with the service key may read them.
*/

CREATE TABLE IF NOT EXISTS institution_leads (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  type       text        NOT NULL CHECK (type IN ('postular', 'informacion')),
  email      text        NOT NULL,
  whatsapp   text,
  message    text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE institution_leads ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit a lead (no login required)
DROP POLICY IF EXISTS "public_insert_leads" ON institution_leads;
CREATE POLICY "public_insert_leads" ON institution_leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
