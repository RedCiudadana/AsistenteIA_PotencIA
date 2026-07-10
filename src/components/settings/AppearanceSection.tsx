import { Monitor, Bell } from 'lucide-react';
import type { AppSettings } from '../../lib/supabase';

function ToggleRow({ label, desc, checked, onChange }: {
  label: string; desc: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <div className="flex-1">
        <p className="text-sm font-semibold text-[#0d2240]">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
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

export default function AppearanceSection({ draft, onChange }: Props) {
  return (
    <div className="space-y-6">
      {/* Display */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Monitor size={16} className="text-[#2563eb]" />
          <h3 className="text-sm font-bold text-[#0d2240]">Visualización</h3>
        </div>
        <div className="px-5 py-4 divide-y divide-gray-50">
          <ToggleRow
            label="Modo compacto"
            desc="Reduce el espaciado y el tamaño de los elementos para mostrar más contenido en pantalla."
            checked={draft.compact_mode}
            onChange={(v) => onChange('compact_mode', v)}
          />
          <ToggleRow
            label="Mostrar marcas de tiempo"
            desc="Muestra la hora de cada mensaje en el historial del chat."
            checked={draft.show_timestamps}
            onChange={(v) => onChange('show_timestamps', v)}
          />
          <ToggleRow
            label="Indicador de escritura"
            desc="Muestra una animación mientras el asistente genera su respuesta."
            checked={draft.show_typing_indicator}
            onChange={(v) => onChange('show_typing_indicator', v)}
          />
        </div>
      </div>

      {/* Theme picker (cosmetic — future implementation) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor size={16} className="text-[#2563eb]" />
            <h3 className="text-sm font-bold text-[#0d2240]">Tema de color</h3>
          </div>
          <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            Próximamente
          </span>
        </div>
        <div className="px-5 py-4 flex gap-3">
          {[
            { label: 'Claro',    bg: 'bg-white',   border: 'border-[#1e3a5f]', icon: '☀️', active: true  },
            { label: 'Oscuro',   bg: 'bg-gray-900', border: 'border-gray-300', icon: '🌙', active: false },
            { label: 'Sistema',  bg: 'bg-gradient-to-r from-white to-gray-900', border: 'border-gray-300', icon: '💻', active: false },
          ].map((t) => (
            <div
              key={t.label}
              className={`flex-1 p-3 rounded-xl border-2 text-center opacity-70 ${t.active ? t.border : 'border-gray-200'} cursor-not-allowed`}
            >
              <div className={`h-10 ${t.bg} rounded-lg border border-gray-200 mb-2 flex items-center justify-center text-lg`}>
                {t.icon}
              </div>
              <p className="text-xs font-semibold text-gray-600">{t.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Bell size={16} className="text-[#2563eb]" />
          <h3 className="text-sm font-bold text-[#0d2240]">Notificaciones</h3>
        </div>
        <div className="px-5 py-4 divide-y divide-gray-50">
          <ToggleRow
            label="Errores del asistente IA"
            desc="Notificar cuando la IA no puede procesar una solicitud o encuentra un error."
            checked={draft.notify_ai_errors}
            onChange={(v) => onChange('notify_ai_errors', v)}
          />
          <ToggleRow
            label="Nuevos documentos cargados"
            desc="Notificar cuando se agrega un documento al repositorio institucional."
            checked={draft.notify_new_docs}
            onChange={(v) => onChange('notify_new_docs', v)}
          />
          <ToggleRow
            label="Flujos de trabajo completados"
            desc="Notificar cuando un flujo administrativo alcanza su último paso."
            checked={draft.notify_flow_complete}
            onChange={(v) => onChange('notify_flow_complete', v)}
          />
        </div>
      </div>
    </div>
  );
}
