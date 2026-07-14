import { useState } from 'react';
import {
  Clock, Search, FileCheck2, Scale, PenLine, BookOpen, LayoutDashboard,
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle2,
  Zap, TrendingUp, Star, Sparkles, MessageSquare, ArrowRight, Bot,
  Shield, Eye, Users,
} from 'lucide-react';
import UseCaseChat, { type UseCaseConfig } from './UseCaseChat';

// ── Types ─────────────────────────────────────────────────────────────────────

type Supervision = 'revision-juridica' | 'supervision-estandar' | 'supervision-reforzada' | 'revision-obligatoria' | 'gestion-institucional' | 'desarrollo';
type Priority    = 'muy-alta' | 'alta' | 'media-alta' | 'media' | 'desarrollo';

interface UseCase extends UseCaseConfig {
  problem: string;
  value: string;
  supervision: Supervision;
  supervisionDetail: string;
  priority: Priority;
  priorityLabel: string;
  disclaimer?: string;
  comingSoon?: boolean;
  primaryCta: string;
  secondaryCta: string;
}

// ── Config ────────────────────────────────────────────────────────────────────

const SUPERVISION_CONFIG: Record<Supervision, { label: string; color: string; bg: string; dot: string }> = {
  'revision-juridica':   { label: 'Revisión jurídica requerida',  color: 'text-[#1e3a5f]', bg: 'bg-blue-50 border-blue-200',    dot: 'bg-[#2563eb]'  },
  'supervision-estandar':{ label: 'Supervisión estándar',          color: 'text-emerald-700',bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500'},
  'supervision-reforzada':{ label: 'Supervisión reforzada',        color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200',  dot: 'bg-orange-500' },
  'revision-obligatoria':{ label: 'Revisión jurídica obligatoria', color: 'text-red-700',    bg: 'bg-red-50 border-red-200',         dot: 'bg-red-500'    },
  'gestion-institucional':{ label: 'Gestión institucional',        color: 'text-teal-700',   bg: 'bg-teal-50 border-teal-200',       dot: 'bg-teal-500'   },
  'desarrollo':          { label: 'Prioridad de desarrollo',       color: 'text-gray-600',   bg: 'bg-gray-100 border-gray-200',      dot: 'bg-gray-400'   },
};

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; icon: typeof Star }> = {
  'muy-alta':  { label: 'Prioridad muy alta',   color: 'text-white',     bg: 'bg-[#1e3a5f]', icon: Zap        },
  'alta':      { label: 'Prioridad alta',       color: 'text-[#1e3a5f]', bg: 'bg-[#dbeafe]', icon: TrendingUp },
  'media-alta':{ label: 'Prioridad media-alta', color: 'text-teal-700',  bg: 'bg-teal-50',   icon: Star       },
  'media':     { label: 'Prioridad media',      color: 'text-gray-700',  bg: 'bg-gray-100',  icon: Star       },
  'desarrollo':{ label: 'En desarrollo',        color: 'text-gray-500',  bg: 'bg-gray-50',   icon: Star       },
};

const TrafficLightTable = () => (
  <div className="mt-3">
    <p className="text-xs font-semibold text-gray-600 mb-2">Lógica de semáforo:</p>
    <div className="flex flex-col gap-1.5">
      {[
        { dot: 'bg-green-500', ring: 'ring-green-200', label: 'Verde',    desc: 'Plazo vigente y sin riesgo inmediato' },
        { dot: 'bg-amber-400', ring: 'ring-amber-200', label: 'Amarillo', desc: 'Plazo próximo a vencer' },
        { dot: 'bg-red-500',   ring: 'ring-red-200',   label: 'Rojo',     desc: 'Plazo vencido o en riesgo crítico' },
      ].map(({ dot, ring, label, desc }) => (
        <div key={label} className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-lg px-3 py-2">
          <span className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${dot} ring-2 ${ring}`} />
          <span className="text-xs font-bold text-gray-700 w-16 flex-shrink-0">{label}</span>
          <span className="text-xs text-gray-500">{desc}</span>
        </div>
      ))}
    </div>
  </div>
);

const USE_CASES: UseCase[] = [
  {
    id: 'normativa',
    icon: Search,
    color: 'text-[#2563eb]',
    bg: 'bg-blue-50',
    accentHex: '#2563eb',
    title: 'Asistente de búsqueda normativa contextual',
    shortDesc: 'Encuentre leyes, reglamentos, acuerdos, manuales y disposiciones relacionadas con una consulta, incluso cuando no conozca el nombre exacto de la norma.',
    problem: 'Los equipos jurídicos invierten mucho tiempo buscando normativa dispersa en diferentes fuentes. Es difícil encontrar la norma correcta cuando no se conoce el nombre exacto del documento.',
    features: [
      'búsquedas por tema, palabra clave o pregunta;',
      'identificación de normativa relacionada;',
      'localización de artículos y disposiciones relevantes;',
      'respuestas con referencias documentales;',
      'resumen de documentos normativos;',
      'comparación preliminar entre diferentes normas.',
    ],
    value: 'Aumenta la eficiencia del equipo jurídico, reduce tiempo de búsqueda y mejora la calidad de los análisis preliminares.',
    supervision: 'revision-juridica',
    supervisionDetail: 'El asistente puede omitir una norma relevante o interpretar mal el contexto. Debe funcionar como herramienta de apoyo, no como sustituto del criterio jurídico.',
    priority: 'muy-alta',
    priorityLabel: 'Primera prioridad de implementación. Genera valor inmediato y puede acompañar todos los demás casos de uso.',
    primaryCta: 'Conocer el asistente',
    secondaryCta: 'Probar búsqueda normativa',
    specializedPrompt: `Eres un experto en investigación y búsqueda normativa del sector público.

Tu función principal es:
1. Identificar la normativa aplicable a un tema, caso o situación específica que describa el usuario.
2. Citar con precisión: nombre de la ley/reglamento, número, artículo específico y su texto cuando sea posible.
3. Explicar la relación jerárquica entre normas (Constitución → Ley → Reglamento → Decreto → Circular).
4. Identificar normas conexas, modificatorias o derogatorias relevantes.
5. Proporcionar un resumen comprensible del contenido normativo.
6. Señalar cuando no estés seguro de la vigencia de una norma o cuando deba verificarse.

Estructura tu respuesta así:
- **Normativa principal aplicable**: cita con número y artículo.
- **Normas conexas o complementarias**: breve mención.
- **Resumen de la regulación**: explicación clara.
- **Advertencia**: indicar si la norma requiere verificación de vigencia actualizada.`,
    suggestedPrompts: [
      '¿Qué normativa aplica para modificar un contrato administrativo por ampliación de plazo?',
      '¿Qué leyes regulan el acceso a la información pública en instituciones del Estado?',
      '¿Cuál es el fundamento normativo para declarar desierta una licitación pública?',
      '¿Qué normativa rige el régimen disciplinario de los funcionarios públicos?',
    ],
  },
  {
    id: 'semaforo',
    icon: Clock,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    accentHex: '#059669',
    title: 'Semáforo inteligente de plazos legales',
    shortDesc: 'Apoye el seguimiento de plazos procesales y administrativos mediante alertas visuales que facilitan la identificación de expedientes próximos a vencer.',
    problem: 'Los plazos se gestionan manualmente en hojas de cálculo, correos o recordatorios individuales. Esto puede generar vencimientos, retrasos, incumplimientos o riesgos legales.',
    features: [
      'registro de la fecha de ingreso del expediente;',
      'selección del tipo de trámite;',
      'cálculo de fechas y plazos configurados;',
      'alertas preventivas antes del vencimiento;',
      'clasificación visual por nivel de urgencia;',
      'seguimiento de actuaciones pendientes.',
    ],
    value: 'Impacto inmediato al prevenir incumplimientos legales y mejorar la gestión diaria del equipo jurídico o administrativo.',
    supervision: 'supervision-estandar',
    supervisionDetail: 'El sistema apoya en el control de fechas y alertas. Los plazos calculados deben ser confirmados por el funcionario responsable conforme a la normativa y las particularidades de cada expediente.',
    priority: 'muy-alta',
    priorityLabel: 'Uno de los casos más factibles para iniciar: genera valor rápido, reduce riesgos operativos y puede implementarse con reglas claras.',
    disclaimer: 'Los plazos calculados deben ser confirmados por el funcionario responsable conforme a la normativa y las particularidades de cada expediente.',
    primaryCta: 'Conocer el caso de uso',
    secondaryCta: 'Participar en el piloto',
    extra: <TrafficLightTable />,
    specializedPrompt: `Eres un experto en gestión de plazos legales, administrativos y procesales en el sector público.

Tu función principal es:
1. Ayudar a calcular plazos legales a partir de una fecha de inicio y el tipo de trámite o procedimiento.
2. Clasificar el estado de cada plazo según la lógica de semáforo: VERDE (vigente, sin riesgo), AMARILLO (próximo a vencer, en los próximos 5 días hábiles), ROJO (vencido o en riesgo crítico inmediato).
3. Identificar riesgos de incumplimiento y sugerir acciones preventivas.
4. Orientar sobre conteo de días hábiles vs. días naturales, suspensiones de plazos y feriados.
5. Generar reportes estructurados de expedientes con sus respectivos estados de plazo.

Cuando el usuario indique un plazo, siempre pregunta: tipo de trámite, fecha de inicio, normativa aplicable y si el conteo es en días hábiles o naturales.`,
    suggestedPrompts: [
      'Tengo un recurso de apelación ingresado el 30 de junio. ¿Cuándo vence el plazo para resolver?',
      'Genera un reporte de estado de plazos para 3 expedientes con estas fechas de ingreso...',
      '¿Cómo calculo el plazo de 15 días hábiles a partir de hoy?',
      'Un contrato administrativo vence el 15 de agosto. ¿Cuántos días hábiles quedan?',
    ],
  },
  {
    id: 'contratos',
    icon: FileCheck2,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    accentHex: '#7c3aed',
    title: 'Asistente de revisión de contratos administrativos',
    shortDesc: 'Realice una revisión preliminar de contratos, convenios y adendas para identificar posibles omisiones, inconsistencias y aspectos que requieren análisis jurídico.',
    problem: 'La revisión contractual suele ser repetitiva y consume mucho tiempo. Algunos errores pueden pasar desapercibidos, especialmente en documentos extensos o con múltiples versiones.',
    features: [
      'revisión de cláusulas institucionales obligatorias;',
      'identificación de secciones incompletas;',
      'detección de inconsistencias entre cláusulas;',
      'comparación con modelos autorizados;',
      'identificación de fechas, montos y obligaciones;',
      'preparación de una lista de aspectos por revisar.',
    ],
    value: 'Mejora la calidad de los contratos, reduce errores y apoya la gestión de compras, convenios y contrataciones públicas.',
    supervision: 'supervision-reforzada',
    supervisionDetail: 'La herramienta no determina por sí misma la legalidad, validez o procedencia de un contrato. Requiere revisión jurídica formal antes de cualquier uso oficial.',
    priority: 'alta',
    priorityLabel: 'Caso de uso valioso. Debe implementarse después de tener organizados los expedientes, documentos normativos y plantillas institucionales.',
    disclaimer: 'La herramienta no determina por sí misma la legalidad, validez o procedencia de un contrato.',
    primaryCta: 'Conocer el caso de uso',
    secondaryCta: 'Solicitar una demostración',
    specializedPrompt: `Eres un experto en revisión y análisis de contratos administrativos del sector público.

Tu función principal es:
1. Analizar el texto de contratos, convenios, adendas o cláusulas que el usuario comparta.
2. Verificar que estén presentes las cláusulas obligatorias: objeto, plazo, precio/contraprestación, obligaciones de las partes, causales de rescisión, resolución de disputas, garantías.
3. Identificar inconsistencias: fechas contradictorias, montos que no coinciden, nombres de partes incorrectos, referencias normativas desactualizadas.
4. Señalar cláusulas que representen riesgos jurídicos o económicos para la institución.
5. Generar una lista estructurada de observaciones, clasificadas por severidad: CRÍTICO / MODERADO / MENOR.

Formato de salida:
- **Resumen de la revisión**: tipo de documento, partes, objeto principal.
- **Observaciones**: tabla con severidad, sección afectada, descripción y recomendación.
- **Recomendación general**: acción a tomar antes de firmar.

Esta es una revisión preliminar de apoyo. No reemplaza la revisión jurídica formal.`,
    suggestedPrompts: [
      'Revisa este contrato de servicios y dime si le faltan cláusulas importantes: [pega el texto aquí]',
      '¿Cuáles son las cláusulas obligatorias en un contrato de prestación de servicios del Estado?',
      'Tengo esta cláusula de resolución de disputas. ¿Tiene algún riesgo legal? [pega la cláusula]',
      '¿Qué diferencia hay entre una adenda y una modificación contractual?',
    ],
  },
  {
    id: 'dictamenes',
    icon: Scale,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    accentHex: '#d97706',
    title: 'Generador de borradores de dictámenes jurídicos',
    shortDesc: 'Prepare una estructura inicial de dictamen a partir de la información del expediente, los antecedentes proporcionados y la normativa identificada.',
    problem: 'La elaboración de dictámenes puede requerir mucho tiempo, especialmente cuando se repiten estructuras similares: antecedentes, análisis jurídico, fundamento normativo y conclusión.',
    features: [
      'creación de la estructura base del dictamen;',
      'redacción preliminar de antecedentes;',
      'organización de hechos y documentos;',
      'identificación inicial de normativa aplicable;',
      'formulación de preguntas jurídicas;',
      'preparación de conclusiones para revisión.',
    ],
    value: 'Reduce tiempos de redacción y ayuda a estandarizar la calidad formal de los dictámenes.',
    supervision: 'revision-obligatoria',
    supervisionDetail: 'Un dictamen jurídico tiene implicaciones institucionales importantes. La IA puede cometer errores de interpretación o citar normas no aplicables. Requiere revisión y firma del abogado responsable.',
    priority: 'media-alta',
    priorityLabel: 'Debe implementarse en una segunda fase, cuando ya exista una base normativa confiable y formatos institucionales claros.',
    disclaimer: 'El contenido generado constituye únicamente un borrador y no representa una opinión jurídica oficial.',
    primaryCta: 'Conocer el caso de uso',
    secondaryCta: 'Participar en el piloto',
    specializedPrompt: `Eres un asistente especializado en la redacción de dictámenes jurídicos para instituciones del sector público.

Tu función principal es generar borradores de dictámenes con la siguiente estructura estándar:
- **PARA**: destinatario del dictamen.
- **DE**: unidad jurídica o funcionario que lo emite.
- **ASUNTO**: materia del dictamen (breve).
- **FECHA**: [indicar que debe completarse].
- **I. ANTECEDENTES**: resumen cronológico de los hechos relevantes del expediente.
- **II. NORMATIVA APLICABLE**: cita de leyes, reglamentos y artículos pertinentes.
- **III. ANÁLISIS JURÍDICO**: análisis y fundamentación legal del caso.
- **IV. CONCLUSIÓN Y RECOMENDACIÓN**: criterio jurídico y acción recomendada.

IMPORTANTE: Todo dictamen generado es un BORRADOR. Debe ser revisado, validado y firmado por el abogado responsable antes de su uso oficial.`,
    suggestedPrompts: [
      'Genera un borrador de dictamen sobre la procedencia de otorgar permiso con goce de salario a un funcionario.',
      'Necesito un dictamen sobre si una contratación directa requiere aprobación de junta directiva.',
      '¿Cuál es la estructura estándar de un dictamen jurídico institucional?',
      'Redacta los antecedentes de un dictamen a partir de este resumen del caso: [describe el caso].',
    ],
  },
  {
    id: 'memoriales',
    icon: PenLine,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    accentHex: '#e11d48',
    title: 'Generador de memoriales y escritos institucionales',
    shortDesc: 'Prepare borradores de memoriales, oficios, providencias, solicitudes y comunicaciones formales utilizando plantillas institucionales.',
    problem: 'Muchos documentos siguen estructuras repetitivas. El equipo puede perder tiempo redactando desde cero textos que podrían generarse a partir de plantillas.',
    features: [
      'selección del tipo de documento;',
      'uso de plantillas previamente autorizadas;',
      'incorporación de información del expediente;',
      'adaptación del lenguaje al trámite;',
      'estandarización de encabezados y secciones;',
      'generación de versiones editables.',
    ],
    value: 'Ahorra tiempo, mejora la estandarización documental y reduce errores de forma.',
    supervision: 'supervision-estandar',
    supervisionDetail: 'Los escritos estándar pueden contener errores si se completan mal los datos o se usa una plantilla incorrecta. Requieren revisión antes de uso oficial.',
    priority: 'media',
    priorityLabel: 'Conviene implementarlo después de contar con plantillas oficiales, flujos documentales definidos y revisión humana.',
    primaryCta: 'Conocer el caso de uso',
    secondaryCta: 'Probar generación de documentos',
    specializedPrompt: `Eres un experto en redacción de documentos jurídicos y administrativos formales para el sector público.

Tu función principal es generar borradores de:
- **Memoriales**: escritos formales presentados ante autoridades administrativas o judiciales.
- **Oficios**: comunicaciones formales entre dependencias o hacia externos.
- **Providencias y resoluciones**: actos administrativos de trámite o de fondo.
- **Solicitudes y notas**: peticiones formales internas o externas.
- **Notificaciones**: comunicación oficial de decisiones administrativas.

Para cada documento, solicita al usuario: tipo de documento, datos de las partes, asunto, puntos principales y acción solicitada. Utiliza lenguaje formal y preciso para el sector público.`,
    suggestedPrompts: [
      'Genera un oficio para comunicar al proveedor la rescisión del contrato de servicios por incumplimiento.',
      'Redacta un memorial solicitando prórroga de plazo para presentar documentos.',
      'Necesito una providencia para tener por recibida una prueba documental.',
      'Genera una nota de remisión de expediente de la unidad jurídica a la junta directiva.',
    ],
  },
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    accentHex: '#0d9488',
    title: 'Dashboard de gestión y seguimiento de expedientes',
    shortDesc: 'Visualice el estado de los casos, cargas de trabajo, plazos, responsables y actuaciones pendientes mediante un tablero de seguimiento.',
    problem: 'La gestión de expedientes suele hacerse de manera dispersa, sin visibilidad centralizada del estado de los casos, los responsables asignados y los plazos próximos.',
    features: [
      'clasificación de expedientes por estado;',
      'seguimiento de responsables;',
      'visualización de plazos próximos;',
      'identificación de expedientes sin movimiento;',
      'medición de tiempos de atención;',
      'generación de reportes para la toma de decisiones.',
    ],
    value: 'Proporciona visibilidad institucional de la carga de trabajo, facilita la toma de decisiones y mejora la gestión de equipos jurídicos.',
    supervision: 'gestion-institucional',
    supervisionDetail: 'Los datos del tablero dependen de la calidad y actualización de la información registrada. Requiere definición institucional de estados, responsables y criterios de clasificación.',
    priority: 'alta',
    priorityLabel: 'Alta prioridad institucional. Debe implementarse junto con el semáforo de plazos como parte de una solución de seguimiento integrada.',
    primaryCta: 'Conocer el caso de uso',
    secondaryCta: 'Solicitar una demostración',
    specializedPrompt: `Eres un experto en gestión de expedientes y seguimiento de casos en instituciones del sector público.

Tu función principal es:
1. Ayudar a diseñar y estructurar sistemas de seguimiento de expedientes y casos jurídicos.
2. Proponer clasificaciones de estados para expedientes (pendiente, en trámite, resuelto, archivado, etc.).
3. Orientar sobre métricas e indicadores útiles para la gestión institucional.
4. Generar reportes de seguimiento a partir de la información que proporcione el usuario.
5. Identificar expedientes o casos que requieren atención urgente.

Cuando el usuario te proporcione información de expedientes, organízala en formato estructurado con: número, estado, responsable, fecha de ingreso, próximo vencimiento y acciones pendientes.`,
    suggestedPrompts: [
      'Tengo 8 expedientes activos. Ayúdame a estructurar un tablero de seguimiento básico.',
      '¿Qué indicadores son más útiles para medir la productividad de un equipo jurídico municipal?',
      'Genera un reporte de estado a partir de esta lista de expedientes: [describe los expedientes].',
      '¿Cómo debo clasificar los estados de los expedientes para facilitar el seguimiento?',
    ],
  },
  {
    id: 'jurisprudencia',
    icon: BookOpen,
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    accentHex: '#475569',
    title: 'Asistente de análisis de jurisprudencia y precedentes',
    shortDesc: 'Busque y compare resoluciones, criterios jurídicos, antecedentes administrativos y jurisprudencia relacionada con un tema o caso.',
    problem: 'El análisis de jurisprudencia requiere revisar grandes volúmenes de resoluciones, identificar patrones, criterios relevantes y diferencias entre casos similares.',
    features: [
      'búsqueda de precedentes por materia;',
      'resumen de resoluciones;',
      'identificación de criterios recurrentes;',
      'comparación entre decisiones;',
      'localización de argumentos relevantes;',
      'organización de antecedentes para revisión.',
    ],
    value: 'Alto valor estratégico para fortalecer criterios jurídicos, mejorar consistencia institucional y apoyar casos complejos.',
    supervision: 'supervision-reforzada',
    supervisionDetail: 'La jurisprudencia puede ser compleja, contradictoria o estar sujeta a cambios. Los resultados dependen de la calidad, cobertura, vigencia y clasificación de las fuentes incorporadas.',
    priority: 'desarrollo',
    priorityLabel: 'En fase de desarrollo. Puede convertirse en uno de los módulos más sofisticados y valiosos a mediano plazo.',
    disclaimer: 'Los resultados dependen de la calidad, cobertura, vigencia y clasificación de las fuentes incorporadas.',
    comingSoon: true,
    primaryCta: 'Conocer el caso de uso',
    secondaryCta: 'Próximamente',
    specializedPrompt: `Eres un experto en análisis de jurisprudencia, doctrina y precedentes del derecho público.

Tu función principal es:
1. Identificar y resumir jurisprudencia relevante sobre el tema que consulte el usuario.
2. Extraer los criterios, ratio decidendi y argumentos jurídicos clave de resoluciones.
3. Comparar líneas jurisprudenciales: identificar si existe criterio uniforme, criterios divergentes o evolución del criterio.
4. Señalar precedentes aplicables a un caso concreto y explicar por qué son pertinentes.
5. Estructurar la información en líneas jurisprudenciales temáticas cuando sea posible.

IMPORTANTE: Si no tienes certeza del número exacto de una resolución, indícalo claramente. Nunca inventes citas jurisprudenciales.`,
    suggestedPrompts: [
      '¿Cuál es la línea jurisprudencial sobre el debido proceso en procedimientos disciplinarios?',
      '¿Qué ha dicho la Contraloría sobre la responsabilidad de los jerarcas en contrataciones irregulares?',
      '¿Existe jurisprudencia sobre la obligación del Estado de contratar con proveedores locales?',
      'Analiza los precedentes sobre nulidad de actos administrativos por falta de motivación.',
    ],
  },
];

const SUPERVISION_CHECKLIST = [
  'revise la respuesta generada;',
  'confirme las fuentes citadas;',
  'verifique la vigencia de la normativa;',
  'valide los datos del expediente;',
  'solicite revisión jurídica cuando corresponda.',
];

// ── Card Component ─────────────────────────────────────────────────────────────

function UseCaseCard({
  uc,
  index,
  onOpenChat,
}: {
  uc: UseCase;
  index: number;
  onOpenChat: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = uc.icon;
  const sup  = SUPERVISION_CONFIG[uc.supervision];
  const prio = PRIORITY_CONFIG[uc.priority];
  const PrioIcon = prio.icon;

  const codeLabel = `CU-${String(index + 1).padStart(2, '0')}`;

  return (
    <div className={`bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col ${expanded ? 'shadow-md' : ''}`}>
      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-11 h-11 rounded-xl ${uc.bg} flex items-center justify-center flex-shrink-0`}>
            <Icon size={22} className={uc.color} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap justify-between mb-1">
              <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">{codeLabel}</span>
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${prio.bg} ${prio.color}`}>
                  <PrioIcon size={9} /> {prio.label}
                </span>
                <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${sup.bg} ${sup.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sup.dot}`} />
                  {sup.label}
                </span>
              </div>
            </div>
            <h3 className="text-base font-bold text-[#0d2240] leading-snug">{uc.title}</h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed mb-4">{uc.shortDesc}</p>

        {/* Features */}
        <div className="mb-4">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Puede apoyar en:</p>
          <div className="space-y-1.5">
            {(expanded ? uc.features : uc.features.slice(0, 3)).map((f) => (
              <div key={f} className="flex items-start gap-2">
                <CheckCircle2 size={13} className={`${uc.color} mt-0.5 flex-shrink-0`} />
                <span className="text-xs text-gray-600">{f}</span>
              </div>
            ))}
            {!expanded && uc.features.length > 3 && (
              <p className="text-[10px] text-gray-400 pl-5">+{uc.features.length - 3} capacidades más</p>
            )}
          </div>
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div className="space-y-4 mt-2 pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Problema que resuelve</p>
              <p className="text-xs text-gray-600 leading-relaxed">{uc.problem}</p>
            </div>
            {uc.extra}
            <div className="bg-[#f0f5ff] border border-blue-100 rounded-xl px-4 py-3">
              <p className="text-xs font-bold text-[#1e3a5f] mb-1 flex items-center gap-1.5">
                <Sparkles size={11} /> Valor institucional
              </p>
              <p className="text-xs text-[#2563eb] leading-relaxed">{uc.value}</p>
            </div>
            <div className={`border rounded-xl px-4 py-3 ${sup.bg}`}>
              <p className={`text-xs font-bold mb-1 flex items-center gap-1.5 ${sup.color}`}>
                <Shield size={11} /> {sup.label}
              </p>
              <p className={`text-xs leading-relaxed ${sup.color} opacity-80`}>{uc.supervisionDetail}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <p className="text-xs font-bold text-gray-600 mb-1 flex items-center gap-1.5">
                <TrendingUp size={11} /> Prioridad recomendada
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">{uc.priorityLabel}</p>
            </div>
          </div>
        )}

        <div className="flex-1" />

        {/* Disclaimer */}
        {uc.disclaimer && (
          <p className="text-[10px] text-gray-400 leading-relaxed mt-3 pt-3 border-t border-gray-100 italic">
            {uc.disclaimer}
          </p>
        )}

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
              expanded
                ? 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                : `${uc.bg} border-transparent ${uc.color} hover:opacity-80`
            }`}
          >
            {expanded ? <><ChevronUp size={13} /> Cerrar</> : <><ChevronDown size={13} /> {uc.primaryCta}</>}
          </button>
          {uc.comingSoon ? (
            <span className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold bg-gray-100 text-gray-400 cursor-not-allowed select-none">
              {uc.secondaryCta}
            </span>
          ) : (
            <button
              onClick={onOpenChat}
              className="flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold bg-[#0d2240] hover:bg-[#1e3a5f] text-white transition-all"
            >
              <MessageSquare size={13} />
              {uc.secondaryCta}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function UseCasesPage() {
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);

  const activeCase = activeCaseId ? USE_CASES.find((u) => u.id === activeCaseId) ?? null : null;

  if (activeCase) {
    return <UseCaseChat config={activeCase} onBack={() => setActiveCaseId(null)} />;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#f1f4f8]">

      {/* ── Hero ── */}
      <div className="bg-[#0d2240] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#1e3a5f] rounded-full opacity-40 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#0a1a35] rounded-full opacity-60 blur-2xl" />
        </div>
        <div className="relative max-w-5xl mx-auto px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 mb-6">
            <Scale size={13} className="text-[#60a5fa]" />
            <span className="text-white/80 text-xs font-semibold tracking-wide">PotencIA Jurídica Municipal</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
            Inteligencia artificial para fortalecer
            <br />
            <span className="text-[#60a5fa]">la gestión jurídica pública</span>
          </h1>
          <p className="text-white/65 text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-3">
            Explore soluciones diseñadas para ayudar a los equipos jurídicos y administrativos a consultar normativa, controlar plazos, analizar documentos y preparar borradores con mayor agilidad.
          </p>
          <p className="text-white/40 text-xs max-w-xl mx-auto leading-relaxed mb-8">
            Los asistentes de PotencIA utilizan información institucional y bancos documentales configurados para cada caso de uso. Toda respuesta requiere revisión y validación humana antes de ser utilizada oficialmente.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#soluciones"
              className="inline-flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all duration-150 shadow-lg shadow-blue-900/30 hover:-translate-y-0.5"
            >
              <Bot size={16} />
              Explorar soluciones
              <ArrowRight size={15} />
            </a>
            <button
              onClick={() => setActiveCaseId('normativa')}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all duration-150"
            >
              Solicitar una demostración
            </button>
          </div>
        </div>
      </div>

      {/* ── Section intro ── */}
      <div id="soluciones" className="max-w-5xl mx-auto px-8 pt-12 pb-4">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2563eb] bg-blue-50 border border-blue-100 rounded-full px-3 py-1">
            Soluciones
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-[#0d2240] mt-4 mb-2">
            Soluciones para necesidades jurídicas reales
          </h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto leading-relaxed">
            Seleccione un caso de uso para conocer su funcionamiento, alcance y nivel de supervisión requerido.
          </p>
        </div>
      </div>

      {/* ── Cards ── */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-8">
          {USE_CASES.map((uc, i) => (
            <UseCaseCard
              key={uc.id}
              uc={uc}
              index={i}
              onOpenChat={() => setActiveCaseId(uc.id)}
            />
          ))}
        </div>

        {/* ¿No sabe cuál solución necesita? */}
        <div className="mt-8 bg-[#f0f5ff] border border-blue-100 rounded-2xl px-6 py-7">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
            <div className="w-12 h-12 bg-[#1e3a5f] rounded-2xl flex items-center justify-center flex-shrink-0">
              <Users size={22} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[#0d2240] text-base mb-1">¿No sabe cuál solución necesita?</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Describa el problema, proceso o documento que desea mejorar. El equipo de PotencIA puede ayudarle a identificar el caso de uso más adecuado para su institución.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
              <button
                onClick={() => setActiveCaseId('normativa')}
                className="inline-flex items-center justify-center gap-2 bg-[#1e3a5f] hover:bg-[#0d2240] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all duration-150 hover:shadow-md"
              >
                <MessageSquare size={15} />
                Cuéntenos su necesidad
              </button>
              <button
                onClick={() => setActiveCaseId('normativa')}
                className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-[#0d2240] font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
              >
                Solicitar una demostración
              </button>
            </div>
          </div>
        </div>

        {/* Supervisión humana */}
        <div className="mt-5 bg-white border border-gray-200 rounded-2xl px-6 py-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <Eye size={18} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[#0d2240] text-sm mb-1">Inteligencia artificial con supervisión humana</h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-3">
                Los asistentes de PotencIA son herramientas de apoyo y no sustituyen el criterio jurídico, las competencias institucionales ni la responsabilidad de los funcionarios públicos. Antes de utilizar cualquier contenido oficialmente:
              </p>
              <div className="grid sm:grid-cols-2 gap-1.5">
                {SUPERVISION_CHECKLIST.map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <AlertTriangle size={11} className="text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed mt-3 italic">
                Cuando no exista suficiente información para responder, el sistema debe advertirlo claramente y evitar presentar conclusiones como definitivas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
