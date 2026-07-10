import { useEffect, useState } from 'react';
import { Globe, Lock, ShieldAlert, Info, AlertTriangle, Check, Bot, Zap, Users, Server } from 'lucide-react';
import { supabase, type AiModelWithProvider } from '../lib/supabase';

export type Privacy = 'publica' | 'interna' | 'confidencial';

const PRIVACY_OPTIONS: { value: Privacy; label: string; desc: string; icon: typeof Globe }[] = [
  { value: 'publica',      label: 'Pública',      desc: 'Visible para todos',              icon: Globe       },
  { value: 'interna',      label: 'Interna',       desc: 'Solo personal de la institución', icon: Lock        },
  { value: 'confidencial', label: 'Confidencial',  desc: 'Solo personas autorizadas',       icon: ShieldAlert },
];

const PROVIDER_ICONS: Record<string, typeof Bot> = {
  anthropic: Bot,
  groq:      Zap,
  together:  Users,
  ollama:    Server,
};

interface Props {
  selectedModelId: string | null;
  privacyLevel: Privacy;
  onPrivacyChange: (level: Privacy) => void;
  useDocs: boolean;
  onUseDocsChange: (v: boolean) => void;
}

export default function PrivacySelector({
  selectedModelId,
  privacyLevel,
  onPrivacyChange,
  useDocs,
  onUseDocsChange,
}: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [activeModel, setActiveModel] = useState<AiModelWithProvider | null>(null);

  useEffect(() => {
    if (!selectedModelId) return;
    supabase
      .from('ai_models')
      .select('*, ai_providers(*)')
      .eq('id', selectedModelId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setActiveModel(data as AiModelWithProvider);
      });
  }, [selectedModelId]);

  const ActiveIcon = activeModel ? (PROVIDER_ICONS[activeModel.ai_providers.provider_key] ?? Bot) : Bot;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-bold text-[#0d2240]">Antes de generar</h2>
        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="text-gray-400 hover:text-[#1e3a5f] transition-colors"
          >
            <Info size={15} />
          </button>
          {showTooltip && (
            <div className="absolute left-5 top-0 z-20 w-60 bg-[#0d2240] text-white text-xs rounded-xl p-3 shadow-xl leading-relaxed">
              El nivel de privacidad se incluye en las instrucciones enviadas a la IA. "Usar mis documentos" inyecta el contenido relevante de tus documentos como contexto adicional.
            </div>
          )}
        </div>
      </div>

      {/* Privacy level */}
      <div className="space-y-1.5">
        {PRIVACY_OPTIONS.map(({ value, label, desc, icon: Icon }) => (
          <button
            key={value}
            onClick={() => onPrivacyChange(value)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all duration-150 ${
              privacyLevel === value
                ? value === 'confidencial'
                  ? 'border-red-300 bg-red-50 text-red-800'
                  : 'border-[#1e3a5f] bg-[#f0f5ff] text-[#0d2240]'
                : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
              privacyLevel === value
                ? value === 'confidencial' ? 'bg-red-100' : 'bg-[#1e3a5f]'
                : 'bg-gray-100'
            }`}>
              <Icon size={14} className={
                privacyLevel === value
                  ? value === 'confidencial' ? 'text-red-600' : 'text-white'
                  : 'text-gray-400'
              } />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold block">{label}</span>
              <span className="text-xs text-gray-400">{desc}</span>
            </div>
            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
              privacyLevel === value
                ? value === 'confidencial' ? 'border-red-500 bg-red-500' : 'border-[#1e3a5f] bg-[#1e3a5f]'
                : 'border-gray-300'
            }`}>
              {privacyLevel === value && <span className="w-1.5 h-1.5 bg-white rounded-full block" />}
            </div>
          </button>
        ))}
      </div>

      {/* Confidential alert */}
      {privacyLevel === 'confidencial' && (
        <div className="mt-2.5 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
          <AlertTriangle size={15} className="text-red-500 flex-shrink-0" />
          <span className="text-xs font-semibold text-red-700">Modo de mayor protección activado.</span>
        </div>
      )}

      {/* Use my documents */}
      <div className="mt-4 border-t border-gray-100 pt-4">
        <button
          onClick={() => onUseDocsChange(!useDocs)}
          className="w-full flex items-start gap-3 text-left group"
        >
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
            useDocs ? 'bg-[#1e3a5f] border-[#1e3a5f]' : 'border-gray-300 group-hover:border-[#1e3a5f]'
          }`}>
            {useDocs && <Check size={12} className="text-white" strokeWidth={3} />}
          </div>
          <div>
            <span className="text-xs font-semibold text-[#0d2240] block">Usar mis documentos</span>
            <span className="text-xs text-gray-500 leading-relaxed">
              La IA buscará en tus documentos y usará el contenido relevante como contexto adicional.
            </span>
          </div>
        </button>
      </div>

      {/* AI Model display */}
      <div className="mt-4 border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#0d2240]">Modelo de IA</span>
          <span className="text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Activo
          </span>
        </div>
        {activeModel ? (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-[#1e3a5f] bg-[#f0f5ff]">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#1e3a5f]">
              <ActiveIcon size={14} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold block text-[#1e3a5f]">{activeModel.display_name}</span>
              <span className="text-[10px] text-gray-400 truncate block">{activeModel.ai_providers.name}</span>
            </div>
          </div>
        ) : (
          <div className="px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-center">
            <span className="text-xs text-gray-400">Sin modelo configurado</span>
          </div>
        )}
        <p className="text-[10px] text-gray-400 mt-2 text-center leading-relaxed">
          Cambia el modelo en <span className="font-semibold text-[#1e3a5f]">Ajustes → Modelos</span>
        </p>
      </div>
    </div>
  );
}
