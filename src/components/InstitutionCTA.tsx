import { useState } from 'react';
import { X, Building2, ChevronDown, ChevronUp, Send, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Step = 'collapsed' | 'open' | 'form' | 'sent';

interface FormState {
  email: string;
  whatsapp: string;
  message: string;
}

const EMPTY_FORM: FormState = { email: '', whatsapp: '', message: '' };

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export default function InstitutionCTA() {
  const [step, setStep] = useState<Step>('collapsed');
  const [type, setType] = useState<'postular' | 'informacion' | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError('');
  }

  function openForm(t: 'postular' | 'informacion') {
    setType(t);
    setForm(EMPTY_FORM);
    setError('');
    setStep('form');
  }

  function validate(): string {
    if (!form.email.trim()) return 'El correo electrónico es obligatorio.';
    if (!isValidEmail(form.email)) return 'Ingrese un correo electrónico válido.';
    if (!form.message.trim()) return 'Por favor describa la necesidad de su institución.';
    return '';
  }

  async function handleSubmit() {
    const err = validate();
    if (err) { setError(err); return; }

    setSubmitting(true);
    setError('');

    const { error: dbError } = await supabase.from('institution_leads').insert({
      type,
      email: form.email.trim().toLowerCase(),
      whatsapp: form.whatsapp.trim() || null,
      message: form.message.trim(),
    });

    setSubmitting(false);

    if (dbError) {
      setError('Ocurrió un error al enviar. Por favor intente de nuevo.');
      return;
    }

    setStep('sent');
  }

  function reset() {
    setStep('collapsed');
    setForm(EMPTY_FORM);
    setType(null);
    setError('');
  }

  // ── Collapsed pill ──────────────────────────────────────────────────────────
  if (step === 'collapsed') {
    return (
      <button
        onClick={() => setStep('open')}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-[#0d2240] hover:bg-[#1e3a5f] text-white shadow-xl shadow-[#0d2240]/30 rounded-2xl px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 group"
      >
        <div className="w-7 h-7 bg-[#2563eb] rounded-lg flex items-center justify-center flex-shrink-0">
          <Building2 size={15} className="text-white" />
        </div>
        <span className="text-sm font-semibold leading-tight">¿Su institución quiere implementar IA?</span>
        <ChevronUp size={15} className="text-white/50 group-hover:text-white/80 transition-colors" />
      </button>
    );
  }

  // ── Sent confirmation ───────────────────────────────────────────────────────
  if (step === 'sent') {
    return (
      <div className="fixed bottom-6 right-6 z-40 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
        <CardHeader label="PotencIA Institucional" onClose={reset} />
        <div className="px-5 py-6 text-center">
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Send size={20} className="text-emerald-600" />
          </div>
          <h3 className="font-bold text-[#0d2240] text-sm mb-1">Mensaje recibido</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Nos pondremos en contacto con su institución para coordinar los siguientes pasos.
          </p>
          <button onClick={reset} className="mt-4 text-xs text-[#2563eb] hover:underline font-medium">
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  if (step === 'form') {
    return (
      <div className="fixed bottom-6 right-6 z-40 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
        <CardHeader
          label={type === 'postular' ? 'Postular institución' : 'Solicitar información'}
          onClose={() => setStep('open')}
        />
        <div className="px-5 py-4 space-y-3">
          <p className="text-xs text-gray-500 leading-relaxed">
            Cuéntenos qué proceso, documento o necesidad institucional desean mejorar.
          </p>

          {/* Email */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Correo electrónico <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="correo@institucion.gob"
              className="w-full text-xs text-gray-800 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] placeholder:text-gray-400 transition-all"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              WhatsApp <span className="text-gray-400 font-normal normal-case">(opcional)</span>
            </label>
            <input
              type="tel"
              value={form.whatsapp}
              onChange={(e) => set('whatsapp', e.target.value)}
              placeholder="+502 1234 5678"
              className="w-full text-xs text-gray-800 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] placeholder:text-gray-400 transition-all"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Necesidad institucional <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.message}
              onChange={(e) => set('message', e.target.value)}
              placeholder="Describa brevemente su institución y el proceso o documento que desean mejorar..."
              rows={3}
              className="w-full text-xs text-gray-800 border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] placeholder:text-gray-400 leading-relaxed transition-all"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <AlertCircle size={13} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 leading-relaxed">{error}</p>
            </div>
          )}

          <p className="text-[10px] text-gray-400 leading-relaxed italic">
            La participación en un piloto estará sujeta a evaluación técnica, disponibilidad y definición conjunta del alcance.
          </p>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setStep('open')}
              disabled={submitting}
              className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Volver
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#0d2240] hover:bg-[#1e3a5f] disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-bold transition-colors disabled:cursor-not-allowed"
            >
              {submitting ? (
                <><Loader2 size={12} className="animate-spin" /> Enviando...</>
              ) : (
                <><Send size={12} /> Enviar</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Open card ───────────────────────────────────────────────────────────────
  return (
    <div className="fixed bottom-6 right-6 z-40 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
      <CardHeader label="PotencIA Institucional" onClose={() => setStep('collapsed')} chevron="down" />
      <div className="px-5 py-5">
        <h3 className="font-bold text-[#0d2240] text-sm leading-snug mb-2">
          ¿Su institución quiere implementar inteligencia artificial?
        </h3>
        <p className="text-xs text-gray-600 leading-relaxed mb-1">
          Estamos identificando instituciones públicas interesadas en participar en demostraciones y proyectos piloto de PotencIA.
        </p>
        <p className="text-xs text-gray-500 leading-relaxed mb-4">
          Cuéntenos qué proceso, documento o necesidad institucional desean mejorar.
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => openForm('postular')}
            className="w-full flex items-center justify-center gap-2 bg-[#0d2240] hover:bg-[#1e3a5f] text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition-all duration-150 hover:shadow-md"
          >
            <Building2 size={13} />
            Postular a mi institución
          </button>
          <button
            onClick={() => openForm('informacion')}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-[#0d2240] font-semibold px-4 py-2.5 rounded-xl text-xs transition-colors"
          >
            Solicitar información
          </button>
        </div>

        <p className="text-[10px] text-gray-400 leading-relaxed mt-3 italic">
          La participación en un piloto estará sujeta a evaluación técnica, disponibilidad y definición conjunta del alcance.
        </p>
      </div>
    </div>
  );
}

// ── Shared header ─────────────────────────────────────────────────────────────

function CardHeader({
  label,
  onClose,
  chevron = 'x',
}: {
  label: string;
  onClose: () => void;
  chevron?: 'x' | 'down';
}) {
  return (
    <div className="bg-[#0d2240] px-5 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 bg-[#2563eb] rounded-lg flex items-center justify-center">
          <Building2 size={15} className="text-white" />
        </div>
        <span className="text-white font-semibold text-sm">{label}</span>
      </div>
      <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
        {chevron === 'down' ? <ChevronDown size={16} /> : <X size={16} />}
      </button>
    </div>
  );
}
