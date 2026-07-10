import { useEffect, useState } from 'react';
import { FileText, File, Upload, ExternalLink, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Doc {
  id: string;
  name: string;
  ext: string;
  size_label: string;
  created_at: string;
  has_content: boolean;
}

interface DocumentsPanelProps {
  onUpload: () => void;
}

export default function DocumentsPanel({ onUpload }: DocumentsPanelProps) {
  const [docs, setDocs]   = useState<Doc[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, count } = await supabase
        .from('documents')
        .select('id, name, ext, size_label, created_at, content', { count: 'exact' })
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        setDocs(data.map((d) => ({
          id: d.id,
          name: d.name,
          ext: d.ext,
          size_label: d.size_label,
          created_at: d.created_at,
          has_content: d.content !== null && d.content !== '',
        })));
        setTotal(count ?? data.length);
      }
      setLoading(false);
    }
    load();
  }, []);

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('es-MX', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  }

  const extColor: Record<string, string> = {
    pdf:  'bg-red-50 text-red-500',
    docx: 'bg-blue-50 text-blue-500',
    xlsx: 'bg-green-50 text-green-600',
    txt:  'bg-amber-50 text-amber-600',
  };

  const missingContent = docs.filter((d) => !d.has_content);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-[#0d2240]">Documentos de apoyo</h2>
        <button
          onClick={onUpload}
          className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#1e3a5f] hover:bg-[#0d2240] px-3 py-1.5 rounded-lg transition-colors"
        >
          <Upload size={13} />
          Subir documento
        </button>
      </div>

      {/* Warning when documents have no indexed content */}
      {!loading && missingContent.length > 0 && (
        <div className="mb-3 flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2.5">
          <AlertTriangle size={13} className="text-orange-500 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-orange-700 leading-snug">
            <strong>{missingContent.length} documento{missingContent.length !== 1 ? 's' : ''}</strong> sin texto.
            {' '}Edítalos en la sección <strong>Documentos</strong> para que la IA pueda usarlos.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 size={18} className="animate-spin text-gray-400" />
        </div>
      ) : docs.length === 0 ? (
        <div className="text-center py-6">
          <File size={24} className="text-gray-300 mx-auto mb-2" />
          <p className="text-xs text-gray-400">Sin documentos. Sube el primero.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 ${
                doc.ext === 'pdf' ? 'bg-red-50' : 'bg-blue-50'
              }`}>
                {doc.ext === 'pdf'
                  ? <FileText size={14} className="text-red-500" />
                  : <File size={14} className="text-blue-500" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{doc.name}.{doc.ext}</p>
                  {doc.has_content ? (
                    <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1 py-0.5 rounded flex-shrink-0">
                      IA
                    </span>
                  ) : (
                    <span className="text-[9px] font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-1 py-0.5 rounded flex-shrink-0 flex items-center gap-0.5">
                      <AlertTriangle size={8} />
                      Sin texto
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">{doc.size_label} · {fmtDate(doc.created_at)}</p>
              </div>
              <span className={`text-xs font-semibold uppercase px-1.5 py-0.5 rounded flex-shrink-0 ${extColor[doc.ext] ?? 'bg-gray-100 text-gray-500'}`}>
                {doc.ext}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-100">
        <button className="flex items-center gap-1.5 text-xs font-semibold text-[#2563eb] hover:text-[#1e3a5f] transition-colors">
          <ExternalLink size={13} />
          Ver todos los documentos ({total})
        </button>
      </div>
    </div>
  );
}
