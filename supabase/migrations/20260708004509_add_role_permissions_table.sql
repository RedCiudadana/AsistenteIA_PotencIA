/*
# Add Role Permissions Table

## Overview
Stores which sections each role can access. Allows admins to configure
per-role access from the Settings UI without redeploying.

## New Table: role_permissions
- (role, section): composite primary key
- role: 'coordinador' | 'analista'  (administrador always has full access — not stored)
- section: one of the app sections ('home', 'assistant', 'documents', 'flows', 'stats', 'privacy', 'settings')
- allowed: boolean

## Seed Data
Default permissions matching the original hardcoded matrix:
  coordinador — all sections except 'settings'
  analista    — home, assistant, documents, flows, stats  (not privacy, not settings)

## Security
- RLS enabled.
- SELECT: all authenticated users can read (they need their effective permissions at runtime).
- INSERT / UPDATE / DELETE: admin-only, enforced via existing is_admin() helper.

## Notes
1. 'administrador' rows are not stored — the app always grants admins full access.
2. 'home' defaults to true for both roles; the UI locks it as non-removable.
3. Admins can grant any section to any role, including 'settings'.
*/

CREATE TABLE IF NOT EXISTS role_permissions (
  role    text NOT NULL CHECK (role IN ('coordinador', 'analista')),
  section text NOT NULL,
  allowed boolean NOT NULL DEFAULT false,
  PRIMARY KEY (role, section)
);

ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_role_permissions"   ON role_permissions;
DROP POLICY IF EXISTS "admin_insert_rp"         ON role_permissions;
DROP POLICY IF EXISTS "admin_update_rp"         ON role_permissions;
DROP POLICY IF EXISTS "admin_delete_rp"         ON role_permissions;

CREATE POLICY "read_role_permissions" ON role_permissions FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "admin_insert_rp" ON role_permissions FOR INSERT
  TO authenticated WITH CHECK (is_admin());

CREATE POLICY "admin_update_rp" ON role_permissions FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_delete_rp" ON role_permissions FOR DELETE
  TO authenticated USING (is_admin());

-- Seed default permissions
INSERT INTO role_permissions (role, section, allowed) VALUES
  ('coordinador', 'home',      true),
  ('coordinador', 'assistant', true),
  ('coordinador', 'documents', true),
  ('coordinador', 'flows',     true),
  ('coordinador', 'stats',     true),
  ('coordinador', 'privacy',   true),
  ('coordinador', 'settings',  false),
  ('analista',    'home',      true),
  ('analista',    'assistant', true),
  ('analista',    'documents', true),
  ('analista',    'flows',     true),
  ('analista',    'stats',     true),
  ('analista',    'privacy',   false),
  ('analista',    'settings',  false)
ON CONFLICT (role, section) DO NOTHING;
