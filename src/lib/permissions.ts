import type { UserRole } from '../context/AuthContext';
import type { Section } from '../components/Navbar';

export const ALL_SECTIONS: Section[] = [
  'home', 'assistant', 'documents', 'flows', 'usecases', 'stats', 'privacy', 'settings',
];

export const SECTION_LABELS: Record<Section, string> = {
  home:      'Inicio',
  assistant: 'Asistente IA',
  documents: 'Documentos',
  flows:     'Flujos',
  usecases:  'Casos de uso',
  stats:     'Estadísticas',
  privacy:   'Privacidad',
  settings:  'Ajustes',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  administrador: 'Administrador',
  coordinador:   'Coordinador de área',
  analista:      'Analista',
};

export const ROLE_COLORS: Record<UserRole, { bg: string; text: string; border: string }> = {
  administrador: { bg: 'bg-[#0d2240]',  text: 'text-white', border: 'border-[#0d2240]'  },
  coordinador:   { bg: 'bg-teal-600',   text: 'text-white', border: 'border-teal-600'   },
  analista:      { bg: 'bg-slate-500',  text: 'text-white', border: 'border-slate-500'  },
};

// 'home' is always on for every role — the UI locks this toggle
export const ALWAYS_ON_SECTIONS: Section[] = ['home', 'usecases'];

// Hardcoded defaults used as fallback while DB permissions are loading
export const DEFAULT_ROLE_SECTIONS: Record<UserRole, Section[]> = {
  administrador: ALL_SECTIONS,
  coordinador:   ['home', 'assistant', 'documents', 'flows', 'usecases', 'stats', 'privacy'],
  analista:      ['home', 'assistant', 'documents', 'flows', 'usecases', 'stats'],
};

export type AllPermissions = {
  administrador: Record<Section, boolean>;
  coordinador:   Record<Section, boolean>;
  analista:      Record<Section, boolean>;
};

export function buildDefaultPermissions(): AllPermissions {
  const makeRow = (allowed: Section[]) =>
    Object.fromEntries(ALL_SECTIONS.map((s) => [s, allowed.includes(s)])) as Record<Section, boolean>;

  return {
    administrador: makeRow(ALL_SECTIONS),
    coordinador:   makeRow(DEFAULT_ROLE_SECTIONS.coordinador),
    analista:      makeRow(DEFAULT_ROLE_SECTIONS.analista),
  };
}
