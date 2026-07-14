import { useState } from 'react';
import { X, Building2, ChevronDown, ChevronUp, Send } from 'lucide-react';

type Step = 'collapsed' | 'open' | 'form' | 'sent';

export default function InstitutionCTA() {
  const [step, setStep] = useState<Step>('collapsed');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'postular' | 'informacion' | null>(null);

  function handleSubmit() {
    if (!message.trim()) return;
    setStep('sent');
  }

  function openForm(t: 'postular' | 'informacion') {
    setType(t);
    setStep('form');
  }

  // Collapsed pill
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

  // Sent confirmation
  if (step === 'sent') {
    return (
      <div className="fixed bottom-6 right-6 z-40 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-[#0d2240] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#2563eb] rounded-lg flex items-center justify-center">
              <Building2 size={15} className="text-white" />
            </div>
            <span className="text-white font-semibold text-sm">PotencIA Institucional</span>
          </div>
          <button onClick={() => setStep('collapsed')} className="text-white/40 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-6 text-center">
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Send size={20} className="text-emerald-600" />
          </div>
          <h3 className="font-bold text-[#0d2240] text-sm mb-1">Mensaje recibido</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Nos pondremos en contacto con su institución para coordinar los siguientes pasos.
          </p>
          <button
            onClick={() => { setStep('collapsed'); setMessage(''); setType(null); }}
            className="mt-4 text-xs text-[#2563eb] hover:underline font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  // Form step
  if (step === 'form') {
    return (
      <div className="fixed bottom-6 right-6 z-40 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-[#0d2240] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#2563eb] rounded-lg flex items-center justify-center">
              <Building2 size={15} className="text-white" />
            </div>
            <span className="text-white font-semibold text-sm">
              {type === 'postular' ? 'Postular institución' : 'Solicitar información'}
            </span>
          </div>
          <button onClick={() => setStep('open')} className="text-white/40 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs text-gray-500 leading-relaxed mb-3">
            Cuéntenos qué proceso, documento o necesidad institucional desean mejorar.
          </p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describa brevemente su institución y la necesidad que desea mejorar..."
            rows={4}
            className="w-full text-xs text-gray-800 border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] placeholder:text-gray-400 leading-relaxed"
          />
          <p className="text-[10px] text-gray-400 leading-relaxed mt-2 italic">
            La participación en un piloto estará sujeta a evaluación técnica, disponibilidad y definición conjunta del alcance.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setStep('open')}
              className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Volver
            </button>
            <button
              onClick={handleSubmit}
              disabled={!message.trim()}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#0d2240] hover:bg-[#1e3a5f] disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-bold transition-colors disabled:cursor-not-allowed"
            >
              <Send size={12} />
              Enviar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Open card
  return (
    <div className="fixed bottom-6 right-6 z-40 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-[#0d2240] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#2563eb] rounded-lg flex items-center justify-center">
            <Building2 size={15} className="text-white" />
          </div>
          <span className="text-white font-semibold text-sm">PotencIA Institucional</span>
        </div>
        <button onClick={() => setStep('collapsed')} className="text-white/40 hover:text-white transition-colors">
          <ChevronDown size={16} />
        </button>
      </div>

      {/* Body */}
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
