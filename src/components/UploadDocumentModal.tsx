import { useState, useCallback } from 'react';
import { X, Upload, CheckCircle, FileText, AlertCircle, Loader2, ClipboardPaste } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Ext = 'pdf' | 'docx' | 'xlsx' | 'txt';

const ALLOWED_EXTS: Ext[] = ['pdf', 'docx', 'xlsx', 'txt'];

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getExt(filename: string): Ext | null {
  const ext = filename.split('.').pop()?.toLowerCase() as Ext | undefined;
  return ext && ALLOWED_EXTS.includes(ext) ? ext : null;
}

function getNameWithoutExt(filename: string): string {
  return filename.replace(/\.[^/.]+$/, '');
}

interface UploadDocumentModalProps {
  onClose: () => void;
}

type DropState = 'idle' | 'dragging' | 'ready';

export default function UploadDocumentModal({ onClose }: UploadDocumentModalProps) {
  const [dropState, setDropState]       = useState<DropState>('idle');
  const [file, setFile]                 = useState<File | null>(null);
  const [description, setDescription]   = useState('');
  const [manualContent, setManualContent] = useState('');
  const [saving, setSaving]             = useState(false);
  const [saveError, setSaveError]       = useState('');

  const acceptFile = useCallback((f: File) => {
    if (!getExt(f.name)) {
      setSaveError('Formato no permitido. Usa PDF, DOCX, XLSX o TXT.');
      return;
    }
    setSaveError('');
    setFile(f);
    setManualContent('');
    setDropState('ready');
  }, []);

  function handleDragOver(e: React.DragEvent) { e.preventDefault(); setDropState('dragging'); }
  function handleDragLeave() { setDropState(file ? 'ready' : 'idle'); }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) acceptFile(f);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) acceptFile(f);
  }

  async function handleSave() {
    if (!file) return;
    setSaving(true);
    setSaveError('');

    const ext = getExt(file.name)!;
    const name = getNameWithoutExt(file.name);

    // For TXT files: extract text automatically
    // For other types: use the manually pasted content if provided
    let content: string | null = null;
    if (ext === 'txt') {
      try {
        content = await file.text();
        if (content.length > 50000) content = content.slice(0, 50000);
      } catch {
        // Non-critical
      }
    } else if (manualContent.trim()) {
      content = manualContent.trim().slice(0, 50000);
    }

    const { error } = await supabase.from('documents').insert({
      name,
      ext,
      size_label: formatSize(file.size),
      size_bytes: file.size,
      description: description.trim() || null,
      content,
      tags: [],
      status: 'active',
    });

    if (error) {
      setSaveError('No se pudo guardar el documento. Intenta de nuevo.');
      setSaving(false);
      return;
    }

    supabase.from('activity_events').insert({
      event_type: 'doc_added',
      label: name,
      metadata: { ext, size_bytes: file.size, has_content: content !== null },
    });

    setSaving(false);
    onClose();
  }

  const fileExt = file ? getExt(file.name) : null;
  const needsManualContent = fileExt !== null && fileExt !== 'txt';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-[#0d2240]">Subir documento</h2>
            <p className="text-xs text-gray-500 mt-0.5">Formatos aceptados: PDF, DOCX, XLSX, TXT</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drop zone */}
        {dropState !== 'ready' ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
              dropState === 'dragging'
                ? 'border-[#2563eb] bg-blue-50'
                : 'border-gray-200 hover:border-[#1e3a5f] hover:bg-gray-50'
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center ${
              dropState === 'dragging' ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <Upload size={26} className={dropState === 'dragging' ? 'text-[#2563eb]' : 'text-gray-400'} />
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1">
              {dropState === 'dragging' ? 'Suelta el archivo aquí' : 'Arrastra tu documento aquí'}
            </p>
            <p className="text-xs text-gray-400 mb-4">o selecciónalo desde tu computadora</p>
            <label className="cursor-pointer inline-flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#0d2240] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
              <Upload size={15} />
              Seleccionar archivo
              <input
                type="file"
                accept=".pdf,.docx,.xlsx,.txt"
                className="hidden"
                onChange={handleFileInput}
              />
            </label>
          </div>
        ) : (
          <div className="space-y-3">
            {/* File ready card */}
            <div className="border-2 border-green-200 bg-green-50 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle size={22} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-green-800 truncate">{file?.name}</p>
                <p className="text-xs text-green-600">{file ? formatSize(file.size) : ''}</p>
              </div>
              <button
                onClick={() => { setFile(null); setDropState('idle'); setManualContent(''); }}
                className="text-green-400 hover:text-red-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* TXT: auto-extract notice */}
            {fileExt === 'txt' && (
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
                <FileText size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  El contenido de este archivo TXT se extraerá automáticamente y estará disponible para el asistente de IA.
                </p>
              </div>
            )}

            {/* PDF/DOCX/XLSX: manual content paste */}
            {needsManualContent && (
              <>
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                  <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Los archivos <strong>PDF, DOCX y XLSX</strong> no extraen texto automáticamente.
                    Para que la IA pueda usar el contenido, pega el texto del documento a continuación.
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
                    <ClipboardPaste size={12} />
                    Contenido del documento (para la IA)
                  </label>
                  <textarea
                    value={manualContent}
                    onChange={(e) => setManualContent(e.target.value)}
                    placeholder="Pega aquí el texto completo o los fragmentos más relevantes del documento..."
                    rows={6}
                    maxLength={50000}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] resize-y transition-all placeholder:text-gray-400 font-mono leading-relaxed"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[10px] text-gray-400">
                      Sin este texto, la IA solo verá el nombre y descripción del archivo.
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {manualContent.length.toLocaleString()} / 50,000
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Descripción (opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe brevemente el contenido de este documento..."
                rows={2}
                maxLength={300}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] resize-none transition-all placeholder:text-gray-400"
              />
            </div>
          </div>
        )}

        {/* Error */}
        {saveError && (
          <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
            <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
            <span className="text-xs text-red-700">{saveError}</span>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-4">
          Los documentos se almacenan de forma segura y son accesibles para el asistente de IA de tu institución.
        </p>

        {/* Actions */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={dropState !== 'ready' || saving}
            className="flex-1 py-2.5 rounded-xl bg-[#1e3a5f] hover:bg-[#0d2240] disabled:bg-gray-100 disabled:text-gray-400 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Guardando...
              </>
            ) : dropState === 'ready' ? (
              'Guardar documento'
            ) : (
              'Esperando archivo...'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
