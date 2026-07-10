import { X, Clock, Users, CheckCircle2, Circle, PlayCircle, ChevronRight, Tag } from 'lucide-react';
import type { WorkflowFlow, FlowCategory } from '../../lib/supabase';

interface FlowDetailDrawerProps {
  flow: WorkflowFlow;
  categories: FlowCategory[];
  onClose: () => void;
  onUse: () => void;
  onEdit: () => void;
}

const STATUS_LABEL: Record<WorkflowFlow['status'], string> = {
  active: 'Activo', draft: 'Borrador', archived: 'Archivado',
};
const STATUS_COLOR: Record<WorkflowFlow['status'], string> = {
  active: 'bg-green-50 text-green-700',
  draft: 'bg-amber-50 text-amber-700',
  archived: 'bg-gray-100 text-gray-500',
};

export default function FlowDetailDrawer({ flow, categories, onClose, onUse, onEdit }: FlowDetailDrawerProps) {
  const cat = categories.find((c) => c.id === flow.category_id);
  const requiredCount = flow.steps.filter((s) => s.required).length;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <PlayCircle size={20} className="text-[#2563eb]" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-[#0d2240] leading-snug">{flow.title}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[flow.status]}`}>
                {STATUS_LABEL[flow.status]}
              </span>
              {cat && (
                <span className="text-xs font-semibold text-white px-2 py-0.5 rounded-full"
                  style={{ background: cat.color }}>
                  {cat.name}
                </span>
              )}
              <span className="text-xs text-gray-400">{flow.steps.length} pasos · {requiredCount} obligatorios</span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {flow.description && (
            <p className="text-sm text-gray-600 leading-relaxed mb-6 pb-5 border-b border-gray-100">
              {flow.description}
            </p>
          )}

          {/* Tags */}
          {flow.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {flow.tags.map((t) => (
                <span key={t} className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-1">
                  <Tag size={9} />{t}
                </span>
              ))}
            </div>
          )}

          {/* Steps timeline */}
          <div className="relative">
            {/* Vertical connector line */}
            {flow.steps.length > 1 && (
              <div className="absolute left-[19px] top-8 bottom-8 w-0.5 bg-gray-200" />
            )}

            <div className="space-y-4">
              {flow.steps.map((step, i) => (
                <div key={step.id} className="flex gap-4 relative">
                  {/* Step indicator */}
                  <div className="flex-shrink-0 flex flex-col items-center z-10">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                      i === 0
                        ? 'bg-[#1e3a5f] text-white shadow-md'
                        : 'bg-white border-2 border-gray-200 text-gray-400'
                    }`}>
                      {i + 1}
                    </div>
                  </div>

                  {/* Step content */}
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl p-4 pb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-bold text-[#0d2240] leading-snug">{step.title}</h3>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {step.required ? (
                          <span className="flex items-center gap-0.5 text-[10px] font-semibold text-[#1e3a5f] bg-blue-50 px-1.5 py-0.5 rounded-full">
                            <CheckCircle2 size={9} /> Obligatorio
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5 text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                            <Circle size={9} /> Opcional
                          </span>
                        )}
                      </div>
                    </div>

                    {step.description && (
                      <p className="text-xs text-gray-500 leading-relaxed mb-3">{step.description}</p>
                    )}

                    <div className="flex flex-wrap gap-3">
                      {step.responsible && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Users size={11} className="text-gray-400" />
                          {step.responsible}
                        </span>
                      )}
                      {step.duration && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock size={11} className="text-gray-400" />
                          {step.duration}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Connector end */}
          {flow.steps.length > 0 && (
            <div className="flex items-center gap-3 mt-4 pl-1">
              <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center flex-shrink-0 ml-1">
                <CheckCircle2 size={16} className="text-green-600" />
              </div>
              <p className="text-sm font-semibold text-green-700">Fin del flujo</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onEdit}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Editar flujo
          </button>
          <button onClick={() => { onUse(); onClose(); }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1e3a5f] hover:bg-[#0d2240] text-white text-sm font-semibold transition-all hover:shadow-md">
            <PlayCircle size={16} />
            Iniciar con IA
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </>
  );
}
