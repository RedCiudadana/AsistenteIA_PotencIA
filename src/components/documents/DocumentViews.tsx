import { FileText, File, FileSpreadsheet, FileCode, MoreHorizontal, Edit2, Trash2, Archive, Bot } from 'lucide-react';
import { useState } from 'react';
import type { Document, Category } from '../../lib/supabase';

export const EXT_CONFIG = {
  pdf:  { icon: FileText,        bg: 'bg-red-50',    text: 'text-red-500',    badge: 'bg-red-50 text-red-600'    },
  docx: { icon: File,            bg: 'bg-blue-50',   text: 'text-blue-500',   badge: 'bg-blue-50 text-blue-600'  },
  xlsx: { icon: FileSpreadsheet, bg: 'bg-green-50',  text: 'text-green-600',  badge: 'bg-green-50 text-green-700'},
  txt:  { icon: FileCode,        bg: 'bg-gray-100',  text: 'text-gray-500',   badge: 'bg-gray-100 text-gray-600' },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

interface ActionMenuProps {
  doc: Document;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
}

function ActionMenu({ doc, onEdit, onDelete, onArchive }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
      >
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-40">
            <button
              onClick={() => { onEdit(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
            >
              <Edit2 size={13} /> Editar
            </button>
            <button
              onClick={() => { onArchive(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
            >
              <Archive size={13} />
              {doc.status === 'active' ? 'Archivar' : 'Activar'}
            </button>
            <div className="border-t border-gray-100 my-1" />
            <button
              onClick={() => { onDelete(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
            >
              <Trash2 size={13} /> Eliminar
            </button>
          </div>
        </>
      )}
    </div>
  );
}

interface DocumentCardProps {
  doc: Document;
  categories: Category[];
  onEdit: (doc: Document) => void;
  onDelete: (doc: Document) => void;
  onArchive: (doc: Document) => void;
  onUseInAssistant: (doc: Document) => void;
}

export function DocumentCard({ doc, categories, onEdit, onDelete, onArchive, onUseInAssistant }: DocumentCardProps) {
  const cfg = EXT_CONFIG[doc.ext] ?? EXT_CONFIG.pdf;
  const Icon = cfg.icon;
  const cat = categories.find((c) => c.id === doc.category_id);

  return (
    <div className={`bg-white border rounded-2xl p-4 flex flex-col gap-3 hover:shadow-md transition-all duration-150 hover:-translate-y-0.5 ${
      doc.status === 'archived' ? 'opacity-60' : ''
    }`}>
      {/* Top row */}
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={20} className={cfg.text} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[#0d2240] leading-snug line-clamp-2">{doc.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{doc.size_label} · {fmtDate(doc.created_at)}</p>
        </div>
        <ActionMenu doc={doc} onEdit={() => onEdit(doc)} onDelete={() => onDelete(doc)} onArchive={() => onArchive(doc)} />
      </div>

      {/* Description */}
      {doc.description && (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{doc.description}</p>
      )}

      {/* Tags */}
      {doc.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {doc.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">{tag}</span>
          ))}
          {doc.tags.length > 3 && (
            <span className="text-xs text-gray-400 px-1">+{doc.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-bold uppercase px-1.5 py-0.5 rounded ${cfg.badge}`}>{doc.ext}</span>
          {cat && (
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
              style={{ background: cat.color }}
            >
              {cat.name}
            </span>
          )}
          {doc.status === 'archived' && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
              Archivado
            </span>
          )}
        </div>
        <button
          onClick={() => onUseInAssistant(doc)}
          title="Usar en el asistente"
          className="flex items-center gap-1 text-xs text-[#2563eb] hover:text-[#1e3a5f] font-medium transition-colors"
        >
          <Bot size={13} />
          Usar
        </button>
      </div>
    </div>
  );
}

interface DocumentTableProps {
  docs: Document[];
  categories: Category[];
  onEdit: (doc: Document) => void;
  onDelete: (doc: Document) => void;
  onArchive: (doc: Document) => void;
  onUseInAssistant: (doc: Document) => void;
}

export function DocumentTable({ docs, categories, onEdit, onDelete, onArchive, onUseInAssistant }: DocumentTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/80">
            <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Documento</th>
            <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">Categoría</th>
            <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden lg:table-cell">Etiquetas</th>
            <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden sm:table-cell">Tamaño</th>
            <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden lg:table-cell">Fecha</th>
            <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Estado</th>
            <th className="px-4 py-3 w-10" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {docs.map((doc) => {
            const cfg = EXT_CONFIG[doc.ext] ?? EXT_CONFIG.pdf;
            const Icon = cfg.icon;
            const cat = categories.find((c) => c.id === doc.category_id);
            return (
              <tr key={doc.id} className={`hover:bg-gray-50/60 transition-colors ${doc.status === 'archived' ? 'opacity-55' : ''}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={16} className={cfg.text} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[#0d2240] truncate max-w-[200px]">{doc.name}</p>
                      <span className={`text-xs font-bold uppercase ${cfg.badge.split(' ')[1]}`}>.{doc.ext}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {cat ? (
                    <span className="text-xs font-medium text-white px-2.5 py-1 rounded-full" style={{ background: cat.color }}>
                      {cat.name}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Sin categoría</span>
                  )}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {doc.tags.slice(0, 2).map((t) => (
                      <span key={t} className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">{t}</span>
                    ))}
                    {doc.tags.length > 2 && <span className="text-xs text-gray-400">+{doc.tags.length - 2}</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">{doc.size_label}</td>
                <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">{fmtDate(doc.created_at)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    doc.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {doc.status === 'active' ? 'Activo' : 'Archivado'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUseInAssistant(doc)}
                      title="Usar en el asistente"
                      className="w-7 h-7 rounded-lg hover:bg-blue-50 text-[#2563eb] flex items-center justify-center transition-colors"
                    >
                      <Bot size={14} />
                    </button>
                    <ActionMenu doc={doc} onEdit={() => onEdit(doc)} onDelete={() => onDelete(doc)} onArchive={() => onArchive(doc)} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
