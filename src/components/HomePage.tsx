import {
  Bot,
  FileText,
  Search,
  FileOutput,
  ShieldCheck,
  ArrowRight,
  CheckCircle,
  Users,
  Zap,
  ChevronRight,
} from 'lucide-react';

interface HomePageProps {
  onGoToAssistant: () => void;
}

const features = [
  {
    icon: FileText,
    color: 'bg-blue-50 text-[#2563eb]',
    border: 'border-blue-100',
    title: 'Redactar documentos',
    description:
      'Genera oficios, memorandos e informes administrativos en segundos. Solo describe lo que necesitas.',
  },
  {
    icon: Search,
    color: 'bg-emerald-50 text-emerald-600',
    border: 'border-emerald-100',
    title: 'Buscar normativa',
    description:
      'Encuentra leyes, reglamentos y disposiciones vigentes sin tener que buscar en múltiples sitios.',
  },
  {
    icon: FileOutput,
    color: 'bg-violet-50 text-violet-600',
    border: 'border-violet-100',
    title: 'Resumir contenido',
    description:
      'Convierte documentos extensos en resúmenes claros y concisos para tomar decisiones más rápido.',
  },
  {
    icon: Bot,
    color: 'bg-amber-50 text-amber-600',
    border: 'border-amber-100',
    title: 'Crear formatos',
    description:
      'Genera plantillas y formatos estandarizados para los trámites más frecuentes de tu institución.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Escribe tu solicitud',
    description:
      'Describe con tus propias palabras lo que necesitas. No se requieren conocimientos técnicos.',
    icon: FileText,
  },
  {
    number: '02',
    title: 'La IA genera una respuesta',
    description:
      'El asistente procesa tu solicitud usando los documentos de tu institución y la normativa vigente.',
    icon: Zap,
  },
  {
    number: '03',
    title: 'Revisa y utiliza',
    description:
      'Un funcionario revisa la respuesta antes de usarla oficialmente. Siempre hay supervisión humana.',
    icon: CheckCircle,
  },
];


export default function HomePage({ onGoToAssistant }: HomePageProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-[#f1f4f8]">
      {/* ── Hero ── */}
      <section className="relative bg-[#0d2240] overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute -top-32 -right-32 w-[480px] h-[480px] bg-[#1e3a5f] rounded-full opacity-40 blur-3xl" />
          <div className="absolute bottom-0 -left-24 w-[360px] h-[360px] bg-[#0a1a35] rounded-full opacity-60 blur-2xl" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-white/5 to-transparent" />
        </div>

        <div className="relative max-w-5xl mx-auto px-8 py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 mb-7">
            <img
              src="data:image/png;base64,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"
              alt="Red Ciudadana"
              className="h-3.5 w-auto opacity-80"
            />
            <span className="text-white/80 text-sm font-medium">Sitio oficial de la Asociacion Civil Red Ciudadana</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-5">
            El asistente inteligente para
            <br />
            <span className="text-[#60a5fa]">la gestión pública</span>
          </h1>

          <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            Redacta, resume, busca normativa y crea borradores administrativos en minutos.
            Diseñado para funcionarios públicos, sin necesidad de conocimientos técnicos.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onGoToAssistant}
              className="inline-flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-7 py-3.5 rounded-xl text-base transition-all duration-150 shadow-lg shadow-blue-900/30 hover:shadow-xl hover:-translate-y-0.5"
            >
              <Bot size={20} />
              Usar el Asistente IA
              <ArrowRight size={18} />
            </button>
            <a
              href="#como-funciona"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-7 py-3.5 rounded-xl text-base transition-all duration-150"
            >
              Ver cómo funciona
            </a>
          </div>

        </div>
      </section>

      {/* ── Security notice ── */}
      <div className="bg-[#f0fdf4] border-b border-green-100">
        <div className="max-w-5xl mx-auto px-8 py-3 flex items-center justify-center gap-3">
          <ShieldCheck size={16} className="text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-800">
            <span className="font-semibold">Información protegida.</span> Todos los datos se procesan bajo altos estándares de seguridad institucional. Nunca se comparte información fuera de tu organización.
          </p>
        </div>
      </div>

      {/* ── Features ── */}
      <section className="max-w-5xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2563eb] bg-blue-50 border border-blue-100 rounded-full px-3 py-1">
            Capacidades
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-[#0d2240] mt-4 mb-3">
            Todo lo que necesitas en un solo lugar
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
            El Asistente IA de Red Ciudadana está diseñado para los documentos y trámites del día a día en el sector público.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, color, border, title, description }) => (
            <div
              key={title}
              className={`bg-white rounded-2xl border ${border} p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group`}
            >
              <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-4`}>
                <Icon size={22} />
              </div>
              <h3 className="font-bold text-[#0d2240] text-sm mb-2">{title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="como-funciona" className="bg-white border-y border-gray-200 py-16">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2563eb] bg-blue-50 border border-blue-100 rounded-full px-3 py-1">
              Cómo funciona
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0d2240] mt-4 mb-3">
              Tres pasos simples
            </h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
              No necesitas conocimientos técnicos ni experiencia previa con herramientas digitales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[calc(16.666%+1.5rem)] right-[calc(16.666%+1.5rem)] h-px bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200" />

            {steps.map(({ number, title, description, icon: Icon }, i) => (
              <div key={number} className="relative flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-[#0d2240] rounded-2xl flex flex-col items-center justify-center mb-5 shadow-lg relative z-10">
                  <Icon size={28} className="text-white mb-1" />
                  <span className="text-white/50 text-xs font-bold">{number}</span>
                </div>
                <h3 className="font-bold text-[#0d2240] mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{description}</p>
                {i < steps.length - 1 && (
                  <ChevronRight size={20} className="md:hidden text-gray-300 mt-4" />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={onGoToAssistant}
              className="inline-flex items-center gap-2 bg-[#0d2240] hover:bg-[#1e3a5f] text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all duration-150 hover:shadow-lg hover:-translate-y-0.5"
            >
              Empezar ahora
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="max-w-5xl mx-auto px-8 py-16">
        <div className="bg-[#f0f5ff] border border-blue-100 rounded-3xl p-8 md:p-12 text-center">
          <div className="w-16 h-16 bg-[#1e3a5f] rounded-2xl mx-auto mb-5 flex items-center justify-center">
            <Bot size={30} className="text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#0d2240] mb-3">
            ¿Listo para empezar?
          </h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed mb-7">
            Accede al Asistente IA ahora mismo. No necesitas instalar nada ni tener experiencia previa con tecnología.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onGoToAssistant}
              className="inline-flex items-center justify-center gap-2 bg-[#1e3a5f] hover:bg-[#0d2240] text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-all duration-150 hover:shadow-lg hover:-translate-y-0.5"
            >
              <Bot size={18} />
              Ir al Asistente IA
              <ArrowRight size={16} />
            </button>
            <button className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-[#0d2240] font-semibold px-7 py-3.5 rounded-xl text-sm transition-colors">
              Ver guía de uso
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="max-w-5xl mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#0d2240] rounded-lg flex items-center justify-center">
              <ShieldCheck size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-[#0d2240]">Red Ciudadana</span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-400">Plataforma Institucional</span>
          </div>
          <p className="text-xs text-gray-400">© 2026 Red Ciudadana. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
