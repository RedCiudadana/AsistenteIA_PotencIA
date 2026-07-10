import { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, GripVertical, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import type { WorkflowFlow, FlowCategory, FlowStep } from '../../lib/supabase';

function newStep(order: number): FlowStep {
  return { id: crypto.randomUUID(), order, title: '', description: '', responsible: '', duration: '', required: true };
}

interface FlowModalProps {
  initial?: WorkflowFlow | null;
  categories: FlowCategory[];
  onSave: (data: Partial<WorkflowFlow>) => Promise<void>;
  onClose: () => void;
}

export default function FlowModal({ initial, categories, onSave, onClose }: FlowModalProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? '');
  const [status, setStatus] = useState<WorkflowFlow['status']>(initial?.status ?? 'active');
  const [steps, setSteps] = useState<FlowStep[]>(
    initial?.steps.length ? initial.steps : [newStep(1)],
  );
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set([steps[0]?.id]));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const tagRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title);
      setDescription(initial.description ?? '');
      setCategoryId(initial.category_id ?? '');
      setStatus(initial.status);
      setSteps(initial.steps.length ? initial.steps : [newStep(1)]);
      setTags(initial.tags);
    }
  }, [initial]);

  function addStep() {
    const s = newStep(steps.length + 1);
    setSteps((prev) => [...prev, s]);
    setExpanded((prev) => new Set([...prev, s.id]));
  }

  function removeStep(id: string) {
    setSteps((prev) => prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i + 1 })));
  }

  function updateStep(id: string, field: keyof FlowStep, value: string | boolean) {
    setSteps((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
  }

  function moveStep(index: number, dir: -1 | 1) {
    const newSteps = [...steps];
    const swapIdx = index + dir;
    if (swapIdx < 0 || swapIdx >= newSteps.length) return;
    [newSteps[index], newSteps[swapIdx]] = [newSteps[swapIdx], newSteps[index]];
    setSteps(newSteps.map((s, i) => ({ ...s, order: i + 1 })));
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput('');
    tagRef.current?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError('El título es obligatorio.'); return; }
    if (steps.some((s) => !s.title.trim())) { setError('Todos los pasos deben tener un título.'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave({ title: title.trim(), description: description.trim() || null, category_id: categoryId || null, status, steps, tags });
      onClose();
    } catch {
      setError('No se pudo guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  const visibleCats = categories.filter((c) => c.applies_to === 'flows' || c.applies_to === 'both');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-bold text-[#0d2240]">
            {initial ? 'Editar flujo' : 'Nuevo flujo de trabajo'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Meta fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Título del flujo *</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Proceso de aprobación de documento"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Categoría</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all">
                  <option value="">Sin categoría</option>
                  {visibleCats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Estado</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as WorkflowFlow['status'])}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all">
                  <option value="active">Activo</option>
                  <option value="draft">Borrador</option>
                  <option value="archived">Archivado</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Descripción</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="¿Qué proceso describe este flujo?"
                  rows={2}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] resize-none transition-all" />
              </div>
            </div>

            {/* Steps builder */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-700">Pasos del flujo ({steps.length})</label>
                <button type="button" onClick={addStep}
                  className="flex items-center gap-1 text-xs text-[#2563eb] hover:text-[#1e3a5f] font-semibold transition-colors">
                  <Plus size={13} /> Agregar paso
                </button>
              </div>

              <div className="space-y-2">
                {steps.map((step, i) => (
                  <div key={step.id} className="border border-gray-200 rounded-xl overflow-hidden">
                    {/* Step header */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/80 cursor-pointer"
                      onClick={() => toggleExpand(step.id)}>
                      <GripVertical size={14} className="text-gray-300 flex-shrink-0" />
                      <span className="w-5 h-5 bg-[#0d2240] text-white rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="flex-1 text-xs font-semibold text-gray-700 truncate">
                        {step.title || <span className="text-gray-400 font-normal">Paso sin título...</span>}
                      </span>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={(e) => { e.stopPropagation(); moveStep(i, -1); }}
                          disabled={i === 0}
                          className="w-5 h-5 rounded hover:bg-gray-200 flex items-center justify-center text-gray-400 disabled:opacity-30 transition-colors">
                          <ChevronUp size={12} />
                        </button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); moveStep(i, 1); }}
                          disabled={i === steps.length - 1}
                          className="w-5 h-5 rounded hover:bg-gray-200 flex items-center justify-center text-gray-400 disabled:opacity-30 transition-colors">
                          <ChevronDown size={12} />
                        </button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); removeStep(step.id); }}
                          disabled={steps.length === 1}
                          className="w-5 h-5 rounded hover:bg-red-50 flex items-center justify-center text-red-400 disabled:opacity-30 transition-colors">
                          <Trash2 size={11} />
                        </button>
                        {expanded.has(step.id) ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
                      </div>
                    </div>

                    {/* Step details */}
                    {expanded.has(step.id) && (
                      <div className="px-3 py-3 space-y-2">
                        <input value={step.title}
                          onChange={(e) => updateStep(step.id, 'title', e.target.value)}
                          placeholder="Título del paso *"
                          className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all" />
                        <textarea value={step.description}
                          onChange={(e) => updateStep(step.id, 'description', e.target.value)}
                          placeholder="Descripción de la actividad..."
                          rows={2}
                          className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] resize-none transition-all" />
                        <div className="grid grid-cols-2 gap-2">
                          <input value={step.responsible}
                            onChange={(e) => updateStep(step.id, 'responsible', e.target.value)}
                            placeholder="Responsable (área o cargo)"
                            className="px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all" />
                          <input value={step.duration}
                            onChange={(e) => updateStep(step.id, 'duration', e.target.value)}
                            placeholder="Duración estimada"
                            className="px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all" />
                        </div>
                        <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                          <input type="checkbox" checked={step.required}
                            onChange={(e) => updateStep(step.id, 'required', e.target.checked)}
                            className="rounded border-gray-300 text-[#1e3a5f] focus:ring-[#1e3a5f]" />
                          Paso obligatorio
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                <span className="flex items-center gap-1"><Tag size={11} /> Etiquetas</span>
              </label>
              <div className="flex gap-2 mb-2">
                <input ref={tagRef} value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  placeholder="Escribe y presiona Enter"
                  className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all" />
                <button type="button" onClick={addTag}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition-colors">
                  <Plus size={14} />
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs rounded-full px-2.5 py-1">
                      {t}
                      <button type="button" onClick={() => setTags((prev) => prev.filter((x) => x !== t))}
                        className="text-gray-400 hover:text-gray-600 ml-0.5">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
            {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">{error}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#1e3a5f] hover:bg-[#0d2240] disabled:opacity-50 text-white text-sm font-semibold transition-colors">
                {saving ? 'Guardando...' : initial ? 'Guardar cambios' : 'Crear flujo'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
