import { useState } from 'react';
import {
  Clock, Search, FileCheck2, Scale, PenLine, BookOpen,
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle2,
  Zap, Star, TrendingUp, Sparkles, MessageSquare,
} from 'lucide-react';
import UseCaseChat, { type UseCaseConfig } from './UseCaseChat';

// ── Types ─────────────────────────────────────────────────────────────────────

type Risk    = 'bajo' | 'bajo-medio' | 'medio' | 'medio-alto' | 'alto';
type Priority = 'muy-alta' | 'alta' | 'media-alta' | 'media' | 'baja-inicial';

interface UseCase extends UseCaseConfig {
  problem: string;
  value: string;
  risk: Risk;
  riskDetail: string;
  priority: Priority;
  priorityLabel: string;
  extra?: React.ReactNode;
}

// ── Config ────────────────────────────────────────────────────────────────────

const RISK_CONFIG: Record<Risk, { label: string; color: string; bg: string; dot: string }> = {
  'bajo':       { label: 'Riesgo bajo',       color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
  'bajo-medio': { label: 'Riesgo bajo-medio',  color: 'text-teal-700',   bg: 'bg-teal-50 border-teal-200',      dot: 'bg-teal-500'   },
  'medio':      { label: 'Riesgo medio',       color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200',    dot: 'bg-amber-500'  },
  'medio-alto': { label: 'Riesgo medio-alto',  color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200',  dot: 'bg-orange-500' },
  'alto':       { label: 'Riesgo alto',        color: 'text-red-700',    bg: 'bg-red-50 border-red-200',        dot: 'bg-red-500'    },
};

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; icon: typeof Star }> = {
  'muy-alta':     { label: 'Prioridad muy alta',    color: 'text-white',     bg: 'bg-[#1e3a5f]',   icon: Zap        },
  'alta':         { label: 'Prioridad alta',        color: 'text-[#1e3a5f]', bg: 'bg-[#dbeafe]',   icon: TrendingUp },
  'media-alta':   { label: 'Prioridad media-alta',  color: 'text-teal-700',  bg: 'bg-teal-50',     icon: Star       },
  'media':        { label: 'Prioridad media',       color: 'text-gray-700',  bg: 'bg-gray-100',    icon: Star       },
  'baja-inicial': { label: 'Baja (fase inicial)',   color: 'text-gray-500',  bg: 'bg-gray-50',     icon: Star       },
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
    id: 'semaforo',
    icon: Clock,
    color: 'text-[#2563eb]',
    bg: 'bg-blue-50',
    accentHex: '#2563eb',
    title: 'Semáforo inteligente de plazos legales',
    shortDesc: 'Sistema de control de plazos procesales y administrativos con alertas visuales tipo semáforo para prevenir vencimientos.',
    problem: 'En muchas instituciones públicas, los plazos se gestionan manualmente en hojas de cálculo, correos o recordatorios individuales. Esto puede generar vencimientos, retrasos, incumplimientos o riesgos legales.',
    features: [
      'Registro de fecha de ingreso del expediente',
      'Cálculo automático de plazos según tipo de trámite',
      'Alertas preventivas antes del vencimiento',
      'Identificación de responsables',
      'Reporte de expedientes en riesgo',
      'Historial de cumplimiento de plazos',
    ],
    value: 'Tiene un impacto inmediato porque ayuda a prevenir incumplimientos legales y mejora la gestión diaria del equipo jurídico o administrativo.',
    risk: 'bajo-medio',
    riskDetail: 'El sistema no emite criterio jurídico, solo apoya en el control de fechas y alertas. Aun así, debe validar correctamente feriados, días hábiles y reglas específicas de cada procedimiento.',
    priority: 'muy-alta',
    priorityLabel: 'Es uno de los casos más factibles para iniciar porque genera valor rápido, reduce riesgos operativos y puede implementarse con reglas claras.',
    extra: <TrafficLightTable />,
    specializedPrompt: `Eres un experto en gestión de plazos legales, administrativos y procesales en el sector público.

Tu función principal es:
1. Ayudar a calcular plazos legales a partir de una fecha de inicio y el tipo de trámite o procedimiento.
2. Clasificar el estado de cada plazo según la lógica de semáforo: VERDE (vigente, sin riesgo), AMARILLO (próximo a vencer, en los próximos 5 días hábiles), ROJO (vencido o en riesgo crítico inmediato).
3. Identificar riesgos de incumplimiento y sugerir acciones preventivas.
4. Orientar sobre conteo de días hábiles vs. días naturales, suspensiones de plazos y feriados.
5. Generar reportes estructurados de expedientes con sus respectivos estados de plazo.

Cuando el usuario te indique un plazo, siempre pregunta: tipo de trámite, fecha de inicio, normativa aplicable (si la conoce), y si el conteo es en días hábiles o naturales.

Utiliza formato claro con tablas o listas cuando presentes múltiples plazos. Clasifica cada uno con los indicadores VERDE / AMARILLO / ROJO y el motivo.`,
    suggestedPrompts: [
      'Tengo un recurso de apelación ingresado el 30 de junio. ¿Cuándo vence el plazo para resolver?',
      'Genera un reporte de estado de plazos para 3 expedientes con estas fechas de ingreso...',
      '¿Cómo calculo el plazo de 15 días hábiles a partir de hoy? ¿Cuáles días no cuentan?',
      'Un contrato administrativo vence el 15 de agosto. ¿Cuántos días hábiles quedan y qué debo hacer?',
    ],
  },
  {
    id: 'normativa',
    icon: Search,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    accentHex: '#0d9488',
    title: 'Asistente de búsqueda normativa contextual',
    shortDesc: 'Búsqueda inteligente de leyes, reglamentos y normativa interna que interpreta el contexto de la consulta y sugiere normativa relacionada.',
    problem: 'Los equipos jurídicos y administrativos invierten mucho tiempo buscando normativa dispersa en diferentes fuentes. Además, pueden existir dificultades para encontrar la norma correcta cuando no se conoce el nombre exacto del documento.',
    features: [
      'Búsqueda por tema, palabra clave o pregunta',
      'Respuestas con citas normativas',
      'Identificación de artículos relevantes',
      'Vinculación entre normas relacionadas',
      'Búsqueda en normativa interna e institucional',
      'Resumen del contenido normativo encontrado',
    ],
    value: 'Aumenta la eficiencia del equipo jurídico, reduce tiempo de búsqueda y mejora la calidad de los análisis preliminares.',
    risk: 'medio',
    riskDetail: 'El riesgo principal es que el asistente omita una norma relevante o interprete mal el contexto. Por eso debe funcionar como herramienta de apoyo, no como sustituto del criterio jurídico.',
    priority: 'alta',
    priorityLabel: 'Debe implementarse en la primera fase, pero con controles claros: fuentes verificadas, citas obligatorias y advertencia de revisión humana.',
    specializedPrompt: `Eres un experto en investigación y búsqueda normativa del sector público costarricense e iberoamericano.

Tu función principal es:
1. Identificar la normativa aplicable a un tema, caso o situación específica que describa el usuario.
2. Citar con precisión: nombre de la ley/reglamento, número, artículo específico y su texto cuando sea posible.
3. Explicar la relación jerárquica entre normas (Constitución → Ley → Reglamento → Decreto → Circular).
4. Identificar normas conexas, modificatorias o derogatorias relevantes.
5. Proporcionar un resumen comprensible del contenido normativo.
6. Señalar cuando no estés seguro de la vigencia de una norma o cuando debas verificarse.

Siempre estructura tu respuesta así:
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
    id: 'contratos',
    icon: FileCheck2,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    accentHex: '#7c3aed',
    title: 'Asistente de revisión de contratos administrativos',
    shortDesc: 'Herramienta de revisión preliminar que identifica cláusulas faltantes, inconsistencias y riesgos en contratos, convenios y adendas.',
    problem: 'La revisión contractual suele ser repetitiva y consume mucho tiempo. Además, algunos errores pueden pasar desapercibidos, especialmente en documentos extensos o con múltiples versiones.',
    features: [
      'Revisión de cláusulas obligatorias',
      'Identificación de inconsistencias entre secciones',
      'Comparación con modelos institucionales',
      'Detección de fechas, montos o nombres contradictorios',
      'Señalamiento de posibles riesgos contractuales',
      'Lista de observaciones para revisión humana',
    ],
    value: 'Puede mejorar la calidad de los contratos, reducir errores y apoyar la gestión de compras, convenios y contrataciones públicas.',
    risk: 'medio-alto',
    riskDetail: 'La IA puede identificar riesgos, pero no debe aprobar contratos ni sustituir la revisión jurídica formal.',
    priority: 'media-alta',
    priorityLabel: 'Es un caso de uso valioso, pero debe implementarse después de tener ordenados los expedientes, documentos normativos y plantillas institucionales.',
    specializedPrompt: `Eres un experto en revisión y análisis de contratos administrativos del sector público.

Tu función principal es:
1. Analizar el texto de contratos, convenios, adendas o cláusulas que el usuario comparta.
2. Verificar que estén presentes las cláusulas obligatorias: objeto, plazo, precio/contraprestación, obligaciones de las partes, causales de rescisión, resolución de disputas, garantías.
3. Identificar inconsistencias: fechas contradictorias, montos que no coinciden, nombres de partes incorrectos, referencias normativas desactualizadas.
4. Señalar cláusulas que representen riesgos jurídicos o económicos para la institución.
5. Comparar con buenas prácticas contractuales del sector público.
6. Generar una lista estructurada de observaciones, clasificadas por severidad: CRÍTICO / MODERADO / MENOR.

Formato de salida sugerido:
- **Resumen de la revisión**: tipo de documento, partes, objeto principal.
- **Cláusulas verificadas**: listado de lo que está correcto.
- **Observaciones**: tabla con severidad, cláusula/sección afectada, descripción y recomendación.
- **Recomendación general**: acción a tomar antes de firmar.

Recuerda: esta es una revisión preliminar de apoyo. No reemplaza la revisión jurídica formal.`,
    suggestedPrompts: [
      'Revisa este contrato de servicios y dime si le faltan cláusulas importantes: [pega el texto aquí]',
      '¿Cuáles son las cláusulas obligatorias en un contrato de prestación de servicios del Estado?',
      'Tengo esta cláusula de resolución de disputas. ¿Tiene algún riesgo legal? [pega la cláusula]',
      '¿Qué diferencia hay entre una adenda y una modificación contractual? ¿Cuándo se usa cada una?',
    ],
  },
  {
    id: 'dictamenes',
    icon: Scale,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    accentHex: '#d97706',
    title: 'Generador de borradores de dictámenes jurídicos',
    shortDesc: 'Asistente que genera borradores iniciales de dictámenes a partir de información estructurada del expediente, normativa y documentos de soporte.',
    problem: 'La elaboración de dictámenes puede requerir mucho tiempo, especialmente cuando se repiten estructuras similares: antecedentes, análisis jurídico, fundamento normativo y conclusión.',
    features: [
      'Generación de estructura base del dictamen',
      'Redacción preliminar de antecedentes',
      'Identificación de normativa aplicable',
      'Propuesta de análisis jurídico inicial',
      'Formulación de conclusiones preliminares',
      'Adaptación a formatos institucionales',
    ],
    value: 'Puede reducir tiempos de redacción y ayudar a estandarizar la calidad formal de los dictámenes.',
    risk: 'alto',
    riskDetail: 'Un dictamen jurídico tiene implicaciones institucionales importantes. La IA puede cometer errores de interpretación, citar normas no aplicables o generar conclusiones débiles. Requiere revisión obligatoria.',
    priority: 'media',
    priorityLabel: 'Debe implementarse en una segunda fase, cuando ya exista una base normativa confiable y formatos institucionales claros.',
    specializedPrompt: `Eres un asistente especializado en la redacción de dictámenes jurídicos para instituciones del sector público.

Tu función principal es:
1. Generar borradores de dictámenes jurídicos a partir de los antecedentes y datos que proporcione el usuario.
2. Estructurar el dictamen con las siguientes secciones estándar:
   - **PARA**: destinatario del dictamen.
   - **DE**: unidad jurídica o funcionario que lo emite.
   - **ASUNTO**: materia del dictamen (breve).
   - **FECHA**: [indicar que debe completarse].
   - **I. ANTECEDENTES**: resumen cronológico de los hechos relevantes del expediente.
   - **II. NORMATIVA APLICABLE**: cita de leyes, reglamentos y artículos pertinentes.
   - **III. ANÁLISIS JURÍDICO**: análisis y fundamentación legal del caso.
   - **IV. CONCLUSIÓN Y RECOMENDACIÓN**: criterio jurídico y acción recomendada.
3. Adaptar el lenguaje a un estilo formal jurídico institucional.
4. Señalar explícitamente los campos que requieren verificación o información adicional del usuario.
5. Incluir las citas normativas de forma precisa.

IMPORTANTE: Todo dictamen generado es un BORRADOR de trabajo. Debe ser revisado, validado y firmado por el abogado responsable antes de su uso oficial. La IA no tiene facultad para emitir criterio jurídico vinculante.`,
    suggestedPrompts: [
      'Genera un borrador de dictamen jurídico sobre la procedencia de otorgar permiso con goce de salario a un funcionario para estudios.',
      'Necesito un dictamen sobre si una contratación directa de ₡15 millones requiere aprobación de junta directiva.',
      '¿Cuál es la estructura estándar de un dictamen jurídico institucional? Dame un esquema completo.',
      'Redacta los antecedentes de un dictamen a partir de este resumen del caso: [describe el caso].',
    ],
  },
  {
    id: 'memoriales',
    icon: PenLine,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    accentHex: '#e11d48',
    title: 'Generador de memoriales y escritos estándar',
    shortDesc: 'Generación automática de memoriales, oficios, providencias, solicitudes y comunicaciones formales a partir de plantillas institucionales.',
    problem: 'Muchos documentos siguen estructuras repetitivas. El equipo puede perder tiempo redactando desde cero textos que podrían generarse a partir de plantillas.',
    features: [
      'Generación de escritos con base en plantillas',
      'Autocompletado de datos del expediente',
      'Adaptación del texto según tipo de trámite',
      'Revisión de formato y estilo institucional',
      'Generación de versiones editables',
      'Sugerencias de redacción clara y formal',
    ],
    value: 'Ahorra tiempo, mejora la estandarización documental y reduce errores de forma.',
    risk: 'medio',
    riskDetail: 'Aunque los escritos estándar suelen ser menos complejos que un dictamen, pueden contener errores si se completan mal los datos o se usa una plantilla incorrecta.',
    priority: 'media',
    priorityLabel: 'Conviene implementarlo después de contar con plantillas oficiales, flujos documentales definidos y revisión humana.',
    specializedPrompt: `Eres un experto en redacción de documentos jurídicos y administrativos formales para el sector público.

Tu función principal es generar borradores de:
- **Memoriales**: escritos formales presentados ante autoridades administrativas o judiciales.
- **Oficios**: comunicaciones formales entre dependencias o hacia externos.
- **Providencias y resoluciones**: actos administrativos de trámite o de fondo.
- **Solicitudes y notas**: peticiones formales internas o externas.
- **Actas**: registro formal de reuniones o diligencias.
- **Notificaciones**: comunicación oficial de decisiones administrativas.

Para generar cada documento, solicita al usuario:
1. Tipo de documento requerido.
2. Datos de las partes (remitente, destinatario, expediente si aplica).
3. Asunto o materia.
4. Puntos o hechos principales a incluir.
5. Acción o respuesta que se solicita (si aplica).

Utiliza lenguaje formal, preciso y apropiado para el sector público. Estructura el documento con los elementos estándar: encabezado, cuerpo, cierre y firma. Indica claramente los campos que deben ser completados o verificados por el usuario.`,
    suggestedPrompts: [
      'Genera un oficio para comunicar al proveedor XYZ la rescisión del contrato de servicios por incumplimiento.',
      'Redacta un memorial solicitando prórroga de plazo para presentar documentos en un expediente administrativo.',
      'Necesito una providencia para tener por recibida una prueba documental en un procedimiento sancionatorio.',
      'Genera una nota de remisión de expediente de la unidad jurídica a la junta directiva para resolución.',
    ],
  },
  {
    id: 'jurisprudencia',
    icon: BookOpen,
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    accentHex: '#475569',
    title: 'Asistente de análisis de jurisprudencia y precedentes',
    shortDesc: 'Sistema de búsqueda y análisis comparativo de jurisprudencia, criterios administrativos y resoluciones anteriores por tema jurídico.',
    problem: 'El análisis de jurisprudencia requiere revisar grandes volúmenes de resoluciones, identificar patrones, criterios relevantes y diferencias entre casos similares.',
    features: [
      'Búsqueda de precedentes por tema',
      'Resumen de resoluciones relevantes',
      'Identificación de criterios comunes',
      'Comparación entre casos similares',
      'Extracción de argumentos jurídicos',
      'Mapeo de líneas jurisprudenciales',
    ],
    value: 'Tiene alto valor estratégico para fortalecer criterios jurídicos, mejorar consistencia institucional y apoyar casos complejos.',
    risk: 'alto',
    riskDetail: 'La jurisprudencia puede ser compleja, contradictoria o estar sujeta a cambios. La IA podría simplificar demasiado un criterio o presentar como aplicable un precedente que no corresponde.',
    priority: 'baja-inicial',
    priorityLabel: 'Baja para fase inicial, alta para fase avanzada. Puede convertirse en uno de los módulos más sofisticados y valiosos a mediano plazo.',
    specializedPrompt: `Eres un experto en análisis de jurisprudencia, doctrina y precedentes del derecho público costarricense e iberoamericano.

Tu función principal es:
1. Identificar y resumir jurisprudencia relevante sobre el tema que consulte el usuario.
2. Extraer los criterios, ratio decidendi y argumentos jurídicos clave de resoluciones judiciales o administrativas.
3. Comparar líneas jurisprudenciales: identificar si existe criterio uniforme, criterios divergentes o evolución del criterio.
4. Señalar precedentes aplicables a un caso concreto y explicar por qué son pertinentes.
5. Identificar precedentes del Tribunal Supremo de Elecciones, Sala Constitucional, Sala Primera, Procuraduría General de la República, Contraloría General de la República, y órganos administrativos relevantes.
6. Estructurar la información en líneas jurisprudenciales temáticas cuando sea posible.

Formato sugerido de respuesta:
- **Tema consultado**: descripción del eje jurídico.
- **Precedentes identificados**: tabla con órgano, número de resolución (si lo conoces), año, criterio principal.
- **Análisis de la línea jurisprudencial**: tendencia dominante y variaciones relevantes.
- **Aplicabilidad al caso**: cómo aplica este precedente a la situación descrita.
- **Advertencia**: indicar que las resoluciones citadas deben verificarse en las fuentes oficiales.

IMPORTANTE: Si no tienes certeza del número exacto de una resolución, indícalo claramente. Nunca inventes citas jurisprudenciales.`,
    suggestedPrompts: [
      '¿Cuál es la línea jurisprudencial de la Sala Constitucional sobre el debido proceso en procedimientos disciplinarios?',
      '¿Qué ha dicho la Contraloría sobre la responsabilidad de los jerarcas en contrataciones irregulares?',
      '¿Existe jurisprudencia sobre la obligación del Estado de contratar con proveedores locales en licitaciones?',
      'Analiza los precedentes sobre nulidad de actos administrativos por falta de motivación.',
    ],
  },
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
  const risk = RISK_CONFIG[uc.risk];
  const prio = PRIORITY_CONFIG[uc.priority];
  const PrioIcon = prio.icon;

  return (
    <div className={`bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col ${expanded ? 'shadow-md' : ''}`}>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-11 h-11 rounded-xl ${uc.bg} flex items-center justify-center flex-shrink-0`}>
            <Icon size={22} className={uc.color} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap justify-between">
              <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Caso {String(index + 1).padStart(2, '0')}</span>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${risk.bg} ${risk.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`} />
                  {risk.label}
                </span>
                <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${prio.bg} ${prio.color}`}>
                  <PrioIcon size={9} /> {prio.label}
                </span>
              </div>
            </div>
            <h3 className="text-base font-bold text-[#0d2240] leading-snug mt-1">{uc.title}</h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed mb-4">{uc.shortDesc}</p>

        {/* Features */}
        <div className="space-y-1.5 mb-4">
          {(expanded ? uc.features : uc.features.slice(0, 3)).map((f) => (
            <div key={f} className="flex items-start gap-2">
              <CheckCircle2 size={13} className={`${uc.color} mt-0.5 flex-shrink-0`} />
              <span className="text-xs text-gray-600">{f}</span>
            </div>
          ))}
          {!expanded && uc.features.length > 3 && (
            <p className="text-[10px] text-gray-400 pl-5">+{uc.features.length - 3} funcionalidades más</p>
          )}
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
            <div className={`border rounded-xl px-4 py-3 ${risk.bg}`}>
              <p className={`text-xs font-bold mb-1 flex items-center gap-1.5 ${risk.color}`}>
                <AlertTriangle size={11} /> {risk.label}
              </p>
              <p className={`text-xs leading-relaxed ${risk.color} opacity-80`}>{uc.riskDetail}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <p className="text-xs font-bold text-gray-600 mb-1 flex items-center gap-1.5">
                <TrendingUp size={11} /> Prioridad recomendada
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">{uc.priorityLabel}</p>
            </div>
          </div>
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
            {expanded ? <><ChevronUp size={13} /> Cerrar</> : <><ChevronDown size={13} /> Ver detalle</>}
          </button>
          <button
            onClick={onOpenChat}
            className="flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold bg-[#0d2240] hover:bg-[#1e3a5f] text-white transition-all"
          >
            <MessageSquare size={13} />
            Usar asistente
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function UseCasesPage() {
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);

  const activeCase = activeCaseId ? USE_CASES.find((u) => u.id === activeCaseId) ?? null : null;

  // ── Chat view ──────────────────────────────────────────────────────────────
  if (activeCase) {
    return (
      <UseCaseChat
        config={activeCase}
        onBack={() => setActiveCaseId(null)}
      />
    );
  }

  // ── Overview ───────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-y-auto bg-[#f1f4f8]">
      {/* Hero */}
      <div className="bg-[#0d2240] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#1e3a5f] rounded-full opacity-40 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#0a1a35] rounded-full opacity-60 blur-2xl" />
        </div>
        <div className="relative max-w-5xl mx-auto px-8 py-14 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 mb-5">
            <Sparkles size={13} className="text-[#60a5fa]" />
            <span className="text-white/80 text-xs font-semibold tracking-wide">MuniIA · Inteligencia Artificial Institucional</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            Casos de uso de IA
            <br />
            <span className="text-[#60a5fa]">para equipos jurídicos y administrativos</span>
          </h1>
          <p className="text-white/65 text-base max-w-2xl mx-auto leading-relaxed mb-8">
            Soluciones concretas de inteligencia artificial diseñadas para apoyar la gestión jurídica institucional.
            Selecciona un asistente y comienza a trabajar con IA especializada.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {[
              { label: '6 asistentes especializados', Icon: Zap, color: 'text-[#60a5fa]' },
              { label: '2 de prioridad muy alta / alta', Icon: TrendingUp, color: 'text-emerald-400' },
              { label: 'Supervisión humana requerida', Icon: CheckCircle2, color: 'text-amber-400' },
            ].map(({ label, Icon, color }) => (
              <div key={label} className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3 py-1.5">
                <Icon size={12} className={color} />
                <span className="text-white/75 text-xs">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-5xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {USE_CASES.map((uc, i) => (
            <UseCaseCard
              key={uc.id}
              uc={uc}
              index={i}
              onOpenChat={() => setActiveCaseId(uc.id)}
            />
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-8 bg-[#0d2240]/5 border border-[#0d2240]/10 rounded-2xl px-6 py-5 flex items-start gap-3">
          <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-[#0d2240] mb-1">Nota importante sobre supervisión humana</p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Todos los asistentes de MuniIA están diseñados como herramientas de apoyo, no como sustitutos del criterio jurídico o profesional.
              Toda respuesta generada debe ser revisada y validada por el funcionario responsable antes de ser utilizada oficialmente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
