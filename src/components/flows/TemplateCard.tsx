import {
  FileText, Copy, Edit2, Trash2, Bot,
  Tag, MoreHorizontal, Sparkles, Eye,
} from 'lucide-react';
import { useState } from 'react';
import type { DocumentTemplate, FlowCategory } from '../../lib/supabase';

interface TemplateCardProps {
  tpl: DocumentTemplate;
  categories: FlowCategory[];
  onEdit: (t: DocumentTemplate) => void;
  onDelete: (t: DocumentTemplate) => void;
  onDuplicate: (t: DocumentTemplate) => void;
  onUse: (t: DocumentTemplate) => void;
}

function contentSnippet(content: string): string {
  return content
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join(' · ')
    .substring(0, 120);
}

export default function TemplateCard({
  tpl, categories, onEdit, onDelete, onDuplicate, onUse,
}: TemplateCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const cat = categories.find((c) => c.id === tpl.category_id);
  const snippet = tpl.content ? contentSnippet(tpl.content) : '';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl flex flex-col hover:shadow-md transition-all duration-150 hover:-translate-y-0.5 group overflow-hidden">
      {/* Category color accent */}
      {cat && <div className="h-1 w-full flex-shrink-0" style={{ background: cat.color }} />}

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText size={17} className="text-violet-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="text-sm font-bold text-[#0d2240] leading-snug line-clamp-1">{tpl.title}</h3>
              {tpl.is_system && (
                <Sparkles size={11} className="text-amber-400 flex-shrink-0" title="Formato del sistema" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400">
                {tpl.placeholders.length > 0
                  ? `${tpl.placeholders.length} variable${tpl.placeholders.length !== 1 ? 's' : ''}`
                  : 'Sin variables'}
              </span>
              {tpl.usage_count > 0 && (
                <>
                  <span className="text-gray-200">·</span>
                  <span className="text-[10px] text-gray-400">{tpl.usage_count} uso{tpl.usage_count !== 1 ? 's' : ''}</span>
                </>
              )}
            </div>
          </div>

          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <MoreHorizontal size={15} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-40">
                  <button onClick={() => { onEdit(tpl); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
                    <Edit2 size={12} /> Editar
                  </button>
                  <button onClick={() => { onDuplicate(tpl); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
                    <Copy size={12} /> Duplicar
                  </button>
                  {!tpl.is_system && (
                    <>
                      <div className="border-t border-gray-100 my-1" />
                      <button onClick={() => { onDelete(tpl); setMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50">
                        <Trash2 size={12} /> Eliminar
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        {tpl.description && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{tpl.description}</p>
        )}

        {/* Content preview */}
        {snippet && (
          <div className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 flex items-start gap-2">
            <Eye size={11} className="text-gray-300 mt-0.5 flex-shrink-0" />
            <p className="text-[10px] font-mono text-gray-400 leading-relaxed line-clamp-2">{snippet}</p>
          </div>
        )}

        {/* Placeholders */}
        {tpl.placeholders.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tpl.placeholders.slice(0, 3).map((p) => (
              <span key={p.key} className="text-[10px] bg-violet-50 text-violet-600 border border-violet-100 rounded-md px-1.5 py-0.5 font-mono">
                {`{{${p.key}}}`}
              </span>
            ))}
            {tpl.placeholders.length > 3 && (
              <span className="text-[10px] text-gray-400 self-center">+{tpl.placeholders.length - 3} más</span>
            )}
          </div>
        )}

        {/* Tags + category */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {cat && (
            <span className="text-[10px] font-semibold text-white px-2 py-0.5 rounded-full"
              style={{ background: cat.color }}>
              {cat.name}
            </span>
          )}
          {tpl.tags.slice(0, 2).map((t) => (
            <span key={t} className="text-[10px] bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
              <Tag size={8} />{t}
            </span>
          ))}
        </div>
      </div>

      {/* CTA footer */}
      <div className="px-4 pb-4 flex-shrink-0">
        <button
          onClick={() => onUse(tpl)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#f0f5ff] hover:bg-[#1e3a5f] text-[#1e3a5f] hover:text-white text-xs font-bold transition-all duration-150 border border-[#dbeafe] hover:border-[#1e3a5f]"
        >
          <Bot size={14} />
          Usar con IA
        </button>
      </div>
    </div>
  );
}
