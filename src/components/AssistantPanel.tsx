import { useState, useRef, useEffect } from 'react';
import { Send, Bot, AlertCircle, FileSearch, Sparkles, Clock, FileText } from 'lucide-react';
import ChatMessage, { type Message, type DocSource } from './ChatMessage';
import QuickActions from './QuickActions';
import { supabase } from '../lib/supabase';
import { fetchDocumentContext } from '../lib/rag';
import { useAppSettings, buildSystemPrompt } from '../context/AppSettingsContext';
import type { Privacy } from './PrivacySelector';

const PRIVACY_INSTRUCTIONS: Record<Privacy, string> = {
  publica:
    'Esta consulta es de carácter PÚBLICO. Puedes incluir información de acceso general y citar fuentes públicas.',
  interna:
    'Esta consulta es de uso INTERNO institucional. Trata la información con discreción y solo comparte contenido apropiado para personal interno.',
  confidencial:
    'Esta consulta es CONFIDENCIAL. Maneja la información con el máximo nivel de protección. No incluyas datos personales ni información sensible en la respuesta. Advierte al usuario si detectas que la consulta podría involucrar datos protegidos.',
};

type LoadingPhase = 'docs' | 'thinking' | 'slow';

function ThinkingBubble({ phase, modelLabel }: { phase: LoadingPhase; modelLabel: string }) {
  const phaseConfig = {
    docs: {
      Icon: FileSearch,
      label: 'Buscando en documentos...',
      sub: 'Recuperando contexto relevante',
      iconColor: 'text-[#2563eb]',
      iconBg: 'bg-[#eff6ff]',
    },
    thinking: {
      Icon: Sparkles,
      label: 'Generando respuesta...',
      sub: modelLabel || 'Procesando con IA',
      iconColor: 'text-[#1e3a5f]',
      iconBg: 'bg-[#f0f5ff]',
    },
    slow: {
      Icon: Clock,
      label: 'Generando respuesta...',
      sub: 'Esto está tomando un poco más de lo habitual',
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
    },
  };

  const { Icon, label, sub, iconColor, iconBg } = phaseConfig[phase];

  return (
    <div className="flex gap-3 items-start">
      {/* Bot avatar with pulse ring */}
      <div className="relative flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-[#1e3a5f] flex items-center justify-center">
          <Bot size={16} className="text-white" />
        </div>
        <span className="absolute inset-0 rounded-full bg-[#1e3a5f]/20 animate-ping" />
      </div>

      {/* Bubble */}
      <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm shadow-sm px-4 py-3 min-w-[200px]">
        {/* Phase icon + label */}
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
            <Icon size={13} className={iconColor} />
          </div>
          <span className="text-xs font-semibold text-gray-700">{label}</span>
        </div>

        {/* Animated dots */}
        <div className="flex gap-1.5 items-center mb-2 pl-0.5">
          {[0, 1, 2, 3].map((n) => (
            <span
              key={n}
              className="w-1.5 h-1.5 bg-[#1e3a5f] rounded-full animate-bounce"
              style={{ animationDelay: `${n * 120}ms`, animationDuration: '900ms' }}
            />
          ))}
        </div>

        {/* Sub-label */}
        <p className="text-[11px] text-gray-400 leading-snug pl-0.5">{sub}</p>
      </div>
    </div>
  );
}

interface Props {
  activeModelId: string;
  privacyLevel: Privacy;
  useDocs: boolean;
}

export default function AssistantPanel({ activeModelId, privacyLevel, useDocs }: Props) {
  const { settings } = useAppSettings();

  const [messages, setMessages]         = useState<Message[]>([]);
  const [input, setInput]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>('thinking');
  const [modelLabel, setModelLabel]     = useState('');
  const [apiError, setApiError]         = useState('');
  const [docsWithoutContent, setDocsWithoutContent] = useState(0);

  const bottomRef      = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const slowTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Set greeting once when settings first load
  useEffect(() => {
    if (settings && !initializedRef.current) {
      initializedRef.current = true;
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `¡Hola! Soy ${settings.ai_name}. ${settings.ai_role} ¿En qué puedo apoyarte hoy?`,
      }]);
    }
  }, [settings]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, loadingPhase]);

  useEffect(() => {
    supabase
      .from('ai_models')
      .select('display_name, ai_providers(name)')
      .eq('id', activeModelId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const provider = (data.ai_providers as { name: string } | null)?.name ?? '';
          setModelLabel(`${data.display_name}${provider ? ` · ${provider}` : ''}`);
        }
      });
  }, [activeModelId]);

  // Check how many active documents have no indexed content
  useEffect(() => {
    if (!useDocs) return;
    supabase
      .from('documents')
      .select('id, content')
      .eq('status', 'active')
      .then(({ data }) => {
        if (data) {
          const count = data.filter((d) => !d.content).length;
          setDocsWithoutContent(count);
        }
      });
  }, [useDocs]);

  useEffect(() => {
    if (!loading && slowTimerRef.current) {
      clearTimeout(slowTimerRef.current);
      slowTimerRef.current = null;
    }
  }, [loading]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setApiError('');

    // Build system prompt
    let systemPrompt = settings
      ? buildSystemPrompt(settings)
      : 'Eres un asistente institucional del sector público. Responde en español formal.';
    systemPrompt += `\n\n${PRIVACY_INSTRUCTIONS[privacyLevel]}`;

    // RAG phase
    let matchedSources: DocSource[] = [];
    if (useDocs) {
      setLoadingPhase('docs');
      const { context, sources, hasIndexedContent, noDocsFound } = await fetchDocumentContext(text);
      matchedSources = sources;
      if (context) {
        if (hasIndexedContent) {
          systemPrompt +=
            '\n\nINSTRUCCIÓN RAG: A continuación se incluyen los documentos normativos relevantes recuperados del banco normativo. ' +
            'DEBES responder ÚNICAMENTE con base en estos documentos. ' +
            'Cita siempre el nombre del documento cuando uses su contenido, por ejemplo: [Nombre del documento, Art. X]. ' +
            'Si la respuesta exacta no se encuentra en estos documentos, indícalo expresamente: ' +
            '"Esta información no se encuentra en el banco normativo disponible." ' +
            'NO uses tu conocimiento general cuando hay documentos relevantes. Confía exclusivamente en el texto proporcionado.';
        } else {
          systemPrompt +=
            '\n\nINSTRUCCIÓN ESPECIAL: Se encontró un documento relacionado con la consulta ' +
            '(ver sección "Documentos registrados" abajo), pero aún no tiene texto indexado. ' +
            'Indica que encontraste el documento por su nombre exacto, ' +
            'explica que el texto completo aún no está disponible porque el archivo fue registrado sin contenido, ' +
            'y pide al usuario que edite el documento en la sección "Documentos" para pegar el texto. ' +
            'NO respondas con conocimiento general sobre el tema.';
        }
        systemPrompt += `\n\nDOCUMENTOS DEL BANCO NORMATIVO:\n\n${context}`;
      } else if (noDocsFound) {
        systemPrompt +=
          '\n\nNOTA: El banco normativo está vacío. No hay documentos indexados. ' +
          'Si el usuario pregunta sobre normativa específica, indícalo y responde con tu conocimiento general de la legislación guatemalteca, ' +
          'aclarando siempre que la información proviene de conocimiento general y debe verificarse en las fuentes oficiales.';
      } else {
        systemPrompt +=
          '\n\nNOTA: Se buscó en el banco normativo pero no se encontraron documentos relacionados con esta consulta. ' +
          'Indica al usuario que no hay documentos disponibles sobre este tema en el banco normativo. ' +
          'Puedes responder con tu conocimiento general de la legislación guatemalteca, ' +
          'aclarando siempre que la información no proviene de los documentos indexados y debe verificarse en las fuentes oficiales.';
      }
    }

    // AI generation phase
    setLoadingPhase('thinking');
    slowTimerRef.current = setTimeout(() => setLoadingPhase('slow'), 10_000);

    try {
      const history = [...messages.slice(-9), userMsg]
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          messages: [{ role: 'system', content: systemPrompt }, ...history],
          model_record_id: activeModelId,
        },
      });

      if (error || data?.error) throw new Error(data?.error ?? error?.message ?? 'Error desconocido.');

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.content,
          sources: matchedSources.length > 0 ? matchedSources : undefined,
        },
      ]);

      // Log activity event (fire-and-forget)
      supabase.from('activity_events').insert({
        event_type: 'ai_query',
        label: text.slice(0, 80),
        metadata: {
          privacy_level: privacyLevel,
          model_id: activeModelId,
          use_docs: useDocs,
          docs_injected: matchedSources.length,
        },
      });
    } catch (err) {
      setApiError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const aiName = settings?.ai_name ?? 'Asistente IA';
  const aiRole = settings?.ai_role ?? 'Te ayuda a redactar, resumir y buscar información para tu trabajo diario.';

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-start gap-4">
          <div className="w-11 h-11 bg-[#1e3a5f] rounded-xl flex items-center justify-center flex-shrink-0">
            <Bot size={22} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-[#0d2240]">{aiName}</h1>
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{aiRole}</p>
          </div>
        </div>

        {apiError && (
          <div className="mt-3 flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
            <AlertCircle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-amber-800">Respuesta simulada</p>
              <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">{apiError}</p>
            </div>
            <button onClick={() => setApiError('')} className="text-amber-400 hover:text-amber-600 text-xs">✕</button>
          </div>
        )}

        {useDocs && docsWithoutContent > 0 && (
          <div className="mt-3 flex items-start gap-2.5 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5">
            <FileText size={15} className="text-orange-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-orange-700 leading-relaxed">
              <strong>{docsWithoutContent} documento{docsWithoutContent !== 1 ? 's' : ''}</strong> sin texto indexado.
              Ve a <strong>Documentos</strong>, edítalos y pega el contenido para que la IA pueda usarlos.
            </p>
          </div>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-2 min-h-0">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#f0f5ff] border border-[#dbeafe] rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Bot size={22} className="text-[#2563eb]" />
              </div>
              <p className="text-sm font-semibold text-gray-500">Cargando asistente...</p>
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {loading && (
          <ThinkingBubble phase={loadingPhase} modelLabel={modelLabel} />
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="px-6 py-4 border-t border-gray-100 space-y-3">
        <QuickActions onSelect={(prompt) => setInput(prompt)} />

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-[#1e3a5f]/20 focus-within:border-[#1e3a5f] transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu solicitud aquí..."
            rows={2}
            className="w-full px-4 pt-3 pb-1 text-sm text-gray-800 resize-none focus:outline-none placeholder:text-gray-400 bg-transparent"
          />
          <div className="flex items-center justify-between px-4 pb-3 pt-1">
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <span>⚠</span>
              No compartas datos personales sensibles.
            </p>
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#0d2240] disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-150 disabled:cursor-not-allowed"
            >
              <Send size={15} />
              {loading ? 'Generando...' : 'Generar respuesta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
