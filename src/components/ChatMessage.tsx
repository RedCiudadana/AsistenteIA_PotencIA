import { useState } from 'react';
import { Bot, User, FileText, File, ChevronDown, ChevronUp, BookOpen, Copy, Check } from 'lucide-react';
import { MarkdownContent } from '../lib/markdown';

export type MessageRole = 'user' | 'assistant';

export interface DocSource {
  name: string;
  ext: string;
  excerpt: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  sources?: DocSource[];
}

const EXT_STYLES: Record<string, { bg: string; text: string; Icon: typeof FileText }> = {
  pdf:  { bg: 'bg-red-50',    text: 'text-red-600',    Icon: FileText },
  docx: { bg: 'bg-blue-50',   text: 'text-blue-600',   Icon: File     },
  xlsx: { bg: 'bg-green-50',  text: 'text-green-600',  Icon: File     },
  txt:  { bg: 'bg-amber-50',  text: 'text-amber-600',  Icon: FileText },
};

function SourceCard({ source }: { source: DocSource }) {
  const [expanded, setExpanded] = useState(false);
  const style = EXT_STYLES[source.ext] ?? { bg: 'bg-gray-50', text: 'text-gray-600', Icon: File };
  const { bg, text, Icon } = style;

  const SHORT_LIMIT = 160;
  const isLong = source.excerpt.length > SHORT_LIMIT;
  const displayed = expanded || !isLong
    ? source.excerpt
    : source.excerpt.slice(0, SHORT_LIMIT) + '…';

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => isLong && setExpanded((v) => !v)}
        className={`w-full flex items-center gap-2.5 px-3 py-2 text-left ${isLong ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'} transition-colors`}
      >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
          <Icon size={14} className={text} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold text-gray-800 truncate block">
            {source.name}<span className="font-normal text-gray-400">.{source.ext}</span>
          </span>
        </div>
        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded flex-shrink-0 ${bg} ${text}`}>
          {source.ext}
        </span>
        {isLong && (
          expanded
            ? <ChevronUp size={14} className="text-gray-400 flex-shrink-0" />
            : <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
        )}
      </button>

      <div className="px-3 pb-2.5 border-t border-gray-100">
        <p className="text-xs text-gray-500 leading-relaxed mt-2 font-mono whitespace-pre-line">
          {displayed}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-[11px] text-[#2563eb] font-semibold mt-1.5 hover:underline"
          >
            {expanded ? 'Ver menos' : 'Ver fragmento completo'}
          </button>
        )}
      </div>
    </div>
  );
}

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';
  const hasSources  = isAssistant && message.sources && message.sources.length > 0;
  const [showSources, setShowSources] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={`flex gap-3 ${isAssistant ? 'items-start' : 'items-start flex-row-reverse'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
        isAssistant ? 'bg-[#1e3a5f]' : 'bg-[#2563eb]'
      }`}>
        {isAssistant ? <Bot size={16} className="text-white" /> : <User size={16} className="text-white" />}
      </div>

      {/* Bubble + sources */}
      <div className={`max-w-[80%] ${isAssistant ? 'flex-1 min-w-0' : 'items-end flex flex-col'}`}>
        <div className={`relative group rounded-2xl px-4 py-3.5 text-sm ${
          isAssistant
            ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
            : 'bg-[#1e3a5f] text-white rounded-tr-sm leading-relaxed'
        }`}>
          {isAssistant
            ? <MarkdownContent content={message.content} />
            : message.content
          }

          {/* Copy button — visible on hover for assistant, always for mobile */}
          {isAssistant && (
            <button
              onClick={handleCopy}
              title={copied ? 'Copiado' : 'Copiar respuesta'}
              className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150
                ${copied
                  ? 'bg-emerald-50 text-emerald-600 opacity-100'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 opacity-0 group-hover:opacity-100'
                }`}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>
          )}
        </div>

        {/* Sources toggle */}
        {hasSources && (
          <div className="mt-2 w-full">
            <button
              onClick={() => setShowSources((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#2563eb] hover:text-[#1e3a5f] transition-colors px-1 group"
            >
              <BookOpen size={13} />
              {message.sources!.length} documento{message.sources!.length !== 1 ? 's' : ''} utilizado{message.sources!.length !== 1 ? 's' : ''} como contexto
              {showSources
                ? <ChevronUp size={13} className="transition-transform" />
                : <ChevronDown size={13} className="transition-transform" />
              }
            </button>

            {showSources && (
              <div className="mt-2 space-y-2">
                {message.sources!.map((src, i) => (
                  <SourceCard key={i} source={src} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
