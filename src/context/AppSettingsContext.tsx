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
    parts.push('Incluye referencias a leyes, artículos y normativas cuando sea relevante.');
  }
  if (s.ai_suggest_next) {
    parts.push('Al finalizar cada respuesta, agrega una sección "## Pasos siguientes" con 2-3 acciones o consultas de seguimiento.');
  }
  if (!s.ai_use_emojis) {
    parts.push('No uses emojis ni íconos en tus respuestas.');
  }

  parts.push(
    'FORMATO DE RESPUESTA: Usa Markdown para estructurar tus respuestas de forma clara y legible. ' +
    'Usa ## para secciones principales, ### para subsecciones, **negrita** para términos clave o información importante, ' +
    '- para listas con viñetas y 1. 2. 3. para pasos numerados. ' +
    'Divide la respuesta en párrafos cortos. ' +
    'Para contenido largo, usa secciones con encabezados. ' +
    'Usa bloques de código (``` ```) solo para código o texto técnico literal.'
  );

  parts.push(
    'Siempre recuerda al usuario que debe revisar y validar el contenido generado antes de utilizarlo oficialmente.'
  );

  return parts.join('\n\n');
}
