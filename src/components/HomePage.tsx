import {
  Bot,
  FileText,
  Search,
  FileOutput,
  ShieldCheck,
  ArrowRight,
  CheckCircle,
  Zap,
  AlertTriangle,
  BookOpen,
  Layers,
  Users,
  Eye,
  Settings,
  MessageSquare,
  Scale,
  ChevronRight,
  Building2,
  Lightbulb,
} from 'lucide-react';

interface HomePageProps {
  onGoToAssistant: () => void;
}

const PROBLEMS = [
  'búsquedas manuales que consumen tiempo;',
  'duplicación de esfuerzos;',
  'dificultad para localizar antecedentes;',
  'dependencia del conocimiento de personas específicas;',
  'riesgo de trabajar con información incompleta;',
  'procesos administrativos más lentos.',
];

const SOLUTIONS = [
  {
    icon: Search,
    color: 'bg-blue-50 text-[#2563eb]',
    border: 'border-blue-100',
    title: 'Consulta de conocimiento institucional',
    description:
      'Realice preguntas en lenguaje natural y encuentre información dentro de documentos, manuales, normativas y bases institucionales.',
  },
  {
    icon: FileText,
    color: 'bg-emerald-50 text-emerald-600',
    border: 'border-emerald-100',
    title: 'Redacción administrativa',
    description:
      'Genere borradores iniciales de oficios, memorandos, informes, notas, respuestas y otros documentos de uso frecuente.',
  },
  {
    icon: FileOutput,
    color: 'bg-amber-50 text-amber-600',
    border: 'border-amber-100',
    title: 'Resumen y análisis documental',
    description:
      'Convierta documentos extensos en resúmenes estructurados, puntos clave, responsabilidades, plazos y temas relevantes.',
  },
  {
    icon: Layers,
    color: 'bg-rose-50 text-rose-600',
    border: 'border-rose-100',
    title: 'Creación de formatos',
    description:
      'Prepare plantillas y estructuras estandarizadas para procesos y documentos recurrentes.',
  },
  {
    icon: Bot,
    color: 'bg-violet-50 text-violet-600',
    border: 'border-violet-100',
    title: 'Asistentes especializados',
    description:
      'Configure soluciones enfocadas en áreas como asuntos jurídicos, planificación, compras públicas, gestión documental o atención ciudadana.',
  },
];

const LEGAL_CAPABILITIES = [
  'búsqueda normativa contextual;',
  'identificación de artículos relevantes;',
  'resumen de leyes, reglamentos y acuerdos;',
  'análisis inicial de documentos administrativos;',
  'generación de borradores de dictámenes;',
  'preparación de oficios y memoriales;',
  'revisión preliminar de contratos;',
  'consulta de procedimientos y competencias municipales.',
];

const STEPS = [
  {
    number: '01',
    icon: MessageSquare,
    title: 'Escriba su solicitud',
    description:
      'Describa con sus propias palabras la información, documento o análisis que necesita. No es necesario conocer comandos técnicos ni el nombre exacto del documento.',
  },
  {
    number: '02',
    icon: Search,
    title: 'PotencIA consulta la información disponible',
    description:
      'El sistema busca información relevante dentro de los documentos, bases de conocimiento o bancos normativos configurados para la institución.',
  },
  {
    number: '03',
    icon: Zap,
    title: 'Reciba una respuesta estructurada',
    description:
      'PotencIA genera una respuesta, resumen o borrador utilizando la información encontrada. Cuando la solución está configurada para ello, también presenta documentos, fragmentos y referencias para verificar la respuesta.',
  },
  {
    number: '04',
    icon: CheckCircle,
    title: 'Revise antes de utilizar',
    description:
      'Un funcionario o especialista revisa el contenido antes de incorporarlo a un documento, expediente o decisión institucional. La inteligencia artificial apoya el trabajo. La responsabilidad y la decisión permanecen en las personas.',
  },
];

const DIFFERENTIATORS = [
  {
    icon: Settings,
    title: 'Adaptable',
    description:
      'Puede configurarse según los documentos, procesos, lenguaje y necesidades de cada entidad pública.',
  },
  {
    icon: Eye,
    title: 'Verificable',
    description:
      'Las soluciones documentales pueden mostrar las fuentes y fragmentos utilizados para elaborar una respuesta.',
  },
  {
    icon: Building2,
    title: 'Institucional',
    description:
      'Está diseñado para apoyar procesos de trabajo y no únicamente consultas individuales.',
  },
  {
    icon: Lightbulb,
    title: 'Fácil de utilizar',
    description:
      'Permite realizar solicitudes en lenguaje natural, sin necesidad de experiencia técnica.',
  },
  {
    icon: Users,
    title: 'Centrado en las personas',
    description:
      'Mantiene la supervisión humana como parte indispensable del proceso.',
  },
  {
    icon: ShieldCheck,
    title: 'Seguro',
    description:
      'Con control institucional sobre los documentos, permisos de acceso y protección de información sensible.',
  },
];

const RESPONSIBLE_PRINCIPLES = [
  'revisión humana de los resultados;',
  'identificación de fuentes cuando estén disponibles;',
  'advertencias cuando no existe información suficiente;',
  'control institucional sobre los documentos incorporados;',
  'definición de permisos y niveles de acceso;',
  'protección de información sensible;',
  'evaluación continua de calidad y riesgos;',
  'capacitación de las personas usuarias.',
];

const FOOTER_LINKS = ['Soluciones', 'Caso jurídico municipal', 'Uso responsable', 'Contacto', 'Política de privacidad'];

export default function HomePage({ onGoToAssistant }: HomePageProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-[#f1f4f8]">

      {/* ── Hero ── */}
      <section className="relative bg-[#0d2240] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-[#1e3a5f] rounded-full opacity-40 blur-3xl" />
          <div className="absolute bottom-0 -left-24 w-[380px] h-[380px] bg-[#0a1a35] rounded-full opacity-60 blur-2xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>

        <div className="relative max-w-5xl mx-auto px-8 py-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 mb-8 max-w-2xl">
            <img
              src="data:image/png;base64,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"
              alt="Red Ciudadana"
              className="h-3 w-auto opacity-70 flex-shrink-0"
            />
            <span className="text-white/60 text-xs leading-snug">
              Una iniciativa de Red Ciudadana para promover el uso responsable, útil y centrado en las personas de la inteligencia artificial en el sector público.
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-3 tracking-tight">
            PotencIA
          </h1>
          <p className="text-xl md:text-2xl font-medium text-[#60a5fa] mb-6 leading-snug">
            Inteligencia artificial diseñada para fortalecer la gestión pública
          </p>
          <p className="text-white/65 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            Transformamos documentos, normativa, datos y conocimiento institucional en asistentes especializados que ayudan a los equipos públicos a encontrar información, analizar casos y generar borradores con mayor agilidad.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onGoToAssistant}
              className="inline-flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-7 py-3.5 rounded-xl text-base transition-all duration-150 shadow-lg shadow-blue-900/30 hover:shadow-xl hover:-translate-y-0.5"
            >
              <Bot size={20} />
              Explorar PotencIA
              <ArrowRight size={18} />
            </button>
            <a
              href="#caso-juridico"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-7 py-3.5 rounded-xl text-base transition-all duration-150"
            >
              Conocer el caso jurídico municipal
            </a>
          </div>
        </div>
      </section>

      {/* ── El Problema ── */}
      <section className="bg-[#0a1a35] border-y border-white/5">
        <div className="max-w-5xl mx-auto px-8 py-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-400/20 rounded-full px-3 py-1 mb-6">
                <AlertTriangle size={13} className="text-amber-400" />
                <span className="text-amber-300 text-xs font-semibold uppercase tracking-widest">El problema</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
                Las instituciones públicas tienen información. El desafío es convertirla en conocimiento útil.
              </h2>
              <p className="text-white/55 text-sm leading-relaxed">
                Normativas, manuales, expedientes, informes y documentos administrativos suelen encontrarse dispersos entre diferentes plataformas, carpetas y archivos.
              </p>
            </div>
            <div className="space-y-2.5">
              <p className="text-white/40 text-xs uppercase font-bold tracking-widest mb-4">Esto genera:</p>
              {PROBLEMS.map((p) => (
                <div key={p} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                  <p className="text-white/70 text-sm leading-relaxed">{p}</p>
                </div>
              ))}
              <div className="mt-6 pt-5 border-t border-white/10">
                <p className="text-[#60a5fa] text-sm font-medium leading-relaxed">
                  PotencIA ayuda a organizar, consultar y utilizar ese conocimiento institucional mediante inteligencia artificial.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Soluciones ── */}
      <section className="max-w-5xl mx-auto px-8 py-16 md:py-20">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2563eb] bg-blue-50 border border-blue-100 rounded-full px-3 py-1">
            Soluciones
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-[#0d2240] mt-4 mb-3">
            Inteligencia artificial aplicada a necesidades reales del sector público
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
            PotencIA puede adaptarse a los documentos, procesos y necesidades de cada institución.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SOLUTIONS.map(({ icon: Icon, color, border, title, description }) => (
            <div
              key={title}
              className={`bg-white rounded-2xl border ${border} p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
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

      {/* ── Primera solución especializada ── */}
      <section id="caso-juridico" className="bg-[#0d2240]">
        <div className="max-w-5xl mx-auto px-8 py-16 md:py-20">
          <div className="inline-flex items-center gap-2 bg-[#60a5fa]/10 border border-[#60a5fa]/20 rounded-full px-3 py-1 mb-6">
            <Scale size={13} className="text-[#60a5fa]" />
            <span className="text-[#60a5fa] text-xs font-semibold uppercase tracking-widest">Primera solución especializada</span>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
                PotencIA Jurídica Municipal
              </h2>
              <p className="text-[#60a5fa] font-semibold text-base mb-5">
                Más tiempo para analizar. Menos tiempo para buscar.
              </p>
              <p className="text-white/65 text-sm leading-relaxed mb-8">
                Una solución de inteligencia artificial que permite consultar un banco normativo, identificar documentos y disposiciones relacionadas con una solicitud y generar respuestas iniciales con referencias verificables.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onGoToAssistant}
                  className="inline-flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all duration-150 shadow-lg shadow-blue-900/40 hover:-translate-y-0.5"
                >
                  <Scale size={16} />
                  Conocer PotencIA Jurídica Municipal
                  <ArrowRight size={15} />
                </button>
                <button
                  onClick={onGoToAssistant}
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all duration-150"
                >
                  Ver una demostración
                </button>
              </div>
              <p className="text-white/30 text-xs mt-4 leading-relaxed">
                Las respuestas deben ser revisadas por personal jurídico competente antes de utilizarse en actuaciones oficiales.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-white/40 text-xs uppercase font-bold tracking-widest mb-4">PotencIA Jurídica Municipal puede apoyar en:</p>
              <div className="space-y-2.5">
                {LEGAL_CAPABILITIES.map((cap) => (
                  <div key={cap} className="flex items-start gap-3">
                    <ChevronRight size={14} className="text-[#60a5fa] mt-0.5 flex-shrink-0" />
                    <p className="text-white/70 text-sm leading-relaxed">{cap}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Cómo funciona ── */}
      <section id="como-funciona" className="bg-white border-y border-gray-200">
        <div className="max-w-5xl mx-auto px-8 py-16 md:py-20">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2563eb] bg-blue-50 border border-blue-100 rounded-full px-3 py-1">
              Cómo funciona
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0d2240] mt-4 mb-3">
              De la solicitud a una respuesta verificable
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {STEPS.map(({ number, icon: Icon, title, description }, i) => (
              <div key={number} className="bg-[#f8fafc] border border-gray-200 rounded-2xl p-6 flex gap-5">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[#0d2240] rounded-xl flex flex-col items-center justify-center shadow-md">
                    <Icon size={20} className="text-white" />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#2563eb] uppercase tracking-widest">{number}</span>
                  <h3 className="font-bold text-[#0d2240] mt-1 mb-2 text-sm leading-snug">{title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Diferenciadores ── */}
      <section className="max-w-5xl mx-auto px-8 py-16 md:py-20">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2563eb] bg-blue-50 border border-blue-100 rounded-full px-3 py-1">
            Diferenciadores
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-[#0d2240] mt-4 mb-3">
            No es solamente un chatbot
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
            PotencIA combina inteligencia artificial con documentos, conocimiento institucional y reglas de uso definidas para cada institución.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DIFFERENTIATORS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl bg-[#f0f5ff] flex items-center justify-center mb-4">
                <Icon size={20} className="text-[#2563eb]" />
              </div>
              <h3 className="font-bold text-[#0d2240] text-sm mb-2">{title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Uso responsable ── */}
      <section className="bg-[#f8fafc] border-y border-gray-200">
        <div className="max-w-5xl mx-auto px-8 py-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1">
                Uso responsable
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-[#0d2240] mt-5 mb-4 leading-tight">
                Inteligencia artificial con supervisión, transparencia y límites claros
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                PotencIA está diseñada como una herramienta de apoyo. No sustituye las funciones, competencias ni responsabilidades de los funcionarios públicos.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <p className="text-amber-800 text-xs leading-relaxed font-medium">
                  PotencIA no debe presentar como definitiva una respuesta que no pueda respaldarse con la información disponible.
                </p>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-4">Sus principios de implementación incluyen:</p>
              <div className="space-y-2.5">
                {RESPONSIBLE_PRINCIPLES.map((p) => (
                  <div key={p} className="flex items-start gap-3">
                    <CheckCircle size={15} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600 text-sm leading-relaxed">{p}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sobre el proyecto ── */}
      <section className="max-w-5xl mx-auto px-8 py-16 md:py-20">
        <div className="bg-[#0d2240] rounded-3xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#60a5fa] bg-[#60a5fa]/10 border border-[#60a5fa]/20 rounded-full px-3 py-1">
                Sobre el proyecto
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white mt-5 mb-4 leading-tight">
                Innovación pública con propósito
              </h2>
              <p className="text-white/65 text-sm leading-relaxed">
                PotencIA es una iniciativa de Red Ciudadana, organización especializada en innovación pública, transformación digital, datos abiertos, transparencia y fortalecimiento institucional.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-white/65 text-sm leading-relaxed">
                El proyecto busca desarrollar soluciones de inteligencia artificial que respondan a problemas reales del sector público y que puedan implementarse de manera responsable, accesible y sostenible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="bg-[#f0f5ff] border-t border-blue-100">
        <div className="max-w-5xl mx-auto px-8 py-16 md:py-20 text-center">
          <div className="w-16 h-16 bg-[#1e3a5f] rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
            <Bot size={30} className="text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#0d2240] mb-3 leading-tight">
            Convierta el conocimiento de su institución en una herramienta activa
          </h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed mb-8">
            Explore cómo PotencIA puede apoyar la búsqueda de información, el análisis documental y la preparación de respuestas administrativas dentro de su institución.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-5">
            <button
              onClick={onGoToAssistant}
              className="inline-flex items-center justify-center gap-2 bg-[#1e3a5f] hover:bg-[#0d2240] text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-all duration-150 hover:shadow-lg hover:-translate-y-0.5"
            >
              <Bot size={18} />
              Solicitar una demostración
              <ArrowRight size={16} />
            </button>
            <button
              onClick={onGoToAssistant}
              className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-[#0d2240] font-semibold px-7 py-3.5 rounded-xl text-sm transition-colors"
            >
              <Scale size={16} />
              Explorar PotencIA Jurídica Municipal
            </button>
          </div>
          <p className="text-gray-400 text-xs">No necesita instalar programas ni contar con conocimientos técnicos especializados.</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#0d2240] border-t border-white/10">
        <div className="max-w-5xl mx-auto px-8 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <img
                  src="https://redciudadana.org/logo_red_ciudadana.png"
                  alt="Red Ciudadana"
                  className="h-10 w-auto max-w-[150px] object-contain"
                />
              </div>
              <p className="text-white/45 text-xs max-w-xs leading-relaxed">
                Inteligencia artificial para fortalecer la gestión pública.
                <br />
                Una iniciativa de Red Ciudadana.
              </p>
            </div>
            <nav className="flex flex-wrap gap-x-6 gap-y-2">
              {FOOTER_LINKS.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-white/45 hover:text-white/80 text-xs transition-colors"
                >
                  {link}
                </a>
              ))}
            </nav>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-white/30 text-xs">© 2026 Asociación Civil Red Ciudadana. Todos los derechos reservados.</p>
            <div className="flex items-center gap-2">
              <ShieldCheck size={13} className="text-white/30" />
              <span className="text-white/30 text-xs">Plataforma institucional</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
