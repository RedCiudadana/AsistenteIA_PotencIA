import { Building2, Globe, Mail, MapPin, Layers, Shield } from 'lucide-react';
import type { AppSettings } from '../../lib/supabase';

const STATES = [
  'Aguascalientes','Baja California','Baja California Sur','Campeche','Chiapas',
  'Chihuahua','Ciudad de México','Coahuila','Colima','Durango','Guanajuato',
  'Guerrero','Hidalgo','Jalisco','Estado de México','Michoacán','Morelos','Nayarit',
  'Nuevo León','Oaxaca','Puebla','Querétaro','Quintana Roo','San Luis Potosí',
  'Sinaloa','Sonora','Tabasco','Tamaulipas','Tlaxcala','Veracruz','Yucatán','Zacatecas',
  'Gobierno Federal',
];

interface Props {
  draft: AppSettings;
  onChange: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

export default function InstitutionSection({ draft, onChange }: Props) {
  return (
    <div className="space-y-6">
      {/* Platform branding */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Shield size={16} className="text-[#2563eb]" />
          <h3 className="text-sm font-bold text-[#0d2240]">Marca de la plataforma</h3>
        </div>
        <div className="px-5 py-5 space-y-4">
          <p className="text-xs text-gray-500">
            Estos valores aparecen en el logo del menú lateral y como identificador de la plataforma.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nombre de la plataforma</label>
              <input
                value={draft.platform_name ?? ''}
                onChange={(e) => onChange('platform_name', e.target.value)}
                placeholder="Red Ciudadana"
                maxLength={30}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Lema / subtítulo</label>
              <input
                value={draft.platform_tagline ?? ''}
                onChange={(e) => onChange('platform_tagline', e.target.value)}
                placeholder="Plataforma Institucional"
                maxLength={40}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
              />
            </div>
          </div>
          <div className="mt-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Vista previa del menú</p>
            <div className="inline-flex items-center gap-2.5 bg-[#0d2240] rounded-xl px-4 py-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden bg-white/10">
                <img
                  src="https://redciudadana.org/logo_red_ciudadana.png"
                  alt="Logo"
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div>
                <span className="text-white text-sm font-bold block leading-tight">
                  {draft.platform_name || 'Red Ciudadana'}
                </span>
                <span className="text-white/40 text-xs">
                  {draft.platform_tagline || 'Plataforma Institucional'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Institution identity */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Building2 size={16} className="text-[#2563eb]" />
          <h3 className="text-sm font-bold text-[#0d2240]">Perfil institucional</h3>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Nombre de la institución *
            </label>
            <input
              value={draft.institution_name}
              onChange={(e) => onChange('institution_name', e.target.value)}
              placeholder="Ej. Secretaría de Transparencia"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
            />
            <p className="text-[10px] text-gray-400 mt-1">Aparece en la barra superior, el perfil y en el contexto de la IA.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                <span className="flex items-center gap-1"><Layers size={11} /> Área o dirección</span>
              </label>
              <input
                value={draft.institution_dept ?? ''}
                onChange={(e) => onChange('institution_dept', e.target.value || null)}
                placeholder="Ej. Dirección de Transparencia"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                <span className="flex items-center gap-1"><MapPin size={11} /> Estado / entidad</span>
              </label>
              <select
                value={draft.institution_state ?? ''}
                onChange={(e) => onChange('institution_state', e.target.value || null)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
              >
                <option value="">Seleccionar estado</option>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                <span className="flex items-center gap-1"><Globe size={11} /> Sitio web oficial</span>
              </label>
              <input
                type="url"
                value={draft.institution_website ?? ''}
                onChange={(e) => onChange('institution_website', e.target.value || null)}
                placeholder="https://www.institucion.gob.mx"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                <span className="flex items-center gap-1"><Mail size={11} /> Correo institucional</span>
              </label>
              <input
                type="email"
                value={draft.institution_email ?? ''}
                onChange={(e) => onChange('institution_email', e.target.value || null)}
                placeholder="contacto@institucion.gob.mx"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview card */}
      <div className="bg-gradient-to-br from-[#0d2240] to-[#1e3a5f] rounded-2xl p-5 text-white">
        <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-3">Vista previa del perfil institucional</p>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
            <Building2 size={22} className="text-white/70" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">{draft.institution_name || 'Institución Pública'}</p>
            {draft.institution_dept && <p className="text-xs text-white/60 mt-0.5">{draft.institution_dept}</p>}
            {draft.institution_state && (
              <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
                <MapPin size={9} />{draft.institution_state}
              </p>
            )}
          </div>
        </div>
        {(draft.institution_website || draft.institution_email) && (
          <div className="mt-3 pt-3 border-t border-white/10 flex gap-4">
            {draft.institution_website && (
              <span className="text-[10px] text-white/50 flex items-center gap-1">
                <Globe size={9} />{draft.institution_website.replace('https://', '')}
              </span>
            )}
            {draft.institution_email && (
              <span className="text-[10px] text-white/50 flex items-center gap-1">
                <Mail size={9} />{draft.institution_email}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
