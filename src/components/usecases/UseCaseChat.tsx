import { useState, useRef, useEffect } from 'react';
import { Send, Bot, AlertCircle, ArrowLeft, RotateCcw, FileSearch, BookOpen, Search, FileOutput, FileText } from 'lucide-react';
import ChatMessage, { type Message, type DocSource } from '../ChatMessage';
import DocumentsPanel from '../DocumentsPanel';
import HumanReviewNotice from '../HumanReviewNotice';
import UploadDocumentModal from '../UploadDocumentModal';
import { supabase } from '../../lib/supabase';
import { fetchDocumentContext } from '../../lib/rag';
import { useAppSettings, buildSystemPrompt } from '../../context/AppSettingsContext';

const PROMPT_ICONS = [FileSearch, BookOpen, Search, FileOutput, Bot, FileText] as const;

export interface UseCaseConfig {
  id: string;
  title: string;
  shortDesc: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bg: string;
  accentHex: string;
  specializedPrompt: string;
  suggestedPrompts: string[];
}

interface Props {
  config: UseCaseConfig;
  onBack: () => void;
}

export default function UseCaseChat({ config, onBack }: Props) {
  const { settings } = useAppSettings();
  const activeModelId = settings?.active_model_id ?? '';

  const [messages, setMessages]     = useState<Message[]>([]);
  const [input, setInput]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [apiError, setApiError]     = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const bottomRef      = useRef<HTMLDivElement>(null);
  const textareaRef    = useRef<HTMLTextAreaElement>(null);
  const initializedRef = useRef(false);

  const Icon    = config.icon;
  const aiName  = settings?.ai_name ?? 'Asistente IA';
  const aiRole  = settings?.ai_role ?? 'Te ayuda a redactar, resumir y buscar información para tu trabajo diario.';

  useEffect(() => {
    if (settings && !initializedRef.current) {
      initializedRef.current = true;
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `¡Hola! Soy ${aiName}. Estoy listo para ayudarte con **${config.title}**.\n\n${config.shortDesc}\n\n¿Cómo puedo apoyarte hoy? Puedes escribir tu consulta o elegir una sugerencia para comenzar.`,
      }]);
    }
  }, [settings, config, aiName]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  function buildSpecializedSystemPrompt(): string {
    const base = settings
      ? buildSystemPrompt(settings)
      : 'Eres un asistente institucional del sector público. Responde en español formal.';

    return `${base}

CONTEXTO ESPECIALIZADO — ${config.title.toUpperCase()}:
${config.specializedPrompt}

INSTRUCCIONES ADICIONALES:
- Responde siempre en español formal.
- Incluye referencias normativas específicas cuando sea relevante (artículos, leyes, reglamentos).
- Estructura tus respuestas con claridad: usa secciones, listas o numeración cuando ayude a la legibilidad.
- Al final de cada respuesta importante, incluye un recordatorio breve de que el contenido debe ser revisado y validado por el funcionario responsable antes de uso oficial.
- No apruebes ni emitas criterio definitivo en materia jurídica; tu rol es de apoyo técnico.`;
  }

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setShowSuggestions(false);
    setLoading(true);
    setApiError('');

    let systemPrompt = buildSpecializedSystemPrompt();

    // RAG: fetch relevant documents and inject as context
    let matchedSources: DocSource[] = [];
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
          'NO uses tu conocimiento general cuando hay documentos relevantes.';
      } else {
        systemPrompt +=
          '\n\nINSTRUCCIÓN ESPECIAL: Se encontró un documento relacionado con la consulta ' +
          '(ver sección "Documentos registrados" abajo), pero aún no tiene texto indexado. ' +
          'Indica que encontraste el documento por su nombre exacto, ' +
          'explica que el texto completo aún no está disponible y ' +
          'pide al usuario que edite el documento en la sección "Documentos" para pegar el texto.';
      }
      systemPrompt += `\n\nDOCUMENTOS DEL BANCO NORMATIVO:\n\n${context}`;
    } else if (!noDocsFound) {
      systemPrompt +=
        '\n\nNOTA: Se buscó en el banco normativo pero no se encontraron documentos relacionados con esta consulta. ' +
        'Indica al usuario que no hay documentos disponibles sobre este tema. ' +
        'Puedes responder con tu conocimiento general de la legislación guatemalteca, ' +
        'aclarando que la información no proviene de documentos indexados y debe verificarse en las fuentes oficiales.';
    }

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

      supabase.from('activity_events').insert({
        event_type: 'ai_query',
        label: text.slice(0, 80),
        metadata: { use_case: config.id, model_id: activeModelId, docs_injected: matchedSources.length },
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
      sendMessage(input);
    }
  }

  function handleReset() {
    setMessages([]);
    setInput('');
    setApiError('');
    setShowSuggestions(true);
    initializedRef.current = false;
    if (settings) {
      initializedRef.current = true;
      setMessages([{
        id: Date.now().toString(),
        role: 'assistant',
        content: `Conversación reiniciada. Soy ${aiName}, listo para ayudarte con **${config.title}**. ¿En qué puedo apoyarte?`,
      }]);
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Top breadcrumb bar */}
      <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0d2240] font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          Casos de uso
        </button>
        <span className="text-gray-300">/</span>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={`w-7 h-7 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
            <Icon size={15} className={config.color} />
          </div>
          <span className="text-sm font-bold text-[#0d2240] truncate">{config.title}</span>
        </div>
        <button
          onClick={handleReset}
          title="Reiniciar conversación"
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex gap-5 p-5 overflow-hidden min-h-0">
        {/* Chat panel */}
        <section className="flex-1 bg-[#f8fafc] rounded-2xl border border-gray-200 shadow-sm flex flex-col min-h-0 overflow-hidden">
          {/* Assistant header */}
          <div className="px-6 pt-6 pb-4 flex-shrink-0">
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
                  <p className="text-xs font-semibold text-amber-800">Aviso</p>
                  <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">{apiError}</p>
                </div>
                <button onClick={() => setApiError('')} className="text-amber-400 hover:text-amber-600 text-xs">✕</button>
              </div>
            )}
          </div>

          {/* Messages */}
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
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-[#1e3a5f] flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5 items-center h-4">
                    <span className="w-2 h-2 bg-[#1e3a5f] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-[#1e3a5f] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-[#1e3a5f] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="px-6 py-4 border-t border-gray-100 space-y-3 flex-shrink-0">
            {/* Suggested prompts as quick actions */}
            {showSuggestions && messages.length <= 1 && (
              <div className="grid grid-cols-2 gap-2">
                {config.suggestedPrompts.map((prompt, idx) => {
                  const PromptIcon = PROMPT_ICONS[idx % PROMPT_ICONS.length];
                  return (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="flex items-center gap-2.5 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 font-medium hover:border-[#1e3a5f] hover:text-[#1e3a5f] hover:bg-blue-50/40 transition-all duration-150 text-left group shadow-sm"
                    >
                      <PromptIcon size={16} className="text-gray-400 group-hover:text-[#2563eb] flex-shrink-0 transition-colors" />
                      <span className="truncate">{prompt}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-[#1e3a5f]/20 focus-within:border-[#1e3a5f] transition-all">
              <textarea
                ref={textareaRef}
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
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#0d2240] disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-150 disabled:cursor-not-allowed"
                >
                  <Send size={15} />
                  Generar respuesta
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Right sidebar */}
        <aside className="w-80 flex-shrink-0 flex flex-col gap-4 overflow-y-auto">
          <DocumentsPanel onUpload={() => setUploadOpen(true)} />
          <HumanReviewNotice />
        </aside>
      </div>

      {uploadOpen && <UploadDocumentModal onClose={() => setUploadOpen(false)} />}
    </div>
  );
}
