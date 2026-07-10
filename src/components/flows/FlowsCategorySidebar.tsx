import { Plus, Tag, Filter, Folder } from 'lucide-react';
import type { FlowCategory } from '../../lib/supabase';

interface FlowsCategorySidebarProps {
  categories: FlowCategory[];
  counts: Record<string, number>;
  totalCount: number;
  selected: string | null;
  onSelect: (id: string | null) => void;
  onAdd: () => void;
  tab: 'templates' | 'flows';
}

export default function FlowsCategorySidebar({
  categories,
  counts,
  totalCount,
  selected,
  onSelect,
  onAdd,
  tab,
}: FlowsCategorySidebarProps) {
  const visible = categories.filter(
    (c) => c.applies_to === tab || c.applies_to === 'both',
  );

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Folder size={15} className="text-[#1e3a5f]" />
          <span className="text-xs font-bold text-[#0d2240] uppercase tracking-wide">Categorías</span>
        </div>
        <button
          onClick={onAdd}
          className="w-6 h-6 rounded-md bg-[#f0f5ff] hover:bg-[#dbeafe] text-[#2563eb] flex items-center justify-center transition-colors"
        >
          <Plus size={13} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        <button
          onClick={() => onSelect(null)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all text-left ${
            selected === null
              ? 'bg-[#f0f5ff] text-[#1e3a5f] font-bold'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Filter size={13} className={selected === null ? 'text-[#2563eb]' : 'text-gray-400'} />
          <span className="flex-1">Todos</span>
          <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-bold ${
            selected === null ? 'bg-[#dbeafe] text-[#1e3a5f]' : 'bg-gray-100 text-gray-500'
          }`}>
            {totalCount}
          </span>
        </button>

        {visible.map((cat) => {
          const isActive = selected === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all text-left ${
                isActive ? 'bg-[#f0f5ff] font-bold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
              <span className={`flex-1 truncate ${isActive ? 'text-[#1e3a5f]' : ''}`}>{cat.name}</span>
              <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-bold ${
                isActive ? 'bg-[#dbeafe] text-[#1e3a5f]' : 'bg-gray-100 text-gray-500'
              }`}>
                {counts[cat.id] ?? 0}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t border-gray-100">
        <p className="text-[10px] text-gray-400 leading-relaxed">
          {tab === 'templates'
            ? 'Los formatos son plantillas que la IA puede completar automáticamente.'
            : 'Los flujos guían paso a paso los procesos institucionales.'}
        </p>
      </div>
    </aside>
  );
}
