import {
  GitBranch, Edit2, Trash2, PlayCircle,
  Clock, ChevronRight, MoreHorizontal, Archive, Users,
} from 'lucide-react';
import { useState } from 'react';
import type { WorkflowFlow, FlowCategory } from '../../lib/supabase';

const STATUS_CONFIG = {
  active:   { label: 'Activo',    bg: 'bg-green-50',  text: 'text-green-700', dot: 'bg-green-500'  },
  draft:    { label: 'Borrador',  bg: 'bg-amber-50',  text: 'text-amber-700', dot: 'bg-amber-400'  },
  archived: { label: 'Archivado', bg: 'bg-gray-100',  text: 'text-gray-500',  dot: 'bg-gray-400'   },
};

interface FlowCardProps {
  flow: WorkflowFlow;
  categories: FlowCategory[];
  onEdit: (f: WorkflowFlow) => void;
  onDelete: (f: WorkflowFlow) => void;
  onArchive: (f: WorkflowFlow) => void;
  onView: (f: WorkflowFlow) => void;
  onUse: (f: WorkflowFlow) => void;
}

export default function FlowCard({
  flow, categories, onEdit, onDelete, onArchive, onView, onUse,
}: FlowCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const cat = categories.find((c) => c.id === flow.category_id);
  const sc  = STATUS_CONFIG[flow.status];

  // Find the first step with a responsible person for a quick preview
  const firstResponsible = flow.steps.find((s) => s.responsible)?.responsible;
  const totalDuration    = flow.steps.find((s) => s.duration)?.duration;

  return (
    <div className={`bg-white border border-gray-200 rounded-2xl flex flex-col hover:shadow-md transition-all duration-150 hover:-translate-y-0.5 group overflow-hidden ${flow.status === 'archived' ? 'opacity-60' : ''}`}>
      {/* Category accent + status bar */}
      <div className="h-1 w-full flex-shrink-0 flex">
        {cat
          ? <div className="flex-1" style={{ background: cat.color }} />
          : <div className="flex-1 bg-[#2563eb]" />
        }
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <GitBranch size={17} className="text-[#2563eb]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-[#0d2240] leading-snug line-clamp-1 mb-0.5">{flow.title}</h3>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                {sc.label}
              </span>
              <span className="text-[10px] text-gray-400">
                {flow.steps.length} paso{flow.steps.length !== 1 ? 's' : ''}
              </span>
              {firstResponsible && (
                <>
                  <span className="text-gray-200">·</span>
                  <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                    <Users size={9} /> {firstResponsible}
                  </span>
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
                  <button onClick={() => { onView(flow); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
                    <ChevronRight size={12} /> Ver detalle
                  </button>
                  <button onClick={() => { onEdit(flow); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
                    <Edit2 size={12} /> Editar
                  </button>
                  <button onClick={() => { onArchive(flow); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
                    <Archive size={12} />
                    {flow.status === 'archived' ? 'Activar' : 'Archivar'}
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <button onClick={() => { onDelete(flow); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50">
                    <Trash2 size={12} /> Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        {flow.description && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{flow.description}</p>
        )}

        {/* Steps mini-timeline */}
        {flow.steps.length > 0 && (
          <div className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-1 overflow-hidden">
              {flow.steps.slice(0, 4).map((step, i) => (
                <div key={step.id} className="flex items-center gap-1 min-w-0">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${
                    i === 0 ? 'bg-[#1e3a5f] text-white' : 'bg-white border border-gray-200 text-gray-400'
                  }`}>
                    {i + 1}
                  </div>
                  <span className="text-[10px] text-gray-500 truncate max-w-[48px] hidden sm:block">{step.title}</span>
                  {i < Math.min(flow.steps.length - 1, 3) && (
                    <ChevronRight size={9} className="text-gray-300 flex-shrink-0" />
                  )}
                </div>
              ))}
              {flow.steps.length > 4 && (
                <span className="text-[10px] text-gray-400 pl-1 flex-shrink-0">+{flow.steps.length - 4}</span>
              )}
            </div>
          </div>
        )}

        {/* Meta: category + duration + uses */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {cat && (
            <span className="text-[10px] font-semibold text-white px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: cat.color }}>
              {cat.name}
            </span>
          )}
          {totalDuration && (
            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
              <Clock size={9} /> {totalDuration}
            </span>
          )}
          {flow.usage_count > 0 && (
            <span className="text-[10px] text-gray-400">{flow.usage_count} uso{flow.usage_count !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      {/* CTA footer */}
      <div className="px-4 pb-4 flex gap-2 flex-shrink-0">
        <button
          onClick={() => onView(flow)}
          className="flex-shrink-0 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-600 transition-colors"
        >
          Ver pasos
        </button>
        <button
          onClick={() => onUse(flow)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#1e3a5f] hover:bg-[#0d2240] text-white text-xs font-bold transition-all hover:shadow-md"
        >
          <PlayCircle size={13} />
          Iniciar con IA
        </button>
      </div>
    </div>
  );
}
