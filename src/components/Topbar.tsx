import { Search, HelpCircle, ChevronDown, User } from 'lucide-react';
import { useAppSettings } from '../context/AppSettingsContext';

export default function Topbar() {
  const { settings } = useAppSettings();

  const institutionName = settings?.institution_name ?? 'Institución Pública';
  const institutionDept = settings?.institution_dept ?? null;

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-4 flex-shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar..."
          className="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all placeholder:text-gray-400"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Help */}
        <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#0d2240] transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-50">
          <HelpCircle size={17} />
          <span className="hidden sm:block">Ayuda</span>
        </button>

        {/* Institution badge */}
        <div className="flex items-center gap-1.5 text-sm font-medium text-[#0d2240] bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
          <span className="hidden md:block max-w-[200px] truncate">{institutionName}</span>
          <span className="md:hidden">Institución</span>
          <ChevronDown size={15} className="text-gray-400 flex-shrink-0" />
        </div>

        {/* Profile — shows institution info since there's no user auth */}
        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-[#1e3a5f] flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-white" />
          </div>
          <div className="hidden lg:block text-left min-w-0">
            <span className="text-sm font-semibold text-[#0d2240] block leading-tight max-w-[140px] truncate">
              {institutionName}
            </span>
            <span className="text-xs text-gray-500 truncate block max-w-[140px]">
              {institutionDept ?? 'Administración'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
