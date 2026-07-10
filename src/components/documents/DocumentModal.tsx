import { useState, useEffect, useRef } from 'react';
import { X, Upload, Tag, Plus, CheckCircle, ClipboardPaste } from 'lucide-react';
import type { Document, Category } from '../../lib/supabase';

interface DocumentModalProps {
  initial?: Document | null;
  categories: Category[];
  onSave: (data: Partial<Document>) => Promise<void>;
  onClose: () => void;
}

const EXT_OPTIONS = ['pdf', 'docx', 'xlsx', 'txt'] as const;

export default function DocumentModal({ initial, categories, onSave, onClose }: DocumentModalProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [ext, setExt] = useState<typeof EXT_OPTIONS[number]>(initial?.ext ?? 'pdf');
  const [sizeLabel, setSizeLabel] = useState(initial?.size_label ?? '');
  const [categoryId, setCategoryId] = useState<string>(initial?.category_id ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [dropState, setDropState] = useState<'idle' | 'dragging' | 'done'>('idle');
  const [fakeName, setFakeName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const tagRef = useRef<HTMLInputElement>(null);

  const isEdit = !!initial;

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setExt(initial.ext);
      setSizeLabel(initial.size_label);
      setCategoryId(initial.category_id ?? '');
      setDescription(initial.description ?? '');
      setContent(initial.content ?? '');
      setTags(initial.tags ?? []);
    }
  }, [initial]);

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput('');
    tagRef.current?.focus();
  }

  function removeTag(t: string) {
    setTags((prev) => prev.filter((x) => x !== t));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setFakeName(file.name);
      const rawName = file.name.replace(/\.[^.]+$/, '');
      if (!name) setName(rawName);
      const sizeKB = Math.round(file.size / 1024);
      setSizeLabel(sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`);
      const detectedExt = file.name.split('.').pop()?.toLowerCase();
      if (EXT_OPTIONS.includes(detectedExt as typeof EXT_OPTIONS[number])) {
        setExt(detectedExt as typeof EXT_OPTIONS[number]);
      }
      setDropState('done');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('El nombre del documento es obligatorio.'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave({
        name: name.trim(),
        ext,
        size_label: sizeLabel || '—',
        category_id: categoryId || null,
        description: description.trim() || null,
        content: content.trim() || null,
        tags,
      });
      onClose();
    } catch {
      setError('No se pudo guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-[#0d2240]">
            {isEdit ? 'Editar documento' : 'Agregar documento'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Upload zone (only for new docs) */}
          {!isEdit && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDropState('dragging'); }}
              onDragLeave={() => setDropState('idle')}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all ${
                dropState === 'dragging' ? 'border-[#2563eb] bg-blue-50' :
                dropState === 'done'     ? 'border-green-300 bg-green-50' :
                'border-gray-200 hover:border-gray-300'
              }`}
            >
              {dropState === 'done' ? (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle size={18} className="text-green-600" />
                  <span className="text-sm font-medium text-green-700">{fakeName}</span>
                </div>
              ) : (
                <>
                  <Upload size={20} className={`mx-auto mb-1.5 ${dropState === 'dragging' ? 'text-[#2563eb]' : 'text-gray-400'}`} />
                  <p className="text-xs font-medium text-gray-600 mb-0.5">Arrastra el archivo aquí</p>
                  <p className="text-xs text-gray-400">o completa el formulario manualmente</p>
                </>
              )}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nombre del documento *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Manual de procedimientos"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
            />
          </div>

          {/* Ext + Size */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tipo de archivo</label>
              <select
                value={ext}
                onChange={(e) => setExt(e.target.value as typeof EXT_OPTIONS[number])}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all bg-white"
              >
                {EXT_OPTIONS.map((o) => <option key={o} value={o}>.{o.toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tamaño (opcional)</label>
              <input
                value={sizeLabel}
                onChange={(e) => setSizeLabel(e.target.value)}
                placeholder="Ej. 1.2 MB"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Categoría</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all bg-white"
            >
              <option value="">Sin categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Descripción (opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descripción del contenido..."
              rows={2}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] resize-none transition-all"
            />
          </div>

          {/* Content for AI indexing */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
              <ClipboardPaste size={12} />
              Contenido para la IA
              {initial?.content && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">Indexado</span>
              )}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Pega aquí el texto del documento para que el asistente de IA pueda buscarlo y usarlo como contexto..."
              rows={5}
              maxLength={50000}
              className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] resize-y transition-all placeholder:text-gray-400 font-mono leading-relaxed"
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-[10px] text-gray-400">
                Sin contenido, la IA solo puede ver el nombre y descripción del archivo.
              </p>
              <p className="text-[10px] text-gray-400">{content.length.toLocaleString()} / 50,000</p>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              <span className="flex items-center gap-1.5"><Tag size={12} /> Etiquetas</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                ref={tagRef}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Escribe y presiona Enter"
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
              />
              <button type="button" onClick={addTag} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition-colors">
                <Plus size={15} />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs rounded-full px-2.5 py-1">
                    {t}
                    <button type="button" onClick={() => removeTag(t)} className="text-gray-400 hover:text-gray-600 ml-0.5">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-[#1e3a5f] hover:bg-[#0d2240] disabled:opacity-50 text-white text-sm font-semibold transition-colors"
            >
              {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Agregar documento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
