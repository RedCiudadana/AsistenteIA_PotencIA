import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import {
  ALL_SECTIONS, buildDefaultPermissions, type AllPermissions,
} from '../lib/permissions';
import type { Section } from '../components/Navbar';

export type UserRole = 'administrador' | 'coordinador' | 'analista';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  allPermissions: AllPermissions | null;
  canAccess: (section: Section) => boolean;
  refreshPermissions: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, fullName: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ── DB permission row from Supabase ───────────────────────────────────────────
interface PermRow { role: string; section: string; allowed: boolean; }

function buildPermissionMap(rows: PermRow[]): AllPermissions {
  const map = buildDefaultPermissions();

  // Reset coordinador + analista to false, then apply DB values
  for (const s of ALL_SECTIONS) {
    map.coordinador[s] = false;
    map.analista[s]    = false;
  }

  for (const row of rows) {
    if (row.role === 'coordinador' || row.role === 'analista') {
      (map[row.role] as Record<string, boolean>)[row.section] = row.allowed;
    }
  }

  // Admin always has full access — not stored in DB
  for (const s of ALL_SECTIONS) map.administrador[s] = true;

  return map;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession]           = useState<Session | null>(null);
  const [role, setRole]                 = useState<UserRole | null>(null);
  const [allPermissions, setAllPerms]   = useState<AllPermissions | null>(null);
  const [loading, setLoading]           = useState(true);

  const fetchPermissions = useCallback(async (): Promise<AllPermissions> => {
    const { data } = await supabase
      .from('role_permissions')
      .select('role, section, allowed');
    const map = buildPermissionMap((data ?? []) as PermRow[]);
    setAllPerms(map);
    return map;
  }, []);

  async function fetchUserData(userId: string) {
    const [{ data: roleData }, perms] = await Promise.all([
      supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle(),
      fetchPermissions(),
    ]);
    setRole((roleData?.role as UserRole) ?? null);
    setAllPerms(perms);
    setLoading(false);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        (async () => {
          await fetchUserData(session.user.id);
        })();
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function canAccess(section: Section): boolean {
    if (!role) return section === 'home';
    if (role === 'administrador') return true;
    const perms = allPermissions ?? buildDefaultPermissions();
    return perms[role]?.[section] ?? false;
  }

  async function refreshPermissions() {
    await fetchPermissions();
  }

  async function signIn(email: string, password: string): Promise<string | null> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  }

  async function signUp(email: string, password: string, fullName: string): Promise<string | null> {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return error?.message ?? null;
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{
      session,
      user: session?.user ?? null,
      role,
      loading,
      allPermissions,
      canAccess,
      refreshPermissions,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
