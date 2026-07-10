import { Plus, Tag, Folder, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import type { Category } from '../lib/supabase';

interface CategorySidebarProps {
  categories: Category[];
  docCounts: Record<string, number>;
  totalCount: number;
  selected: string | null;
  onSelect: (id: string | null) => void;
  onAdd: () => void;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
}

export default function CategorySidebar({
  categories,
  docCounts,
  totalCount,
  selected,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
}: CategorySidebarProps) {
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Folder size={16} className="text-[#1e3a5f]" />
          <span className="text-sm font-bold text-[#0d2240]">Categorías</span>
        </div>
        <button
          onClick={onAdd}
          title="Nueva categoría"
          className="w-7 h-7 rounded-lg bg-[#f0f5ff] hover:bg-[#dbeafe] text-[#2563eb] flex items-center justify-center transition-colors"
        >
          <Plus size={15} />
        </button>
      </div>

      {/* Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {/* All documents */}
        <button
          onClick={() => onSelect(null)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-150 text-left ${
            selected === null
              ? 'bg-[#f0f5ff] text-[#1e3a5f] font-semibold'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Tag size={15} className={selected === null ? 'text-[#2563eb]' : 'text-gray-400'} />
          <span className="flex-1">Todos los documentos</span>
          <span className={`text-xs rounded-full px-2 py-0.5 font-semibold ${
            selected === null ? 'bg-[#dbeafe] text-[#1e3a5f]' : 'bg-gray-100 text-gray-500'
          }`}>
            {totalCount}
          </span>
        </button>

        {/* Category items */}
        {categories.map((cat) => {
          const isActive = selected === cat.id;
          const count = docCounts[cat.id] ?? 0;
          return (
            <div
              key={cat.id}
              className="relative group"
              onMouseLeave={() => setHoveredMenu(null)}
            >
              <button
                onClick={() => onSelect(cat.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-150 text-left ${
                  isActive ? 'bg-[#f0f5ff] font-semibold' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: cat.color }}
                />
                <span className={`flex-1 truncate ${isActive ? 'text-[#1e3a5f]' : ''}`}>
                  {cat.name}
                </span>
                <span className={`text-xs rounded-full px-2 py-0.5 font-semibold ${
                  isActive ? 'bg-[#dbeafe] text-[#1e3a5f]' : 'bg-gray-100 text-gray-500'
                }`}>
                  {count}
                </span>
              </button>

              {/* Context menu trigger */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setHoveredMenu(hoveredMenu === cat.id ? null : cat.id);
                }}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md opacity-0 group-hover:opacity-100 hover:bg-gray-200 flex items-center justify-center transition-all text-gray-400"
              >
                <MoreHorizontal size={13} />
              </button>

              {/* Dropdown menu */}
              {hoveredMenu === cat.id && (
                <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-36">
                  <button
                    onClick={() => { onEdit(cat); setHoveredMenu(null); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Edit2 size={13} />
                    Editar
                  </button>
                  <button
                    onClick={() => { onDelete(cat); setHoveredMenu(null); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} />
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer tip */}
      <div className="px-4 py-3 border-t border-gray-100">
        <p className="text-xs text-gray-400 leading-relaxed">
          Las categorías ayudan a la IA a encontrar los documentos correctos para tu solicitud.
        </p>
      </div>
    </aside>
  );
}
