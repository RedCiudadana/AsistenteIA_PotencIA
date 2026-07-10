import { useState, useEffect, useRef } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import type { DocumentTemplate, FlowCategory, TemplatePlaceholder } from '../../lib/supabase';

interface TemplateModalProps {
  initial?: DocumentTemplate | null;
  categories: FlowCategory[];
  onSave: (data: Partial<DocumentTemplate>) => Promise<void>;
  onClose: () => void;
}

const PLACEHOLDER_REGEX = /\{\{(\w+)\}\}/g;

function extractPlaceholders(content: string): string[] {
  const found = new Set<string>();
  let m;
  while ((m = PLACEHOLDER_REGEX.exec(content)) !== null) found.add(m[1]);
  PLACEHOLDER_REGEX.lastIndex = 0;
  return [...found];
}

export default function TemplateModal({ initial, categories, onSave, onClose }: TemplateModalProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [placeholders, setPlaceholders] = useState<TemplatePlaceholder[]>(initial?.placeholders ?? []);
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'content' | 'placeholders'>('content');
  const tagRef = useRef<HTMLInputElement>(null);

  // Sync placeholders when content changes
  useEffect(() => {
    const keys = extractPlaceholders(content);
    setPlaceholders((prev) => {
      const existing = Object.fromEntries(prev.map((p) => [p.key, p]));
      return keys.map((key) => existing[key] ?? { key, label: key, description: '' });
    });
  }, [content]);

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput('');
    tagRef.current?.focus();
  }

  function updatePlaceholder(key: string, field: 'label' | 'description', value: string) {
    setPlaceholders((prev) => prev.map((p) => p.key === key ? { ...p, [field]: value } : p));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError('El título es obligatorio.'); return; }
    if (!content.trim()) { setError('El contenido del formato es obligatorio.'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave({ title: title.trim(), description: description.trim() || null, category_id: categoryId || null, content, placeholders, tags });
      onClose();
    } catch {
      setError('No se pudo guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  const visibleCats = categories.filter((c) => c.applies_to === 'templates' || c.applies_to === 'both');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-bold text-[#0d2240]">
            {initial ? 'Editar formato' : 'Nuevo formato'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Title + Category row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Título *</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Oficio de respuesta"
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
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Descripción corta</label>
                <input value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Para qué se usa este formato"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all" />
              </div>
            </div>

            {/* Tabs: Content / Placeholders */}
            <div>
              <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-3 w-fit">
                {(['content', 'placeholders'] as const).map((tab) => (
                  <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === tab ? 'bg-white text-[#1e3a5f] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}>
                    {tab === 'content' ? 'Contenido' : `Variables (${placeholders.length})`}
                  </button>
                ))}
              </div>

              {activeTab === 'content' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-gray-700">Contenido del formato *</label>
                    <span className="text-[10px] text-gray-400">Usa <code className="bg-gray-100 px-1 rounded">{'{{variable}}'}</code> para campos dinámicos</span>
                  </div>
                  <textarea value={content} onChange={(e) => setContent(e.target.value)}
                    placeholder={'{{lugar}}, a {{fecha}}\n\nOFICIO NÚM. {{numero_oficio}}\n\n...'}
                    rows={12}
                    className="w-full px-3 py-2.5 text-xs font-mono border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] resize-none transition-all leading-relaxed" />
                  {placeholders.length > 0 && (
                    <p className="text-[10px] text-gray-400 mt-1.5">
                      Variables detectadas: {placeholders.map((p) => `{{${p.key}}}`).join(', ')}
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'placeholders' && (
                <div className="space-y-2">
                  {placeholders.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <p className="text-xs">No hay variables en el contenido.</p>
                      <p className="text-xs mt-1">Agrega <code className="bg-gray-100 px-1 rounded text-[10px]">{'{{variable}}'}</code> en el texto.</p>
                    </div>
                  ) : placeholders.map((p) => (
                    <div key={p.key} className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex gap-3 items-start">
                      <code className="text-xs bg-violet-50 text-violet-700 border border-violet-100 rounded-md px-2 py-1 font-mono flex-shrink-0 mt-0.5">{`{{${p.key}}}`}</code>
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <input value={p.label} onChange={(e) => updatePlaceholder(p.key, 'label', e.target.value)}
                          placeholder="Etiqueta"
                          className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all" />
                        <input value={p.description} onChange={(e) => updatePlaceholder(p.key, 'description', e.target.value)}
                          placeholder="Descripción (opcional)"
                          className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                {saving ? 'Guardando...' : initial ? 'Guardar cambios' : 'Crear formato'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
