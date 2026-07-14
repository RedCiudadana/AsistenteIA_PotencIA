import { Bot, MessageSquare, BookOpen, Zap, Plus, Trash2, Globe } from 'lucide-react';
import type { AppSettings } from '../../lib/supabase';

const COUNTRY_OPTIONS = ['Guatemala'];

const COUNTRY_FLAGS: Record<string, string> = {
  'Guatemala': '🇬🇹',
};

const STYLE_OPTIONS: { value: AppSettings['response_style']; label: string; desc: string; icon: string }[] = [
  { value: 'muy_formal', label: 'Muy formal',  icon: '🏛️', desc: 'Lenguaje protocolar estricto. Ideal para comunicaciones oficiales de alto nivel.' },
  { value: 'formal',     label: 'Formal',      icon: '📋', desc: 'Tono institucional estándar. Recomendado para la mayoría de documentos oficiales.' },
  { value: 'semiformal', label: 'Semiformal',  icon: '💬', desc: 'Lenguaje claro y accesible manteniendo el respeto institucional.' },
];

function ToggleRow({ label, desc, checked, onChange }: {
  label: string; desc: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <div className="flex-1">
        <p className="text-sm font-semibold text-[#0d2240]">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-all flex-shrink-0 mt-0.5 ${checked ? 'bg-[#1e3a5f]' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? 'left-5' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

interface Props {
  draft: AppSettings;
  onChange: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

export default function AssistantSection({ draft, onChange }: Props) {
  const actions: string[] = Array.isArray(draft.quick_actions) ? draft.quick_actions : [];

  function updateActions(updated: string[]) {
    onChange('quick_actions', updated);
  }

  function addAction() {
    if (actions.length >= 6) return;
    updateActions([...actions, '']);
  }

  function editAction(idx: number, value: string) {
    const updated = [...actions];
    updated[idx] = value;
    updateActions(updated);
  }

  function removeAction(idx: number) {
    updateActions(actions.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-6">
      {/* Identity */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Bot size={16} className="text-[#2563eb]" />
          <h3 className="text-sm font-bold text-[#0d2240]">Identidad del asistente</h3>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nombre del asistente</label>
            <input
              value={draft.ai_name}
              onChange={(e) => onChange('ai_name', e.target.value)}
              placeholder="Asistente IA"
              maxLength={40}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
            />
            <p className="text-[10px] text-gray-400 mt-1">{draft.ai_name.length}/40 · Aparece en el encabezado del chat y en el saludo inicial.</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Descripción del rol</label>
            <textarea
              value={draft.ai_role}
              onChange={(e) => onChange('ai_role', e.target.value)}
              rows={3}
              placeholder="Describe la función del asistente..."
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] resize-none transition-all"
            />
            <p className="text-[10px] text-gray-400 mt-1">Este texto se incluye en el saludo inicial y en el mensaje del sistema enviado a la IA.</p>
          </div>
        </div>
      </div>

      {/* Search scope — country */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Globe size={16} className="text-[#2563eb]" />
          <h3 className="text-sm font-bold text-[#0d2240]">Alcance de búsqueda</h3>
        </div>
        <div className="px-5 py-5 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">País de referencia</label>
            <div className="relative">
              <select
                value={draft.search_country}
                onChange={(e) => onChange('search_country', e.target.value)}
                className="w-full appearance-none pl-10 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all bg-white cursor-pointer font-medium text-[#0d2240]"
              >
                {COUNTRY_OPTIONS.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base pointer-events-none">
                {COUNTRY_FLAGS[draft.search_country] ?? '🌐'}
              </span>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="flex items-start gap-2.5 bg-blue-50/60 border border-blue-100 rounded-xl px-3.5 py-3">
            <Globe size={14} className="text-[#2563eb] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600 leading-relaxed">
              Las respuestas del asistente se focalizarán en el marco normativo, institucional y
              legal de <strong className="text-[#0d2240]">{draft.search_country}</strong>. Esto
              incluye leyes, reglamentos, plazos y procedimientos específicos de ese país.
            </p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-[#2563eb]" />
            <h3 className="text-sm font-bold text-[#0d2240]">Acciones rápidas</h3>
          </div>
          <span className="text-[10px] text-gray-400">{actions.length}/6</span>
        </div>
        <div className="px-5 py-5 space-y-2">
          <p className="text-xs text-gray-500 mb-3">
            Se muestran como botones en el panel del asistente. Al hacer clic, el texto se inserta directamente en el campo de entrada.
          </p>
          {actions.map((action, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs text-gray-300 w-4 text-right flex-shrink-0">{idx + 1}</span>
              <input
                value={action}
                onChange={(e) => editAction(idx, e.target.value)}
                placeholder={`Ej. Redactar un oficio`}
                maxLength={60}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
              />
              <button
                onClick={() => removeAction(idx)}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {actions.length < 6 && (
            <button
              onClick={addAction}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-[#1e3a5f] border-2 border-dashed border-[#dbeafe] rounded-xl hover:bg-[#f0f5ff] transition-colors mt-1"
            >
              <Plus size={13} />
              Agregar acción
            </button>
          )}
        </div>
      </div>

      {/* Response style */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <MessageSquare size={16} className="text-[#2563eb]" />
          <h3 className="text-sm font-bold text-[#0d2240]">Estilo de respuesta</h3>
        </div>
        <div className="px-5 py-5">
          <div className="grid grid-cols-3 gap-3">
            {STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange('response_style', opt.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  draft.response_style === opt.value
                    ? 'border-[#1e3a5f] bg-[#f0f5ff]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">{opt.icon}</div>
                <p className={`text-xs font-bold mb-1 ${draft.response_style === opt.value ? 'text-[#1e3a5f]' : 'text-gray-700'}`}>
                  {opt.label}
                </p>
                <p className="text-[10px] text-gray-400 leading-relaxed">{opt.desc}</p>
              </button>
            ))}
          </div>

          {/* Style preview */}
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Ejemplo de respuesta</p>
            <p className="text-xs text-gray-600 leading-relaxed italic">
              {draft.response_style === 'muy_formal'
                ? '"En atención a la solicitud formulada, me permito informar a Usted que de conformidad con lo establecido en el artículo 45 de la Ley General de Transparencia..."'
                : draft.response_style === 'formal'
                ? '"Con respecto a su solicitud, le informamos que según el artículo 45 de la LGTAIP, la institución está obligada a..."'
                : '"Claro, en cuanto a su pregunta: el artículo 45 de la LGTAIP establece que la institución debe..."'}
            </p>
          </div>
        </div>
      </div>

      {/* Behaviour toggles */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Zap size={16} className="text-[#2563eb]" />
          <h3 className="text-sm font-bold text-[#0d2240]">Comportamiento de la IA</h3>
        </div>
        <div className="px-5 py-4 divide-y divide-gray-50">
          <ToggleRow
            label="Citar fuentes y artículos"
            desc="El asistente incluye referencias a leyes, artículos y normativas relevantes en sus respuestas."
            checked={draft.ai_cite_sources}
            onChange={(v) => onChange('ai_cite_sources', v)}
          />
          <ToggleRow
            label="Sugerir acciones siguientes"
            desc="Al finalizar una respuesta, el asistente propone los próximos pasos o documentos relacionados."
            checked={draft.ai_suggest_next}
            onChange={(v) => onChange('ai_suggest_next', v)}
          />
          <ToggleRow
            label="Permitir uso de emojis"
            desc="El asistente puede usar emojis para hacer las respuestas más legibles. No recomendado para documentos oficiales."
            checked={draft.ai_use_emojis}
            onChange={(v) => onChange('ai_use_emojis', v)}
          />
        </div>
      </div>

      {/* Live preview */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <BookOpen size={16} className="text-[#2563eb]" />
          <h3 className="text-sm font-bold text-[#0d2240]">Vista previa en el chat</h3>
          <span className="ml-auto text-[10px] text-[#2563eb] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full font-semibold">
            En tiempo real
          </span>
        </div>
        <div className="px-5 py-4 space-y-3 bg-gray-50/50">
          {/* User message */}
          <div className="flex justify-end">
            <div className="bg-[#1e3a5f] text-white text-xs rounded-2xl rounded-tr-sm px-3 py-2 max-w-xs">
              ¿Cuál es el plazo para responder una solicitud de información?
            </div>
          </div>
          {/* AI message */}
          <div className="flex gap-2">
            <div className="w-7 h-7 bg-[#1e3a5f] rounded-full flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-gray-500 mb-1">{draft.ai_name || 'Asistente IA'}</p>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-3 py-2 text-xs text-gray-700 leading-relaxed">
                {draft.response_style === 'muy_formal'
                  ? 'De conformidad con el artículo 132 de la LGTAIP, el plazo es de 20 días hábiles.'
                  : draft.response_style === 'formal'
                  ? 'Según el Art. 132 LGTAIP, tiene 20 días hábiles para responder.'
                  : 'El plazo es de 20 días hábiles (Art. 132 LGTAIP).'}
                {draft.ai_use_emojis && ' ✅'}
                {draft.ai_suggest_next && (
                  <span className="block mt-1.5 text-[#2563eb] text-[10px]">→ ¿Quieres generar la respuesta ahora?</span>
                )}
              </div>
            </div>
          </div>
          {/* System prompt preview */}
          <div className="mt-2 pt-3 border-t border-gray-200">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Mensaje del sistema generado</p>
            <p className="text-[10px] text-gray-500 italic leading-relaxed bg-gray-100 rounded-lg px-2.5 py-2">
              "Eres {draft.ai_name || 'Asistente IA'}, {draft.ai_role || '…'}
              {draft.ai_cite_sources ? ' Incluye referencias normativas.' : ''}
              {draft.ai_suggest_next ? ' Sugiere acciones de seguimiento.' : ''}
              {!draft.ai_use_emojis ? ' No uses emojis.' : ''}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
