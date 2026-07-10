import { useState } from 'react';
import {
  CheckCircle2, AlertTriangle, XCircle, ChevronDown,
  ChevronRight, Edit2, Check, X,
} from 'lucide-react';
import type { ComplianceItem, ComplianceCategory, ComplianceStatus } from '../../lib/supabase';

const CATEGORY_META: Record<ComplianceCategory, { label: string; color: string; bg: string; desc: string }> = {
  'LGTAIP':   { label: 'LGTAIP',    color: '#2563eb', bg: 'bg-blue-50',   desc: 'Ley General de Transparencia y Acceso a la Información Pública' },
  'LGPDPPSO': { label: 'LGPDPPSO',  color: '#7c3aed', bg: 'bg-violet-50', desc: 'Ley General de Protección de Datos en Posesión de Sujetos Obligados' },
  'NOM-151':  { label: 'NOM-151',   color: '#0d9488', bg: 'bg-teal-50',   desc: 'Conservación de Mensajes de Datos — Secretaría de Economía' },
  'MAAGTIC':  { label: 'MAAGTIC-SI',color: '#d97706', bg: 'bg-amber-50',  desc: 'Manual Administrativo de Aplicación General en TIC — INFOSEC' },
  'INTERNA':  { label: 'Políticas Internas', color: '#059669', bg: 'bg-green-50', desc: 'Políticas y controles internos de la institución' },
};

const STATUS_META: Record<ComplianceStatus, { icon: typeof CheckCircle2; color: string; bg: string; label: string }> = {
  compliant:     { icon: CheckCircle2, color: 'text-green-600',  bg: 'bg-green-50',  label: 'Cumple'         },
  warning:       { icon: AlertTriangle,color: 'text-amber-500',  bg: 'bg-amber-50',  label: 'En revisión'    },
  non_compliant: { icon: XCircle,      color: 'text-red-500',    bg: 'bg-red-50',    label: 'No cumple'      },
};

interface ComplianceTabProps {
  items: ComplianceItem[];
  onUpdateItem: (id: string, patch: Partial<ComplianceItem>) => Promise<void>;
}

function ComplianceRow({
  item, onUpdate,
}: {
  item: ComplianceItem;
  onUpdate: (patch: Partial<ComplianceItem>) => Promise<void>;
}) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(item.notes ?? '');
  const [saving, setSaving] = useState(false);
  const sm = STATUS_META[item.status];
  const StatusIcon = sm.icon;

  async function toggleChecked() {
    await onUpdate({ is_checked: !item.is_checked });
  }

  async function cycleStatus() {
    const cycle: ComplianceStatus[] = ['compliant', 'warning', 'non_compliant'];
    const next = cycle[(cycle.indexOf(item.status) + 1) % cycle.length];
    await onUpdate({ status: next });
  }

  async function saveNotes() {
    setSaving(true);
    await onUpdate({ notes: notesDraft.trim() || null });
    setSaving(false);
    setEditingNotes(false);
  }

  return (
    <div className={`border border-gray-200 rounded-xl overflow-hidden ${!item.is_checked ? 'opacity-80' : ''}`}>
      <div className="flex items-start gap-3 p-3 bg-white">
        {/* Checkbox */}
        <button
          onClick={toggleChecked}
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
            item.is_checked
              ? 'border-[#1e3a5f] bg-[#1e3a5f]'
              : 'border-gray-300 hover:border-[#1e3a5f]'
          }`}
        >
          {item.is_checked && <Check size={11} className="text-white" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold leading-snug ${item.is_checked ? 'text-[#0d2240]' : 'text-gray-500'}`}>
            {item.title}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{item.description}</p>
          {item.notes && !editingNotes && (
            <p className="text-[10px] text-[#2563eb] mt-1.5 bg-blue-50 rounded-lg px-2 py-1 leading-relaxed">
              Nota: {item.notes}
            </p>
          )}
          {editingNotes && (
            <div className="mt-2 flex gap-2 items-start">
              <textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                rows={2}
                placeholder="Agrega evidencia, enlaces o comentarios..."
                className="flex-1 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] transition-all"
                autoFocus
              />
              <div className="flex flex-col gap-1">
                <button onClick={saveNotes} disabled={saving}
                  className="w-7 h-7 bg-[#1e3a5f] rounded-lg flex items-center justify-center text-white hover:bg-[#0d2240] transition-colors disabled:opacity-50">
                  <Check size={12} />
                </button>
                <button onClick={() => { setEditingNotes(false); setNotesDraft(item.notes ?? ''); }}
                  className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                  <X size={12} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => setEditingNotes(true)}
            className="w-6 h-6 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
            title="Agregar nota"
          >
            <Edit2 size={11} />
          </button>
          <button
            onClick={cycleStatus}
            className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg ${sm.bg} ${sm.color} transition-all hover:opacity-80`}
            title="Cambiar estado"
          >
            <StatusIcon size={11} />
            {sm.label}
          </button>
        </div>
      </div>
    </div>
  );
}

function CategorySection({
  category, items, onUpdate,
}: {
  category: ComplianceCategory;
  items: ComplianceItem[];
  onUpdate: (id: string, patch: Partial<ComplianceItem>) => Promise<void>;
}) {
  const [open, setOpen] = useState(true);
  const meta = CATEGORY_META[category];
  const compliant = items.filter((i) => i.status === 'compliant').length;
  const warnings  = items.filter((i) => i.status === 'warning').length;
  const failing   = items.filter((i) => i.status === 'non_compliant').length;
  const pct = Math.round((compliant / items.length) * 100);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Category header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50/50 transition-colors"
      >
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${meta.color}18` }}>
          <span className="text-xs font-extrabold" style={{ color: meta.color }}>
            {category === 'INTERNA' ? 'INT' : category.slice(0, 3)}
          </span>
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#0d2240]">{meta.label}</span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white" style={{ background: meta.color }}>
              {pct}%
            </span>
          </div>
          <p className="text-[10px] text-gray-400 truncate">{meta.desc}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {compliant > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full font-semibold">
              <CheckCircle2 size={9} />{compliant}
            </span>
          )}
          {warnings > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full font-semibold">
              <AlertTriangle size={9} />{warnings}
            </span>
          )}
          {failing > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full font-semibold">
              <XCircle size={9} />{failing}
            </span>
          )}
          {open ? <ChevronDown size={15} className="text-gray-400" /> : <ChevronRight size={15} className="text-gray-400" />}
        </div>
      </button>

      {/* Progress bar */}
      <div className="px-5 pb-2">
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-1 rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: meta.color }}
          />
        </div>
      </div>

      {/* Items */}
      {open && (
        <div className="px-5 pb-5 space-y-2">
          {items.map((item) => (
            <ComplianceRow
              key={item.id}
              item={item}
              onUpdate={(patch) => onUpdate(item.id, patch)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ComplianceTab({ items, onUpdateItem }: ComplianceTabProps) {
  const categories = ['LGTAIP', 'LGPDPPSO', 'NOM-151', 'MAAGTIC', 'INTERNA'] as ComplianceCategory[];

  const totalCompliant    = items.filter((i) => i.status === 'compliant').length;
  const totalWarning      = items.filter((i) => i.status === 'warning').length;
  const totalNonCompliant = items.filter((i) => i.status === 'non_compliant').length;
  const overallPct        = items.length ? Math.round((totalCompliant / items.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Overall score */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#0d2240]">Nivel de cumplimiento general</h3>
            <p className="text-xs text-gray-400 mt-0.5">{items.length} obligaciones evaluadas</p>
          </div>
          <div className="text-right">
            <span className={`text-3xl font-extrabold ${overallPct >= 70 ? 'text-green-600' : overallPct >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
              {overallPct}%
            </span>
          </div>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex gap-px">
          {totalCompliant > 0 && (
            <div className="h-3 bg-green-500 rounded-l-full transition-all duration-500"
              style={{ width: `${(totalCompliant / items.length) * 100}%` }} />
          )}
          {totalWarning > 0 && (
            <div className="h-3 bg-amber-400 transition-all duration-500"
              style={{ width: `${(totalWarning / items.length) * 100}%` }} />
          )}
          {totalNonCompliant > 0 && (
            <div className="h-3 bg-red-500 rounded-r-full transition-all duration-500"
              style={{ width: `${(totalNonCompliant / items.length) * 100}%` }} />
          )}
        </div>
        <div className="flex gap-4 mt-3">
          {[
            { label: 'Cumple',      count: totalCompliant,    color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'En revisión', count: totalWarning,      color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'No cumple',   count: totalNonCompliant, color: 'text-red-600',   bg: 'bg-red-50'   },
          ].map(({ label, count, color, bg }) => (
            <div key={label} className={`flex-1 text-center ${bg} rounded-xl py-2`}>
              <p className={`text-lg font-extrabold ${color}`}>{count}</p>
              <p className={`text-[10px] font-semibold ${color}`}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Per-framework */}
      {categories.map((cat) => {
        const catItems = items.filter((i) => i.category === cat).sort((a, b) => a.order_index - b.order_index);
        if (!catItems.length) return null;
        return (
          <CategorySection
            key={cat}
            category={cat}
            items={catItems}
            onUpdate={onUpdateItem}
          />
        );
      })}
    </div>
  );
}
