import { FileSearch, BookOpen, Search, FileOutput, Bot, FileText } from 'lucide-react';
import { useAppSettings } from '../context/AppSettingsContext';

const ICON_CYCLE = [FileSearch, BookOpen, Search, FileOutput, Bot, FileText] as const;

interface QuickActionsProps {
  onSelect: (prompt: string) => void;
}

export default function QuickActions({ onSelect }: QuickActionsProps) {
  const { settings } = useAppSettings();

  const actions: string[] = settings?.quick_actions?.length
    ? settings.quick_actions.slice(0, 6)
    : ['Redactar un oficio', 'Resumir un documento', 'Buscar normativa vigente', 'Crear una plantilla'];

  return (
    <div className="grid grid-cols-2 gap-2">
      {actions.map((label, idx) => {
        const Icon = ICON_CYCLE[idx % ICON_CYCLE.length];
        return (
          <button
            key={label}
            onClick={() => onSelect(label)}
            className="flex items-center gap-2.5 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 font-medium hover:border-[#1e3a5f] hover:text-[#1e3a5f] hover:bg-blue-50/40 transition-all duration-150 text-left group shadow-sm"
          >
            <Icon size={16} className="text-gray-400 group-hover:text-[#2563eb] flex-shrink-0 transition-colors" />
            <span className="truncate">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
