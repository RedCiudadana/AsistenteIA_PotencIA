import { useEffect, useState } from 'react';
import {
  Building2, Bot, Monitor, Cpu, RefreshCw,
  CheckCircle2, Save, Layers, Users, ShieldCheck,
} from 'lucide-react';
import { supabase, type AppSettings } from '../../lib/supabase';
import { useAppSettings } from '../../context/AppSettingsContext';
import { useAuth } from '../../context/AuthContext';
import InstitutionSection from './InstitutionSection';
import AssistantSection from './AssistantSection';
import AppearanceSection from './AppearanceSection';
import AdvancedSection from './AdvancedSection';
import ModelsSection from './ModelsSection';
import UsersSection from './UsersSection';
import RolesSection from './RolesSection';

const SETTINGS_ID = '00000000-0000-0000-0000-000000000002';

type SectionId = 'institution' | 'assistant' | 'models' | 'appearance' | 'advanced' | 'users' | 'roles';

const BASE_NAV: { id: SectionId; label: string; sub: string; icon: typeof Building2 }[] = [
  { id: 'institution', label: 'Institución',   sub: 'Perfil y marca',          icon: Building2  },
  { id: 'assistant',   label: 'Asistente IA',  sub: 'Personalización',         icon: Bot        },
  { id: 'models',      label: 'Modelos de IA', sub: 'Claude, Llama, Ollama…',  icon: Layers     },
  { id: 'appearance',  label: 'Apariencia',    sub: 'Visualización y alertas', icon: Monitor    },
  { id: 'advanced',    label: 'Avanzado',      sub: 'Sistema y datos',         icon: Cpu        },
];

const ADMIN_TABS = [
  { id: 'roles' as SectionId,  label: 'Roles',    sub: 'Control de acceso',  icon: ShieldCheck },
  { id: 'users' as SectionId,  label: 'Usuarios', sub: 'Gestión de cuentas', icon: Users       },
];

const DEFAULT_SETTINGS: Omit<AppSettings, 'id' | 'updated_at' | 'active_model_id'> = {
  institution_name:  'Institución Pública',
  institution_dept:  null,
  institution_state: null,
  institution_website: null,
  institution_email: null,
  platform_name:    'Red Ciudadana',
  platform_tagline: 'Plataforma Institucional',
  ai_name: 'Asistente IA',
  ai_role: 'Asistente institucional para redacción y consulta de documentos oficiales del sector público.',
  response_style: 'formal',
  ai_cite_sources: true,
  ai_suggest_next: true,
  ai_use_emojis: false,
  search_country: 'Guatemala',
  compact_mode: false,
  show_timestamps: true,
  show_typing_indicator: true,
  notify_ai_errors: true,
  notify_new_docs: false,
  notify_flow_complete: true,
  max_context_tokens: 16384,
  enable_telemetry: false,
  show_debug_info: false,
  quick_actions: ['Redactar un oficio', 'Resumir un documento', 'Buscar normativa vigente', 'Crear una plantilla'],
};

export default function SettingsPage() {
  const { refresh: refreshGlobalSettings } = useAppSettings();
  const { role } = useAuth();
  const isAdmin = role === 'administrador';

  const NAV_ITEMS = isAdmin ? [...BASE_NAV, ...ADMIN_TABS] : BASE_NAV;

  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [draft, setDraft] = useState<AppSettings | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>('institution');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function loadSettings() {
    setLoading(true);
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('id', SETTINGS_ID)
      .maybeSingle();
    if (error) {
      setError('No se pudo cargar la configuración.');
    } else if (data) {
      setSettings(data as AppSettings);
      setDraft(data as AppSettings);
    }
    setLoading(false);
  }

  useEffect(() => { loadSettings(); }, []);

  function handleChange<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setDraft((prev) => prev ? { ...prev, [key]: value } : prev);
    setSaved(false);
  }

  async function handleSave() {
    if (!draft) return;
    setSaving(true);
    setError('');
    const { error } = await supabase
      .from('app_settings')
      .update(draft)
      .eq('id', SETTINGS_ID);
    if (error) {
      setError('No se pudo guardar. Intenta de nuevo.');
    } else {
      setSettings({ ...draft });
      setSaved(true);
      refreshGlobalSettings(); // propagate changes to all components immediately
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  function handleDiscard() {
    if (settings) setDraft({ ...settings });
    setError('');
  }

  function handleExport() {
    if (!draft) return;
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'red-ciudadana-ajustes.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleReset() {
    setSaving(true);
    const resetData = { ...DEFAULT_SETTINGS };
    const { error } = await supabase
      .from('app_settings')
      .update(resetData)
      .eq('id', SETTINGS_ID);
    if (!error) {
      await loadSettings();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  const hasChanges = draft && settings && JSON.stringify(draft) !== JSON.stringify(settings);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#1e3a5f] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Cargando ajustes...</p>
        </div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-500 text-sm font-medium mb-3">{error || 'No se encontraron ajustes.'}</p>
          <button onClick={loadSettings} className="flex items-center gap-2 text-sm text-[#2563eb] hover:underline mx-auto">
            <RefreshCw size={14} /> Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden min-h-0">
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="w-60 flex-shrink-0 flex flex-col bg-white border-r border-gray-200 overflow-y-auto">
        <div className="px-4 py-5 border-b border-gray-100">
          <h1 className="text-base font-extrabold text-[#0d2240]">Ajustes</h1>
          <p className="text-xs text-gray-400 mt-0.5">Configuración de la plataforma</p>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {NAV_ITEMS.map(({ id, label, sub, icon: Icon }) => {
            const isActive = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-[#f0f5ff] border border-[#dbeafe]'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isActive ? 'bg-[#1e3a5f]' : 'bg-gray-100'
                }`}>
                  <Icon size={15} className={isActive ? 'text-white' : 'text-gray-400'} />
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-bold leading-tight ${isActive ? 'text-[#1e3a5f]' : 'text-gray-700'}`}>
                    {label}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">{sub}</p>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Save status in sidebar */}
        <div className="px-4 py-4 border-t border-gray-100">
          {hasChanges ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
              <p className="text-[10px] font-semibold text-amber-700">Cambios sin guardar</p>
              <div className="flex gap-2 mt-2">
                <button onClick={handleDiscard}
                  className="flex-1 text-[10px] font-semibold text-gray-500 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  Descartar
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 text-[10px] font-semibold text-white py-1 rounded-lg bg-[#1e3a5f] hover:bg-[#0d2240] transition-colors disabled:opacity-50">
                  {saving ? '...' : 'Guardar'}
                </button>
              </div>
            </div>
          ) : saved ? (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-xl px-3 py-2.5">
              <CheckCircle2 size={14} />
              <span className="text-xs font-semibold">Guardado</span>
            </div>
          ) : (
            <p className="text-[10px] text-gray-400 text-center leading-relaxed">
              Todos los cambios se guardan en la base de datos institucional.
            </p>
          )}
        </div>
      </aside>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Section header — hide Save button for the users section */}
        <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-sm font-extrabold text-[#0d2240]">
              {NAV_ITEMS.find((n) => n.id === activeSection)?.label}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {NAV_ITEMS.find((n) => n.id === activeSection)?.sub}
            </p>
          </div>
          {activeSection !== 'users' && activeSection !== 'roles' && (
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                hasChanges
                  ? 'bg-[#1e3a5f] hover:bg-[#0d2240] text-white hover:shadow-md'
                  : 'bg-gray-100 text-gray-400 cursor-default'
              } disabled:opacity-60`}
            >
              <Save size={15} />
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-xs text-red-600 font-medium flex-shrink-0">
            {error}
          </div>
        )}

        {/* Section content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeSection === 'institution' && (
            <InstitutionSection draft={draft} onChange={handleChange} />
          )}
          {activeSection === 'assistant' && (
            <AssistantSection draft={draft} onChange={handleChange} />
          )}
          {activeSection === 'models' && (
            <ModelsSection
              activeModelId={draft.active_model_id ?? null}
              onActiveModelChange={(id) => handleChange('active_model_id', id)}
            />
          )}
          {activeSection === 'appearance' && (
            <AppearanceSection draft={draft} onChange={handleChange} />
          )}
          {activeSection === 'advanced' && (
            <AdvancedSection draft={draft} onChange={handleChange} onExport={handleExport} onReset={handleReset} />
          )}
          {activeSection === 'users'    && isAdmin && <UsersSection />}
          {activeSection === 'roles'    && isAdmin && <RolesSection />}
          <div className="h-6" />
        </div>
      </div>
    </div>
  );
}
