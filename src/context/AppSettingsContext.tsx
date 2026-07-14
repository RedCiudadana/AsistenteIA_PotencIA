import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase, type AppSettings } from '../lib/supabase';

const SETTINGS_ID = '00000000-0000-0000-0000-000000000002';

interface AppSettingsContextValue {
  settings: AppSettings | null;
  loading: boolean;
  refresh: () => void;
}

const AppSettingsContext = createContext<AppSettingsContextValue>({
  settings: null,
  loading: true,
  refresh: () => {},
});

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading]   = useState(true);
  const [tick, setTick]         = useState(0);

  useEffect(() => {
    setLoading(true);
    supabase
      .from('app_settings')
      .select('*')
      .eq('id', SETTINGS_ID)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setSettings(data as AppSettings);
        setLoading(false);
      });
  }, [tick]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  return (
    <AppSettingsContext.Provider value={{ settings, loading, refresh }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  return useContext(AppSettingsContext);
}

/**
 * Builds the system prompt sent to the AI from current app settings.
 * All behaviour flags (style, citations, suggestions, emojis) are reflected.
 */
export function buildSystemPrompt(s: AppSettings): string {
  const parts: string[] = [];

  parts.push(`Eres ${s.ai_name}, ${s.ai_role}.`);
  parts.push(
    `Trabajas para ${s.institution_name}${s.institution_dept ? `, ${s.institution_dept}` : ''}.`
  );

  parts.push(
    `ALCANCE GEOGRÁFICO: Todas tus respuestas deben estar focalizadas en ${s.search_country}. ` +
    `Utiliza como marco de referencia las leyes, reglamentos, normativas, plazos, procedimientos ` +
    `e instituciones de ${s.search_country}. Cuando un tema tenga variaciones por país, ` +
    `aplica siempre el contexto de ${s.search_country}. Si el usuario pregunta sobre otro país, ` +
    `puedes responder brevemente pero aclarando que tu especialidad es ${s.search_country}.`
  );

  const styleMap: Record<AppSettings['response_style'], string> = {
    muy_formal: 'Usa un lenguaje muy formal, técnico y protocolar en todas tus respuestas.',
    formal:     'Usa un lenguaje formal y profesional en tus respuestas.',
    semiformal: 'Usa un lenguaje semiformal, claro y accesible.',
  };
  parts.push(styleMap[s.response_style] ?? styleMap.formal);

  if (s.ai_cite_sources) {
    parts.push(
      'CITAS Y REFERENCIAS: Cuando uses información de documentos de referencia, cita siempre la fuente ' +
      'entre corchetes, por ejemplo: [Reglamento Interno, Art. 5] o [Decreto 57-92, Artículo 12]. ' +
      'Para conocimiento general, indica la ley o norma completa de Guatemala.'
    );
  }
  if (s.ai_suggest_next) {
    parts.push('Al finalizar cada respuesta, agrega una sección "## Pasos siguientes" con 2-3 acciones o consultas de seguimiento.');
  }
  if (!s.ai_use_emojis) {
    parts.push('No uses emojis ni íconos en tus respuestas.');
  }

  parts.push(
    'INTEGRIDAD JURÍDICA — REGLAS OBLIGATORIAS:\n' +
    '1. NUNCA inventes números de artículos, leyes, acuerdos gubernativos, decretos, fechas ni nombres de instituciones que no estén en los documentos proporcionados o en tu conocimiento verificado de la legislación guatemalteca.\n' +
    '2. Si la información solicitada NO se encuentra en los documentos disponibles, decláralo ANTES de responder con esta frase exacta: "Esta información no se encuentra en el banco normativo disponible."\n' +
    '3. Cuando respondas con conocimiento general (sin documentos de respaldo), acláralos siempre iniciando con: "Según la legislación general de Guatemala..."\n' +
    '4. No mezcles información de documentos con conocimiento general sin distinguirlos claramente.\n' +
    '5. Al final de cada respuesta sobre materia jurídica, incluye: "⚠ Este análisis es preliminar. Debe ser revisado y validado por el funcionario o asesor jurídico responsable antes de su uso oficial."'
  );

  parts.push(
    'FORMATO DE RESPUESTA: Usa Markdown para estructurar tus respuestas de forma clara y legible. ' +
    'Usa ## para secciones principales, ### para subsecciones, **negrita** para términos clave o información importante, ' +
    '- para listas con viñetas y 1. 2. 3. para pasos numerados. ' +
    'Divide la respuesta en párrafos cortos. ' +
    'Para contenido largo, usa secciones con encabezados. ' +
    'Usa bloques de código (``` ```) solo para código o texto técnico literal.'
  );

  return parts.join('\n\n');
}
