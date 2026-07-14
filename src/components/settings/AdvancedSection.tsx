import { useState } from 'react';
import { Cpu, Download, RotateCcw, AlertTriangle, ChevronDown, Info, Shield } from 'lucide-react';
import type { AppSettings } from '../../lib/supabase';

const TOKEN_OPTIONS = [
  { value: 4096,  label: '4 096',  sub: 'Bajo consumo' },
  { value: 8192,  label: '8 192',  sub: 'Estándar'     },
  { value: 16384, label: '16 384', sub: 'Recomendado'   },
  { value: 32768, label: '32 768', sub: 'Máximo'        },
];

function ToggleRow({ label, desc, checked, onChange, danger }: {
  label: string; desc: string; checked: boolean; onChange: (v: boolean) => void; danger?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <div className="flex-1">
        <p className={`text-sm font-semibold ${danger ? 'text-red-600' : 'text-[#0d2240]'}`}>{label}</p>
        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-all flex-shrink-0 mt-0.5 ${
          checked ? (danger ? 'bg-red-500' : 'bg-[#1e3a5f]') : 'bg-gray-200'
        }`}
      >
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? 'left-5' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

interface Props {
  draft: AppSettings;
  onChange: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  onExport: () => void;
  onReset: () => void;
}

export default function AdvancedSection({ draft, onChange, onExport, onReset }: Props) {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="space-y-6">
      {/* Context tokens */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Cpu size={16} className="text-[#2563eb]" />
          <h3 className="text-sm font-bold text-[#0d2240]">Rendimiento de la IA</h3>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Máximo de tokens de contexto
            </label>
            <p className="text-xs text-gray-400 mb-3 leading-relaxed">
              Define cuánto texto se envía a la IA como contexto. Más tokens = respuestas más informadas, mayor consumo.
            </p>
            <div className="grid grid-cols-4 gap-2">
              {TOKEN_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange('max_context_tokens', opt.value)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    draft.max_context_tokens === opt.value
                      ? 'border-[#1e3a5f] bg-[#f0f5ff]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className={`text-sm font-bold ${draft.max_context_tokens === opt.value ? 'text-[#1e3a5f]' : 'text-gray-700'}`}>
                    {opt.label}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{opt.sub}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            <ToggleRow
              label="Telemetría anónima"
              desc="Comparte estadísticas de uso anónimas para mejorar la plataforma. Sin datos personales."
              checked={draft.enable_telemetry}
              onChange={(v) => onChange('enable_telemetry', v)}
            />
            <ToggleRow
              label="Información de depuración"
              desc="Muestra métricas técnicas y tiempos de respuesta en la interfaz. Solo para uso en desarrollo."
              checked={draft.show_debug_info}
              onChange={(v) => onChange('show_debug_info', v)}
            />
          </div>
        </div>
      </div>

      {/* Data management */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Download size={16} className="text-[#2563eb]" />
          <h3 className="text-sm font-bold text-[#0d2240]">Gestión de datos</h3>
        </div>
        <div className="px-5 py-5 space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <p className="text-sm font-semibold text-[#0d2240]">Exportar configuración</p>
              <p className="text-xs text-gray-400">Descarga un archivo JSON con todos los ajustes actuales.</p>
            </div>
            <button
              type="button"
              onClick={onExport}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#2563eb] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-2 rounded-xl transition-colors"
            >
              <Download size={13} /> Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-red-100 flex items-center gap-2 bg-red-50/50">
          <AlertTriangle size={16} className="text-red-500" />
          <h3 className="text-sm font-bold text-red-700">Zona peligrosa</h3>
        </div>
        <div className="px-5 py-5">
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-200">
            <div>
              <p className="text-sm font-semibold text-red-700">Restablecer ajustes predeterminados</p>
              <p className="text-xs text-red-400">Todos los ajustes vuelven a sus valores de fábrica. Esta acción no puede deshacerse.</p>
            </div>
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-white hover:bg-red-50 border border-red-300 px-3 py-2 rounded-xl transition-colors"
            >
              <RotateCcw size={13} /> Restablecer
            </button>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Info size={16} className="text-[#2563eb]" />
          <h3 className="text-sm font-bold text-[#0d2240]">Acerca de la plataforma</h3>
        </div>
        <div className="px-5 py-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1e3a5f] rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield size={22} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0d2240]">Red Ciudadana</p>
              <p className="text-xs text-gray-400">Plataforma Institucional de IA</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: 'Versión', value: '1.0.0' },
              { label: 'Entorno', value: 'Producción' },
              { label: 'Última actualización', value: '07 Jul 2026' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-gray-400">{label}</p>
                <p className="text-xs font-bold text-[#0d2240] mt-0.5">{value}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-4 leading-relaxed">
            Desarrollado con fines institucionales. Uso exclusivo del sector público guatemalteco.
            Los datos se almacenan en infraestructura nacional conforme a la normativa aplicable.
          </p>
        </div>
      </div>

      {/* Confirm reset dialog */}
      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmReset(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm z-10">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <h3 className="text-base font-bold text-[#0d2240] text-center mb-2">¿Restablecer ajustes?</h3>
            <p className="text-xs text-gray-500 text-center mb-5 leading-relaxed">
              Todos los ajustes volverán a sus valores predeterminados. Tu historial de chat y documentos no se verán afectados.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmReset(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button onClick={() => { onReset(); setConfirmReset(false); }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors">
                Restablecer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
