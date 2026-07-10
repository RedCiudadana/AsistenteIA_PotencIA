import { useState } from 'react';
import {
  Home, Bot, FileText, Layers, BarChart2, Shield, Settings,
  RefreshCw, Lock, Info,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../context/AuthContext';
import {
  ALL_SECTIONS, SECTION_LABELS, ALWAYS_ON_SECTIONS,
  ROLE_LABELS, ROLE_COLORS,
} from '../../lib/permissions';
import type { Section } from '../Navbar';

const SECTION_ICONS: Record<Section, typeof Home> = {
  home:      Home,
  assistant: Bot,
  documents: FileText,
  flows:     Layers,
  stats:     BarChart2,
  privacy:   Shield,
  settings:  Settings,
};

const CONFIGURABLE_ROLES: UserRole[] = ['coordinador', 'analista'];

export default function RolesSection() {
  const { allPermissions, refreshPermissions } = useAuth();
  const [saving, setSaving]   = useState<`${string}:${string}` | null>(null);
  const [error, setError]     = useState('');

  async function toggle(role: UserRole, section: Section, newValue: boolean) {
    if (ALWAYS_ON_SECTIONS.includes(section)) return;
    const key = `${role}:${section}` as `${string}:${string}`;
    setSaving(key);
    setError('');

    const { error: err } = await supabase
      .from('role_permissions')
      .upsert({ role, section, allowed: newValue }, { onConflict: 'role,section' });

    if (err) {
      setError('No se pudo guardar el cambio. Intenta de nuevo.');
    } else {
      await refreshPermissions();
    }
    setSaving(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-bold text-[#0d2240]">Control de acceso por rol</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Configura qué secciones puede ver cada rol en la plataforma.
          </p>
        </div>
        <button
          onClick={refreshPermissions}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-[#0d2240] hover:border-[#0d2240] transition-all shadow-sm"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
        {/* Header row */}
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-0">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sección</span>
          </div>
          {(['administrador', ...CONFIGURABLE_ROLES] as UserRole[]).map((r) => {
            const colors = ROLE_COLORS[r];
            return (
              <div key={r} className="px-5 py-3 bg-gray-50 border-b border-l border-gray-100 flex flex-col items-center gap-1 min-w-[130px]">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                  {r === 'administrador' ? 'Admin' : ROLE_LABELS[r].split(' ')[0]}
                </span>
                {r === 'administrador' && (
                  <span className="text-[10px] text-gray-400">Acceso total</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Section rows */}
        {ALL_SECTIONS.map((section, idx) => {
          const Icon     = SECTION_ICONS[section];
          const isLocked = ALWAYS_ON_SECTIONS.includes(section);
          const isLast   = idx === ALL_SECTIONS.length - 1;

          return (
            <div
              key={section}
              className={`grid grid-cols-[1fr_auto_auto_auto] gap-0 ${!isLast ? 'border-b border-gray-50' : ''} hover:bg-gray-50/50 transition-colors`}
            >
              {/* Section label */}
              <div className="px-5 py-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0d2240]">{SECTION_LABELS[section]}</p>
                  {isLocked && (
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <Lock size={9} />
                      Siempre activo
                    </p>
                  )}
                </div>
              </div>

              {/* Admin column — always ✓ */}
              <div className="min-w-[130px] border-l border-gray-100 flex items-center justify-center">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#0d2240]/10">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#0d2240]" />
                </div>
              </div>

              {/* Coordinador + Analista toggles */}
              {CONFIGURABLE_ROLES.map((r) => {
                const allowed  = allPermissions?.[r]?.[section] ?? false;
                const key      = `${r}:${section}` as `${string}:${string}`;
                const isSaving = saving === key;

                return (
                  <div key={r} className="min-w-[130px] border-l border-gray-100 flex items-center justify-center py-4">
                    {isLocked ? (
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-teal-100">
                        <div className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                      </div>
                    ) : (
                      <Toggle
                        checked={allowed}
                        loading={isSaving}
                        onChange={(v) => toggle(r, section, v)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#0d2240]/10">
            <div className="w-2.5 h-2.5 rounded-full bg-[#0d2240]" />
          </div>
          Acceso concedido (no editable)
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Lock size={11} className="text-gray-400" />
          Permiso fijo — no puede desactivarse
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Info size={11} className="text-gray-400" />
          Los cambios toman efecto al próximo inicio de sesión
        </div>
      </div>
    </div>
  );
}

// ── Toggle switch component ────────────────────────────────────────────────────

function Toggle({ checked, onChange, loading }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  loading: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => !loading && onChange(!checked)}
      disabled={loading}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#1e3a5f]/30 ${
        checked ? 'bg-[#1e3a5f]' : 'bg-gray-200'
      } ${loading ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:opacity-90'}`}
    >
      {loading ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-3.5 h-3.5 border border-white/60 border-t-transparent rounded-full animate-spin" />
        </span>
      ) : (
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      )}
    </button>
  );
}
