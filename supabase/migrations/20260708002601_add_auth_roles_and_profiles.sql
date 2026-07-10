/*
# Add Authentication Roles and Profiles

## Overview
Adds per-user role-based access control to the platform.

## New Tables

### user_roles
- user_id: UUID PK → auth.users
- role: 'administrador' | 'coordinador' | 'analista'
- assigned_at: timestamp

### profiles
- id: UUID PK → auth.users
- email, full_name, created_at

## New Function: is_admin()
SECURITY DEFINER — bypasses RLS to check if the calling user is an admin.
Must be created AFTER user_roles exists.

## Trigger: on_auth_user_created
Auto-creates profile + assigns role on every sign-up.
First user → administrador; all others → analista.
*/

-- ── 1. user_roles (must exist before is_admin() references it) ───────────────
CREATE TABLE IF NOT EXISTS user_roles (
  user_id     uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role        text NOT NULL DEFAULT 'analista'
                CHECK (role IN ('administrador', 'coordinador', 'analista')),
  assigned_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- ── 2. is_admin() helper (references user_roles) ─────────────────────────────
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
      AND role = 'administrador'
  );
$$;

-- ── 3. user_roles policies ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "select_role"       ON user_roles;
DROP POLICY IF EXISTS "admin_insert_role" ON user_roles;
DROP POLICY IF EXISTS "admin_update_role" ON user_roles;
DROP POLICY IF EXISTS "admin_delete_role" ON user_roles;

CREATE POLICY "select_role" ON user_roles FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "admin_insert_role" ON user_roles FOR INSERT
  TO authenticated WITH CHECK (is_admin());

CREATE POLICY "admin_update_role" ON user_roles FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "admin_delete_role" ON user_roles FOR DELETE
  TO authenticated USING (is_admin());

-- ── 4. profiles ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email      text,
  full_name  text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_profile"     ON profiles;
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "update_profile"     ON profiles;

CREATE POLICY "select_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR is_admin());

CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "update_profile" ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR is_admin())
  WITH CHECK (auth.uid() = id OR is_admin());

-- ── 5. Trigger: auto-assign role + profile on sign-up ────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_count integer;
  v_role        text;
BEGIN
  SELECT COUNT(*) INTO v_admin_count
  FROM user_roles WHERE role = 'administrador';

  v_role := CASE WHEN v_admin_count = 0 THEN 'administrador' ELSE 'analista' END;

  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, v_role)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
