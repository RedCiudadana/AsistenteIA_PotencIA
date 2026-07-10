import { AlertCircle } from 'lucide-react';
import { useAppSettings } from '../context/AppSettingsContext';

export default function HumanReviewNotice() {
  const { settings } = useAppSettings();
  const aiName = settings?.ai_name ?? 'La IA';

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <AlertCircle size={15} className="text-amber-600" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-amber-800 mb-1">Revisión humana (importante)</h3>
          <p className="text-xs text-amber-700 leading-relaxed">
            {aiName} genera respuestas para apoyarte. Siempre deben ser revisadas por una persona antes de usarlas oficialmente.
          </p>
        </div>
      </div>
    </div>
  );
}
