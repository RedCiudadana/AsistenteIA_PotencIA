import { useEffect, useState } from 'react';
import {
  Bot, Zap, Users, Server, Settings, ChevronDown, ChevronRight,
  CheckCircle2, AlertCircle, Eye, EyeOff, Key, ExternalLink,
  RefreshCw, Cpu, Sparkles,
} from 'lucide-react';
import { supabase, type AiProvider, type AiModel } from '../../lib/supabase';
import { useAppSettings } from '../../context/AppSettingsContext';

const SETTINGS_ID = '00000000-0000-0000-0000-000000000002';

const PROVIDER_META: Record<string, {
  icon: typeof Bot; color: string; bg: string; badge: string; docsUrl: string; keyHint: string;
}> = {
  anthropic: {
    icon: Bot, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100',
    badge: 'Claude', docsUrl: 'https://console.anthropic.com',
    keyHint: 'sk-ant-api03-…',
  },
  openai: {
    icon: Sparkles, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100',
    badge: 'OpenAI', docsUrl: 'https://platform.openai.com/api-keys',
    keyHint: 'sk-…',
  },
  groq: {
    icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50 border-orange-100',
    badge: 'Gratis', docsUrl: 'https://console.groq.com/keys',
    keyHint: 'gsk_…',
  },
  together: {
    icon: Users, color: 'text-green-600', bg: 'bg-green-50 border-green-100',
    badge: 'Nube', docsUrl: 'https://api.together.xyz/settings/api-keys',
    keyHint: 'together-…',
  },
  ollama: {
    icon: Server, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-100',
    badge: 'Local', docsUrl: 'https://ollama.com/download',
    keyHint: 'Sin clave — local',
  },
};

interface ProviderWithModels extends AiProvider {
  ai_models: AiModel[];
}

function StatusChip({ enabled }: { enabled: boolean }) {
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
      enabled
        ? 'bg-green-50 text-green-700 border border-green-200'
        : 'bg-gray-100 text-gray-400 border border-gray-200'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
      {enabled ? 'Habilitado' : 'Deshabilitado'}
    </span>
  );
}

export default function ModelsSection({
  activeModelId,
  onActiveModelChange,
}: {
  activeModelId: string | null;
  onActiveModelChange: (id: string) => void;
}) {
  const { refresh: refreshGlobalSettings } = useAppSettings();
  const [providers, setProviders]   = useState<ProviderWithModels[]>([]);
  const [loading, setLoading]       = useState(true);
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [editKey, setEditKey]       = useState<Record<string, string>>({});
  const [showKey, setShowKey]       = useState<Record<string, boolean>>({});
  const [editUrl, setEditUrl]       = useState<Record<string, string>>({});
  const [saving, setSaving]         = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, 'ok' | 'error' | null>>({});
  const [testMsg, setTestMsg]       = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('ai_providers')
      .select('id, name, provider_key, type, base_url, is_enabled, api_key_set, sort_order, created_at, ai_models(*)')
      .order('sort_order');
    if (data) setProviders(data as ProviderWithModels[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleProvider(p: ProviderWithModels) {
    const next = !p.is_enabled;
    await supabase.from('ai_providers').update({ is_enabled: next }).eq('id', p.id);
    setProviders((prev) => prev.map((x) => x.id === p.id ? { ...x, is_enabled: next } : x));
  }

  async function saveProvider(p: ProviderWithModels) {
    setSaving(p.id);
    const updates: Record<string, unknown> = {};
    if (editKey[p.id] !== undefined) updates.api_key = editKey[p.id] || null;
    if (editUrl[p.id] !== undefined) updates.base_url = editUrl[p.id] || p.base_url;
    if (Object.keys(updates).length) {
      await supabase.from('ai_providers').update(updates).eq('id', p.id);
      const keyWasSet = !!updates.api_key;
      setProviders((prev) => prev.map((x) =>
        x.id === p.id ? { ...x, ...updates, api_key_set: keyWasSet || x.api_key_set } : x
      ));
      setEditKey((prev) => { const n = { ...prev }; delete n[p.id]; return n; });
      setEditUrl((prev) => { const n = { ...prev }; delete n[p.id]; return n; });
      // Auto-enable after saving a key
      if (keyWasSet && !p.is_enabled) {
        await supabase.from('ai_providers').update({ is_enabled: true }).eq('id', p.id);
        setProviders((prev) => prev.map((x) => x.id === p.id ? { ...x, is_enabled: true } : x));
      }
    }
    setSaving(null);
  }

  async function testConnection(p: ProviderWithModels) {
    setSaving(p.id + '-test');
    setTestResult((prev) => ({ ...prev, [p.id]: null }));
    try {
      const model = p.ai_models[0];
      if (!model) throw new Error('Sin modelos configurados.');
      const res = await supabase.functions.invoke('chat', {
        body: { messages: [{ role: 'user', content: 'Di: "OK"' }], model_record_id: model.id },
      });
      if (res.error || res.data?.error) throw new Error(res.data?.error || res.error?.message);
      setTestResult((prev) => ({ ...prev, [p.id]: 'ok' }));
      setTestMsg((prev) => ({ ...prev, [p.id]: `Conexión exitosa · ${p.name}` }));
    } catch (e) {
      setTestResult((prev) => ({ ...prev, [p.id]: 'error' }));
      setTestMsg((prev) => ({ ...prev, [p.id]: (e as Error).message }));
    }
    setSaving(null);
  }

  async function setDefaultModel(modelId: string) {
    await supabase
      .from('app_settings')
      .update({ active_model_id: modelId })
      .eq('id', SETTINGS_ID);
    onActiveModelChange(modelId);
    refreshGlobalSettings();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const allModels = providers.flatMap((p) => p.ai_models.map((m) => ({ ...m, provider: p })));
  const enabledModels = allModels.filter((m) => m.provider.is_enabled);

  return (
    <div className="space-y-6">
      {/* ── Active model picker ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Cpu size={16} className="text-[#2563eb]" />
          <h3 className="text-sm font-bold text-[#0d2240]">Modelo predeterminado</h3>
        </div>
        <div className="px-5 py-5">
          {enabledModels.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">
              Habilita al menos un proveedor para seleccionar el modelo predeterminado.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {enabledModels.map((m) => {
                const meta = PROVIDER_META[m.provider.provider_key] ?? PROVIDER_META['anthropic'];
                const Icon = meta.icon;
                const isActive = m.id === activeModelId;
                return (
                  <button
                    key={m.id}
                    onClick={() => setDefaultModel(m.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      isActive ? 'border-[#1e3a5f] bg-[#f0f5ff]' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isActive ? 'bg-[#1e3a5f]' : 'bg-gray-100'}`}>
                        <Icon size={13} className={isActive ? 'text-white' : 'text-gray-400'} />
                      </div>
                      <span className={`text-[10px] font-bold ${meta.badge === 'Gratis' ? 'text-green-600' : meta.badge === 'OpenAI' ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {meta.badge}
                      </span>
                    </div>
                    <p className={`text-xs font-bold ${isActive ? 'text-[#1e3a5f]' : 'text-gray-700'}`}>{m.display_name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">{m.provider.name}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Provider cards ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Settings size={16} className="text-[#2563eb]" />
          <h3 className="text-sm font-bold text-[#0d2240]">Proveedores configurados</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {providers.map((p) => {
            const meta = PROVIDER_META[p.provider_key] ?? PROVIDER_META['anthropic'];
            const Icon = meta.icon;
            const isExpanded = expanded === p.id;
            const isOllama = p.provider_key === 'ollama';

            return (
              <div key={p.id}>
                {/* Provider row */}
                <div className="px-5 py-4 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border flex-shrink-0 ${meta.bg}`}>
                    <Icon size={17} className={meta.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[#0d2240]">{p.name}</p>
                      <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full border ${
                        meta.badge === 'Gratis' ? 'text-green-700 bg-green-50 border-green-200' :
                        meta.badge === 'OpenAI' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                        'text-gray-500 bg-gray-50 border-gray-200'
                      }`}>{meta.badge}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {p.ai_models.length} modelo{p.ai_models.length !== 1 ? 's' : ''} disponibles
                    </p>
                  </div>
                  <StatusChip enabled={p.is_enabled} />
                  <button
                    onClick={() => setExpanded(isExpanded ? null : p.id)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
                  >
                    {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                  </button>
                </div>

                {/* Expanded config */}
                {isExpanded && (
                  <div className="px-5 pb-5 space-y-4 bg-gray-50/50 border-t border-gray-100">
                    {/* Base URL (openai_compat only) */}
                    {p.type === 'openai_compat' && (
                      <div className="pt-4">
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">URL base del API</label>
                        <input
                          value={editUrl[p.id] ?? p.base_url ?? ''}
                          onChange={(e) => setEditUrl((prev) => ({ ...prev, [p.id]: e.target.value }))}
                          placeholder="https://api.groq.com/openai/v1"
                          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
                        />
                        {isOllama && (
                          <p className="text-[10px] text-gray-400 mt-1">
                            Ollama debe estar corriendo localmente. Cambia la URL si usas un servidor remoto.
                          </p>
                        )}
                      </div>
                    )}

                    {/* API Key */}
                    {!isOllama && (
                      <div className={p.type === 'openai_compat' ? '' : 'pt-4'}>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                            <Key size={11} /> Clave de API
                          </label>
                          <a
                            href={meta.docsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-[#2563eb] hover:underline flex items-center gap-0.5"
                          >
                            Obtener clave <ExternalLink size={9} />
                          </a>
                        </div>
                        <div className="relative">
                          <input
                            type={showKey[p.id] ? 'text' : 'password'}
                            value={editKey[p.id] ?? (p.api_key_set ? '••••••••••••••••' : '')}
                            onChange={(e) => setEditKey((prev) => ({ ...prev, [p.id]: e.target.value }))}
                            onFocus={() => {
                              if (editKey[p.id] === undefined) {
                                setEditKey((prev) => ({ ...prev, [p.id]: '' }));
                              }
                            }}
                            placeholder={meta.keyHint}
                            className="w-full pl-3 pr-9 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowKey((prev) => ({ ...prev, [p.id]: !prev[p.id] }))}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showKey[p.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Test result */}
                    {testResult[p.id] && (
                      <div className={`flex items-start gap-2 text-xs px-3 py-2 rounded-xl ${
                        testResult[p.id] === 'ok'
                          ? 'bg-green-50 border border-green-200 text-green-700'
                          : 'bg-red-50 border border-red-200 text-red-700'
                      }`}>
                        {testResult[p.id] === 'ok'
                          ? <CheckCircle2 size={13} className="flex-shrink-0 mt-0.5" />
                          : <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />}
                        <span className="leading-relaxed">{testMsg[p.id]}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => toggleProvider(p)}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                          p.is_enabled
                            ? 'border-gray-200 text-gray-600 hover:bg-gray-100'
                            : 'border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#f0f5ff]'
                        }`}
                      >
                        {p.is_enabled ? 'Deshabilitar' : 'Habilitar'}
                      </button>
                      <button
                        onClick={() => testConnection(p)}
                        disabled={saving === p.id + '-test'}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <RefreshCw size={11} className={saving === p.id + '-test' ? 'animate-spin' : ''} />
                        Probar
                      </button>
                      <button
                        onClick={() => saveProvider(p)}
                        disabled={
                          saving === p.id ||
                          (editKey[p.id] === undefined && editUrl[p.id] === undefined)
                        }
                        className="flex-1 py-2 rounded-xl text-xs font-semibold bg-[#1e3a5f] hover:bg-[#0d2240] text-white transition-colors disabled:opacity-50"
                      >
                        {saving === p.id ? '...' : 'Guardar'}
                      </button>
                    </div>

                    {/* Models list */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Modelos incluidos</p>
                      <div className="space-y-1">
                        {p.ai_models.map((m) => (
                          <div key={m.id}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs ${
                              m.id === activeModelId
                                ? 'border-[#1e3a5f] bg-[#f0f5ff]'
                                : 'border-gray-200 bg-white'
                            }`}
                          >
                            <span className={`flex-1 font-semibold ${m.id === activeModelId ? 'text-[#1e3a5f]' : 'text-gray-700'}`}>
                              {m.display_name}
                            </span>
                            {m.context_window && (
                              <span className="text-[10px] text-gray-400">
                                {(m.context_window / 1000).toFixed(0)}k ctx
                              </span>
                            )}
                            {m.id === activeModelId
                              ? <span className="text-[10px] font-bold text-[#2563eb]">Activo</span>
                              : p.is_enabled && (
                                <button
                                  onClick={() => setDefaultModel(m.id)}
                                  className="text-[10px] text-gray-400 hover:text-[#1e3a5f] transition-colors"
                                >
                                  Activar
                                </button>
                              )
                            }
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* OpenAI tip */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <Sparkles size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-emerald-800 mb-1">Conectar con OpenAI (GPT-4o)</p>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              Obtén tu clave de API en{' '}
              <strong>platform.openai.com/api-keys</strong>, pégala en el campo de{' '}
              <strong>Clave de API</strong> del proveedor OpenAI y guarda. El proveedor se habilitará automáticamente.
            </p>
          </div>
        </div>
      </div>

      {/* Ollama setup tip */}
      <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <Server size={16} className="text-violet-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-violet-800 mb-1">Conectar con Ollama (modelos locales)</p>
            <p className="text-[11px] text-violet-600 leading-relaxed">
              Instala <strong>Ollama</strong> en tu servidor institucional y ejecuta{' '}
              <code className="bg-violet-100 px-1 rounded">ollama pull llama3.2</code>. Configura la URL base
              y habilita el proveedor. No requiere clave de API.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
