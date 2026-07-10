import { useEffect, useState } from 'react';
import {
  Shield, RefreshCw,
  CheckCircle2, AlertTriangle, XCircle,
} from 'lucide-react';
import { supabase, type PrivacySettings, type ComplianceItem } from '../../lib/supabase';
import PrivacySettingsTab from './PrivacySettingsTab';

const SETTINGS_ID = '00000000-0000-0000-0000-000000000001';

export default function PrivacyPage() {
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');
    const [sRes, cRes] = await Promise.all([
      supabase.from('privacy_settings').select('*').eq('id', SETTINGS_ID).maybeSingle(),
      supabase.from('compliance_items').select('*').order('category').order('order_index'),
    ]);
    if (sRes.error || cRes.error) {
      setError('No se pudo cargar la información.');
    } else {
      setSettings(sRes.data as PrivacySettings | null);
      setComplianceItems((cRes.data ?? []) as ComplianceItem[]);
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function saveSettings(data: Partial<PrivacySettings>) {
    const { error } = await supabase
      .from('privacy_settings')
      .update(data)
      .eq('id', SETTINGS_ID);
    if (error) throw error;
    setSettings((prev) => prev ? { ...prev, ...data } : prev);
  }

  const totalCompliant = complianceItems.filter((i) => i.status === 'compliant').length;
  const totalItems     = complianceItems.length;
  const compliancePct  = totalItems ? Math.round((totalCompliant / totalItems) * 100) : 0;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#1e3a5f] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Cargando privacidad y seguridad...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-500 text-sm font-medium mb-3">{error}</p>
          <button onClick={loadData} className="flex items-center gap-2 text-sm text-[#2563eb] hover:underline mx-auto">
            <RefreshCw size={14} /> Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      {/* Page header */}
      <div className="px-6 py-4 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#f0f5ff] rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-[#1e3a5f]" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-[#0d2240]">Privacidad y Seguridad</h1>
              <p className="text-xs text-gray-400">Configuración institucional de protección de datos</p>
            </div>
          </div>

          {/* Compliance pill */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
            compliancePct >= 70 ? 'bg-green-50 border-green-200' :
            compliancePct >= 40 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
          }`}>
            {compliancePct >= 70
              ? <CheckCircle2 size={14} className="text-green-600" />
              : compliancePct >= 40
              ? <AlertTriangle size={14} className="text-amber-500" />
              : <XCircle size={14} className="text-red-500" />
            }
            <span className={`text-xs font-bold ${
              compliancePct >= 70 ? 'text-green-700' :
              compliancePct >= 40 ? 'text-amber-700' : 'text-red-700'
            }`}>
              Cumplimiento: {compliancePct}%
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {settings && (
          <PrivacySettingsTab settings={settings} onSave={saveSettings} />
        )}
        <div className="h-4" />
      </div>
    </div>
  );
}

