import { useState, useEffect, useCallback } from 'react';
import { Users, RefreshCw, ChevronDown, AlertCircle, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth, type UserRole } from '../../context/AuthContext';
import { ROLE_LABELS, ROLE_COLORS } from '../../lib/permissions';

interface UserRow {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  assigned_at: string;
}

const ROLE_ORDER: UserRole[] = ['administrador', 'coordinador', 'analista'];

export default function UsersSection() {
  const { user } = useAuth();
  const [users, setUsers]   = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved]   = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');

    const [{ data: profiles, error: pErr }, { data: roles, error: rErr }] = await Promise.all([
      supabase.from('profiles').select('id, email, full_name, created_at'),
      supabase.from('user_roles').select('user_id, role, assigned_at'),
    ]);

    if (pErr || rErr) {
      setError('No se pudieron cargar los usuarios.');
      setLoading(false);
      return;
    }

    const roleMap = Object.fromEntries(
      (roles ?? []).map((r) => [r.user_id, { role: r.role as UserRole, assigned_at: r.assigned_at }])
    );

    const rows: UserRow[] = (profiles ?? []).map((p) => ({
      id:          p.id,
      email:       p.email ?? '',
      full_name:   p.full_name ?? '',
      role:        roleMap[p.id]?.role ?? 'analista',
      assigned_at: roleMap[p.id]?.assigned_at ?? p.created_at,
    }));

    rows.sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role));
    setUsers(rows);
    setLoading(false);
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  async function changeRole(userId: string, newRole: UserRole) {
    if (userId === user?.id) return;
    setSaving(userId);

    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole, assigned_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) {
      setError('No se pudo actualizar el rol.');
    } else {
      setUsers((prev) =>
        prev.map((u) => u.id === userId ? { ...u, role: newRole } : u)
      );
      setSaved(userId);
      setTimeout(() => setSaved(null), 2000);
    }
    setSaving(null);
  }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-bold text-[#0d2240]">Gestión de usuarios</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Administra roles y permisos de acceso a la plataforma.
          </p>
        </div>
        <button
          onClick={loadUsers}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-[#0d2240] hover:border-[#0d2240] transition-all shadow-sm"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12">
          <Users size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No hay usuarios registrados aún.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Usuario</span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rol</span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Desde</span>
          </div>

          {/* Rows */}
          {users.map((u) => {
            const isMe    = u.id === user?.id;
            const isSaving = saving === u.id;
            const wasSaved = saved === u.id;
            const colors  = ROLE_COLORS[u.role];

            return (
              <div
                key={u.id}
                className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
              >
                {/* User info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${colors.bg} ${colors.text}`}>
                    {(u.full_name || u.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#0d2240] truncate">
                      {u.full_name || '(sin nombre)'}
                      {isMe && <span className="ml-2 text-[10px] font-bold bg-blue-100 text-blue-600 rounded-full px-1.5 py-0.5">Tú</span>}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                </div>

                {/* Role selector */}
                <div className="relative">
                  {isMe ? (
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg ${colors.bg} ${colors.text}`}>
                      {ROLE_LABELS[u.role]}
                    </span>
                  ) : (
                    <div className="relative">
                      <select
                        value={u.role}
                        disabled={isSaving}
                        onChange={(e) => changeRole(u.id, e.target.value as UserRole)}
                        className="appearance-none pl-3 pr-8 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white text-[#0d2240] cursor-pointer hover:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all disabled:opacity-50"
                      >
                        {ROLE_ORDER.map((r) => (
                          <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                        ))}
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                        {isSaving ? (
                          <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                        ) : wasSaved ? (
                          <Check size={12} className="text-green-500" />
                        ) : (
                          <ChevronDown size={12} className="text-gray-400" />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Date */}
                <span className="text-xs text-gray-400 whitespace-nowrap">{fmtDate(u.assigned_at)}</span>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4">
        Tu propio rol no puede cambiarse desde aquí. Contacta a otro administrador si necesitas modificarlo.
      </p>
    </div>
  );
}
