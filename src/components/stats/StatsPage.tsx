import { useEffect, useState, useMemo } from 'react';
import {
  Bot, FileText, GitBranch, LayoutGrid, TrendingUp,
  RefreshCw, Calendar, Zap, Clock, Activity,
} from 'lucide-react';
import { supabase, type ActivityEvent, type EventType } from '../../lib/supabase';
import { DonutChart, ActivityBarChart, HBar } from './Charts';

const EVENT_CONFIG: Record<EventType, { label: string; color: string; icon: typeof Bot }> = {
  ai_query:         { label: 'Consulta IA',       color: '#2563eb', icon: Bot       },
  template_used:    { label: 'Formato usado',      color: '#7c3aed', icon: FileText  },
  flow_started:     { label: 'Flujo iniciado',     color: '#0d9488', icon: GitBranch },
  doc_added:        { label: 'Documento agregado', color: '#059669', icon: LayoutGrid },
  doc_archived:     { label: 'Doc. archivado',     color: '#94a3b8', icon: LayoutGrid },
  doc_updated:      { label: 'Doc. actualizado',   color: '#0891b2', icon: LayoutGrid },
  template_created: { label: 'Formato creado',     color: '#d97706', icon: FileText  },
  flow_created:     { label: 'Flujo creado',       color: '#dc2626', icon: GitBranch },
};

const MAIN_EVENT_TYPES: EventType[] = ['ai_query','template_used','flow_started','doc_added'];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-GT', { day: 'numeric', month: 'short' });
}

interface KpiCardProps {
  icon: typeof Bot;
  label: string;
  value: number | string;
  sub?: string;
  color?: string;
  trend?: number;
}

function KpiCard({ icon: Icon, label, value, sub, color = '#2563eb', trend }: KpiCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={20} style={{ color }} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-bold flex items-center gap-0.5 ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            <TrendingUp size={12} className={trend < 0 ? 'rotate-180' : ''} />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-extrabold text-[#0d2240] leading-none">{value}</p>
        <p className="text-xs font-semibold text-gray-500 mt-1">{label}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-bold text-[#0d2240]">{title}</h2>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

interface DocTypeCount  { ext: string; count: number }
interface DocCatCount   { name: string; color: string; count: number }
interface TplUsage      { title: string; usage_count: number }
interface FlowUsage     { title: string; usage_count: number; status: string }

interface StatsData {
  events: ActivityEvent[];
  prevEvents: ActivityEvent[];
  docTotal: number;
  docActive: number;
  docsByType: DocTypeCount[];
  docsByCategory: DocCatCount[];
  tplTotal: number;
  topTemplates: TplUsage[];
  flowTotal: number;
  topFlows: FlowUsage[];
}

export default function StatsPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState<7 | 14 | 30>(30);

  async function loadData() {
    setLoading(true);
    setError('');

    const since = new Date();
    since.setDate(since.getDate() - range);

    const prevSince = new Date();
    prevSince.setDate(prevSince.getDate() - range * 2);

    const [evtsRes, prevEvtsRes, docsRes, tplsRes, flowsRes, catsRes] = await Promise.all([
      supabase
        .from('activity_events')
        .select('*')
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false }),
      supabase
        .from('activity_events')
        .select('event_type')
        .gte('created_at', prevSince.toISOString())
        .lt('created_at', since.toISOString()),
      supabase.from('documents').select('id, ext, status, category_id'),
      supabase.from('document_templates').select('title, usage_count').order('usage_count', { ascending: false }).limit(6),
      supabase.from('workflow_flows').select('title, usage_count, status').order('usage_count', { ascending: false }).limit(6),
      supabase.from('document_categories').select('id, name, color'),
    ]);

    if (evtsRes.error || docsRes.error || tplsRes.error || flowsRes.error || catsRes.error) {
      setError('No se pudo cargar la información.');
      setLoading(false);
      return;
    }

    const docs = docsRes.data ?? [];
    const cats = catsRes.data ?? [];

    // Docs by type
    const typeMap: Record<string, number> = {};
    for (const d of docs) typeMap[d.ext] = (typeMap[d.ext] ?? 0) + 1;
    const docsByType: DocTypeCount[] = Object.entries(typeMap).map(([ext, count]) => ({ ext, count }));

    // Docs by category
    const catCountMap: Record<string, number> = {};
    for (const d of docs) if (d.category_id) catCountMap[d.category_id] = (catCountMap[d.category_id] ?? 0) + 1;
    const docsByCategory: DocCatCount[] = cats
      .filter((c) => catCountMap[c.id])
      .map((c) => ({ name: c.name, color: c.color, count: catCountMap[c.id] ?? 0 }))
      .sort((a, b) => b.count - a.count);

    setData({
      events:         (evtsRes.data ?? []) as ActivityEvent[],
      prevEvents:     (prevEvtsRes.data ?? []) as ActivityEvent[],
      docTotal:       docs.length,
      docActive:      docs.filter((d) => d.status === 'active').length,
      docsByType,
      docsByCategory,
      tplTotal:       tplsRes.data?.length ?? 0,
      topTemplates:   (tplsRes.data ?? []) as TplUsage[],
      flowTotal:      flowsRes.data?.length ?? 0,
      topFlows:       (flowsRes.data ?? []) as FlowUsage[],
    });
    setLoading(false);
  }

  useEffect(() => { loadData(); }, [range]);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const eventCounts = useMemo(() => {
    if (!data) return {} as Record<EventType, number>;
    const c: Partial<Record<EventType, number>> = {};
    for (const e of data.events) c[e.event_type] = (c[e.event_type] ?? 0) + 1;
    return c as Record<EventType, number>;
  }, [data]);

  const prevEventCounts = useMemo(() => {
    if (!data) return {} as Record<EventType, number>;
    const c: Partial<Record<EventType, number>> = {};
    for (const e of data.prevEvents) c[e.event_type] = (c[e.event_type] ?? 0) + 1;
    return c as Record<EventType, number>;
  }, [data]);

  function calcTrend(type: EventType): number | undefined {
    const curr = eventCounts[type] ?? 0;
    const prev = prevEventCounts[type] ?? 0;
    if (prev === 0) return undefined;
    return Math.round(((curr - prev) / prev) * 100);
  }

  // Build day-by-day bars for the last `range` days
  const activityBars = useMemo(() => {
    if (!data) return [];
    const today = new Date();
    const bars = [];
    for (let d = range - 1; d >= 0; d--) {
      const day = new Date(today);
      day.setDate(day.getDate() - d);
      const key = day.toISOString().slice(0, 10);
      const dayEvents = data.events.filter((e) => e.created_at.slice(0, 10) === key);
      bars.push({
        date: dayLabel(key),
        values: MAIN_EVENT_TYPES.map((type) => ({
          count: dayEvents.filter((e) => e.event_type === type).length,
          color: EVENT_CONFIG[type].color,
        })),
      });
    }
    return bars;
  }, [data, range]);

  const maxBarValue = useMemo(
    () => Math.max(...activityBars.map((b) => b.values.reduce((s, v) => s + v.count, 0)), 1),
    [activityBars],
  );

  const totalEvents = data?.events.length ?? 0;

  const docTypeColors: Record<string, string> = {
    pdf: '#ef4444', docx: '#2563eb', xlsx: '#22c55e', txt: '#94a3b8',
  };

  const tplMax = Math.max(...(data?.topTemplates.map((t) => t.usage_count) ?? [1]), 1);
  const flowMax = Math.max(...(data?.topFlows.map((f) => f.usage_count) ?? [1]), 1);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#1e3a5f] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Cargando estadísticas...</p>
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
    <div className="flex-1 overflow-y-auto p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold text-[#0d2240]">Estadísticas de uso</h1>
          <p className="text-xs text-gray-400 mt-0.5">Actividad de la plataforma Red Ciudadana</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Range selector */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            {([7, 14, 30] as const).map((r) => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  range === r ? 'bg-[#1e3a5f] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {r}d
              </button>
            ))}
          </div>
          <button onClick={loadData}
            className="w-9 h-9 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-[#1e3a5f] hover:border-[#1e3a5f] transition-all shadow-sm">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Bot}       label="Consultas IA"      value={eventCounts.ai_query ?? 0}
          sub={`últimos ${range} días`} color="#2563eb" trend={calcTrend('ai_query')} />
        <KpiCard icon={FileText}  label="Documentos activos" value={data?.docActive ?? 0}
          sub={`${data?.docTotal ?? 0} en total`} color="#059669" />
        <KpiCard icon={FileText}  label="Formatos usados"   value={eventCounts.template_used ?? 0}
          sub={`${data?.tplTotal ?? 0} disponibles`} color="#7c3aed" trend={calcTrend('template_used')} />
        <KpiCard icon={GitBranch} label="Flujos iniciados"  value={eventCounts.flow_started ?? 0}
          sub={`${data?.flowTotal ?? 0} flujos activos`} color="#0d9488" trend={calcTrend('flow_started')} />
      </div>

      {/* Activity chart + event breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity over time */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#0d2240]">Actividad diaria</h2>
              <p className="text-xs text-gray-400">{totalEvents} eventos en {range} días</p>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-3">
              {MAIN_EVENT_TYPES.map((t) => (
                <span key={t} className="flex items-center gap-1 text-[10px] text-gray-500">
                  <span className="w-2 h-2 rounded-sm" style={{ background: EVENT_CONFIG[t].color }} />
                  {EVENT_CONFIG[t].label}
                </span>
              ))}
            </div>
          </div>
          <ActivityBarChart days={activityBars} maxValue={maxBarValue} height={100} />
          {/* Date labels */}
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-gray-400">{activityBars[0]?.date}</span>
            <span className="text-[10px] text-gray-400">{activityBars[Math.floor(activityBars.length / 2)]?.date}</span>
            <span className="text-[10px] text-gray-400">{activityBars[activityBars.length - 1]?.date}</span>
          </div>
        </div>

        {/* Event type breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <SectionTitle title="Por tipo de evento" sub={`${totalEvents} total`} />
          <div className="space-y-3">
            {Object.entries(EVENT_CONFIG)
              .filter(([type]) => (eventCounts[type as EventType] ?? 0) > 0)
              .sort(([a], [b]) => (eventCounts[b as EventType] ?? 0) - (eventCounts[a as EventType] ?? 0))
              .map(([type, cfg]) => {
                const count = eventCounts[type as EventType] ?? 0;
                const pct = totalEvents > 0 ? Math.round((count / totalEvents) * 100) : 0;
                return (
                  <div key={type} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                    <span className="text-xs text-gray-600 flex-1">{cfg.label}</span>
                    <span className="text-xs text-gray-400">{pct}%</span>
                    <span className="text-xs font-bold text-gray-700 w-8 text-right">{count}</span>
                  </div>
                );
              })}
            {totalEvents === 0 && <p className="text-xs text-gray-400 text-center py-4">Sin actividad en este período.</p>}
          </div>
        </div>
      </div>

      {/* Docs + Templates + Flows row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Docs by type donut */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <SectionTitle title="Documentos por tipo" sub={`${data?.docTotal ?? 0} documentos`} />
          <DonutChart
            slices={(data?.docsByType ?? []).map((d) => ({
              value: d.count,
              color: docTypeColors[d.ext] ?? '#94a3b8',
              label: `.${d.ext.toUpperCase()}`,
            }))}
            size={130}
            thickness={22}
            centerLabel={String(data?.docTotal ?? 0)}
            centerSub="docs"
          />
        </div>

        {/* Docs by category */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <SectionTitle title="Documentos por categoría" />
          {(data?.docsByCategory ?? []).length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">Sin datos de categoría.</p>
          ) : (
            <DonutChart
              slices={(data?.docsByCategory ?? []).map((c) => ({
                value: c.count, color: c.color, label: c.name,
              }))}
              size={130}
              thickness={22}
              centerLabel={String(data?.docsByCategory.reduce((s, c) => s + c.count, 0) ?? 0)}
              centerSub="categorizados"
            />
          )}
        </div>

        {/* Summary tiles */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3">
          <SectionTitle title="Resumen del período" sub={`últimos ${range} días`} />
          {[
            { icon: Zap,      label: 'Promedio diario IA',    value: `${Math.round((eventCounts.ai_query ?? 0) / range)} / día`,    color: '#2563eb' },
            { icon: Clock,    label: 'Docs más activo/semana', value: `${Math.round((data?.docActive ?? 0) / (range / 7))} docs`,   color: '#059669' },
            { icon: Activity, label: 'Tasa de uso de formatos', value: `${Math.round((eventCounts.template_used ?? 0) / range * 7)} / sem`, color: '#7c3aed' },
            { icon: Calendar, label: 'Días con actividad',    value: `${activityBars.filter((b) => b.values.some((v) => v.count > 0)).length} días`, color: '#0d9488' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
                <Icon size={15} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-400 leading-none">{label}</p>
                <p className="text-sm font-bold text-[#0d2240] mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Templates + Flows usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top templates */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <SectionTitle title="Formatos más utilizados" sub="por conteo de uso acumulado" />
          <div className="space-y-3">
            {(data?.topTemplates ?? []).length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Sin datos.</p>
            ) : (data?.topTemplates ?? []).map((t) => (
              <HBar key={t.title} label={t.title} value={t.usage_count} max={tplMax}
                color="#7c3aed" sublabel={`${t.usage_count} usos`} />
            ))}
          </div>
        </div>

        {/* Top flows */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <SectionTitle title="Flujos más activos" sub="por conteo de usos iniciados" />
          <div className="space-y-3">
            {(data?.topFlows ?? []).length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Sin datos.</p>
            ) : (data?.topFlows ?? []).map((f) => (
              <HBar key={f.title} label={f.title} value={f.usage_count} max={flowMax}
                color="#0d9488" sublabel={f.status === 'active' ? 'Activo' : f.status} />
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity feed */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <SectionTitle title="Actividad reciente" sub={`Últimas ${Math.min((data?.events.length ?? 0), 12)} acciones`} />
        </div>
        <div className="space-y-2">
          {(data?.events.slice(0, 12) ?? []).map((evt) => {
            const cfg = EVENT_CONFIG[evt.event_type];
            const Icon = cfg.icon;
            return (
              <div key={evt.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${cfg.color}18` }}>
                  <Icon size={13} style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#0d2240] truncate">{evt.label}</p>
                  <p className="text-[10px] text-gray-400">{cfg.label}</p>
                </div>
                <span className="text-[10px] text-gray-400 flex-shrink-0">{fmtDate(evt.created_at)}</span>
              </div>
            );
          })}
          {(data?.events.length ?? 0) === 0 && (
            <p className="text-xs text-gray-400 text-center py-6">Sin actividad en este período.</p>
          )}
        </div>
      </div>

      {/* Bottom padding */}
      <div className="h-2" />
    </div>
  );
}
