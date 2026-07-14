import { useState } from 'react';
import {
  Bot, FileText, Shield, Eye, Clock, Database,
  User, Mail, Building2, Info, ChevronDown,
} from 'lucide-react';
import type { PrivacySettings } from '../../lib/supabase';

interface PrivacySettingsTabProps {
  settings: PrivacySettings;
  onSave: (data: Partial<PrivacySettings>) => Promise<void>;
}

const AI_CONTEXT_OPTIONS = [
  {
    value: 'none',
    label: 'Sin contexto',
    desc: 'La IA no recibe ningún dato de tus documentos.',
    icon: '🔒',
  },
  {
    value: 'summary',
    label: 'Resumen',
    desc: 'Solo se comparten metadatos (nombre, tipo, categoría). Recomendado.',
    icon: '📋',
    recommended: true,
  },
  {
    value: 'full',
    label: 'Completo',
    desc: 'El contenido completo del documento se envía como contexto a la IA.',
    icon: '📄',
  },
] as const;

const CLASSIFICATION_OPTIONS = [
  { value: 'public',       label: 'Público',        color: '#059669', bg: 'bg-green-50',  border: 'border-green-300',  text: 'text-green-700'  },
  { value: 'internal',     label: 'Uso Interno',    color: '#2563eb', bg: 'bg-blue-50',   border: 'border-blue-300',   text: 'text-blue-700'   },
  { value: 'confidential', label: 'Confidencial',   color: '#d97706', bg: 'bg-amber-50',  border: 'border-amber-300',  text: 'text-amber-700'  },
  { value: 'reserved',     label: 'Reservado',      color: '#dc2626', bg: 'bg-red-50',    border: 'border-red-300',    text: 'text-red-700'    },
] as const;

const RETENTION_OPTIONS = [
  { value: 30,   label: '30 días',  sub: 'Borrado automático mensual' },
  { value: 90,   label: '90 días',  sub: 'Trimestral' },
  { value: 365,  label: '1 año',    sub: 'Política estándar' },
  { value: 1095, label: '3 años',   sub: 'Para obligaciones legales' },
] as const;

const TIMEOUT_OPTIONS = [
  { value: 15,  label: '15 min' },
  { value: 30,  label: '30 min' },
  { value: 60,  label: '1 hora' },
  { value: 120, label: '2 horas' },
  { value: 480, label: '8 horas' },
] as const;

function ToggleRow({
  label, desc, checked, onChange, disabled,
}: {
  label: string; desc: string; checked: boolean;
  onChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <div className={`flex items-start gap-3 py-3 ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex-1">
        <p className="text-sm font-semibold text-[#0d2240]">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-all flex-shrink-0 mt-0.5 ${
          checked ? 'bg-[#1e3a5f]' : 'bg-gray-200'
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
            checked ? 'left-5' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}

function SectionCard({ icon: Icon, title, children }: {
  icon: typeof Bot; title: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <Icon size={16} className="text-[#2563eb]" />
        <h3 className="text-sm font-bold text-[#0d2240]">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

export default function PrivacySettingsTab({ settings, onSave }: PrivacySettingsTabProps) {
  const [form, setForm] = useState<PrivacySettings>({ ...settings });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  function update<K extends keyof PrivacySettings>(key: K, value: PrivacySettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      await onSave(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('No se pudo guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  const hasChanges = JSON.stringify(form) !== JSON.stringify(settings);

  return (
    <div className="space-y-4">
      {/* ── Contexto IA ─────────────────────────────────────────────────────── */}
      <SectionCard icon={Bot} title="Contexto compartido con la IA">
        <p className="text-xs text-gray-400 mb-3 leading-relaxed">
          Controla cuánta información de tus documentos se envía al modelo de lenguaje para generar respuestas.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {AI_CONTEXT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update('ai_context_level', opt.value)}
              className={`relative p-3 rounded-xl border-2 text-left transition-all ${
                form.ai_context_level === opt.value
                  ? 'border-[#1e3a5f] bg-[#f0f5ff]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {('recommended' in opt) && opt.recommended && (
                <span className="absolute -top-2 left-3 text-[10px] font-bold text-white bg-[#059669] px-1.5 py-0.5 rounded-full">
                  Recomendado
                </span>
              )}
              <div className="text-lg mb-1">{opt.icon}</div>
              <p className={`text-xs font-bold mb-0.5 ${form.ai_context_level === opt.value ? 'text-[#1e3a5f]' : 'text-gray-700'}`}>
                {opt.label}
              </p>
              <p className="text-[10px] text-gray-400 leading-relaxed">{opt.desc}</p>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* ── Clasificación ────────────────────────────────────────────────────── */}
      <SectionCard icon={Shield} title="Clasificación predeterminada de documentos">
        <p className="text-xs text-gray-400 mb-3">
          Nivel de sensibilidad asignado automáticamente a nuevos documentos cuando no se especifica.
        </p>
        <div className="grid grid-cols-4 gap-2">
          {CLASSIFICATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update('classification_default', opt.value)}
              className={`p-2.5 rounded-xl border-2 text-center transition-all ${
                form.classification_default === opt.value
                  ? `${opt.border} ${opt.bg}`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className={`text-xs font-bold ${
                form.classification_default === opt.value ? opt.text : 'text-gray-600'
              }`}>{opt.label}</span>
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <Info size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            Según la LGTAIP, la información clasificada como <strong>Reservada</strong> o <strong>Confidencial</strong> no puede compartirse con la IA sin autorización expresa.
          </p>
        </div>
      </SectionCard>

      {/* ── Retención ─────────────────────────────────────────────────────────── */}
      <SectionCard icon={Database} title="Retención de datos">
        <p className="text-xs text-gray-400 mb-3">
          Los documentos y registros de actividad serán eliminados automáticamente después del período seleccionado.
        </p>
        <div className="grid grid-cols-4 gap-2">
          {RETENTION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update('data_retention_days', opt.value)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                form.data_retention_days === opt.value
                  ? 'border-[#1e3a5f] bg-[#f0f5ff]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className={`text-sm font-bold ${form.data_retention_days === opt.value ? 'text-[#1e3a5f]' : 'text-gray-700'}`}>
                {opt.label}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">{opt.sub}</p>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* ── Control de acceso ────────────────────────────────────────────────── */}
      <SectionCard icon={Eye} title="Control de acceso y uso">
        <div className="divide-y divide-gray-50">
          <ToggleRow
            label="Revisión humana obligatoria"
            desc="El usuario debe aprobar cada respuesta generada por la IA antes de que pueda usarse en documentos oficiales."
            checked={form.require_human_review}
            onChange={(v) => update('require_human_review', v)}
          />
          <ToggleRow
            label="Registro de auditoría activo"
            desc="Guarda un historial de todas las acciones realizadas en la plataforma para fines de auditoría."
            checked={form.audit_log_enabled}
            onChange={(v) => update('audit_log_enabled', v)}
          />
          <ToggleRow
            label="Anonimizar consultas en el registro"
            desc="Reemplaza nombres y datos identificables en el registro de actividad por identificadores genéricos."
            checked={form.anonymize_queries}
            onChange={(v) => update('anonymize_queries', v)}
          />
          <ToggleRow
            label="Permitir indexación de documentos"
            desc="Los documentos se indizan para mejorar la relevancia de las respuestas de la IA."
            checked={form.allow_doc_indexing}
            onChange={(v) => update('allow_doc_indexing', v)}
          />
          <ToggleRow
            label="Permitir proveedores externos de IA"
            desc="Habilita el uso de servicios de IA de terceros adicionales al motor principal de la plataforma."
            checked={form.allow_external_ai}
            onChange={(v) => update('allow_external_ai', v)}
          />
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
            <Clock size={12} /> Tiempo de expiración de sesión
          </label>
          <div className="relative w-48">
            <select
              value={form.session_timeout_minutes}
              onChange={(e) => update('session_timeout_minutes', Number(e.target.value))}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all pr-8"
            >
              {TIMEOUT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </SectionCard>

      {/* ── Datos de la institución ───────────────────────────────────────────── */}
      <SectionCard icon={Building2} title="Datos del responsable institucional">
        <p className="text-xs text-gray-400 mb-4 leading-relaxed">
          Información del responsable del tratamiento de datos personales, requerida por la LGPDPPSO.
        </p>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
              <Building2 size={11} /> Institución
            </label>
            <input
              value={form.institutional_name}
              onChange={(e) => update('institutional_name', e.target.value)}
              placeholder="Ej. Gobierno del Estado de Jalisco"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
                <User size={11} /> Responsable de datos
              </label>
              <input
                value={form.responsible_name ?? ''}
                onChange={(e) => update('responsible_name', e.target.value)}
                placeholder="Nombre completo"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
                <Mail size={11} /> Correo de privacidad
              </label>
              <input
                type="email"
                value={form.responsible_email ?? ''}
                onChange={(e) => update('responsible_email', e.target.value)}
                placeholder="privacidad@institucion.gob.mx"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
              />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── Save bar ─────────────────────────────────────────────────────────── */}
      <div className="sticky bottom-0 bg-[#f1f4f8]/90 backdrop-blur-sm pt-2 pb-1">
        {error && (
          <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2 mb-2 border border-red-200">{error}</p>
        )}
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl shadow-md px-5 py-3">
          <div>
            <p className="text-xs font-semibold text-gray-700">
              {hasChanges ? 'Tienes cambios sin guardar' : saved ? '¡Configuración guardada!' : 'Configuración actualizada'}
            </p>
            <p className="text-[10px] text-gray-400">
              Última actualización: {new Date(settings.updated_at).toLocaleString('es-GT')}
            </p>
          </div>
          <div className="flex gap-2">
            {hasChanges && (
              <button
                type="button"
                onClick={() => { setForm({ ...settings }); setError(''); }}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Descartar
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || (!hasChanges && !saved)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                saved
                  ? 'bg-green-600 text-white'
                  : hasChanges
                  ? 'bg-[#1e3a5f] hover:bg-[#0d2240] text-white hover:shadow-md'
                  : 'bg-gray-100 text-gray-400 cursor-default'
              }`}
            >
              {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
