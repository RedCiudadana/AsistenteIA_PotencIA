import { useEffect, useState, useMemo } from 'react';
import {
  Plus, Search, RefreshCw, FileText, GitBranch, X, Bot,
  Lightbulb, Sparkles, ArrowRight,
} from 'lucide-react';
import { supabase, type DocumentTemplate, type WorkflowFlow, type FlowCategory } from '../../lib/supabase';
import FlowsCategorySidebar from './FlowsCategorySidebar';
import TemplateCard from './TemplateCard';
import FlowCard from './FlowCard';
import TemplateModal from './TemplateModal';
import FlowModal from './FlowModal';
import FlowDetailDrawer from './FlowDetailDrawer';
import ConfirmDeleteModal from '../documents/ConfirmDeleteModal';

type Tab = 'templates' | 'flows';

interface FlowsPageProps {
  onGoToAssistant: () => void;
}

const TAB_META = {
  templates: {
    title: 'Formatos',
    subtitle: 'Plantillas con variables',
    tip: 'Escribe tu documento con campos dinámicos como {{nombre}} o {{fecha}} y la IA los rellena automáticamente. Ideal para oficios, informes y contratos.',
    steps: ['Crea el formato con {{variables}}', 'Presiona "Usar con IA"', 'El asistente completa el documento'],
    emptyTitle: 'Aún no tienes formatos',
    emptyDesc: 'Los formatos son plantillas de documentos con campos dinámicos que la IA puede completar automáticamente.',
    emptyExample: 'Ej: Oficio de respuesta, Informe mensual, Circular interna',
  },
  flows: {
    title: 'Flujos',
    subtitle: 'Procesos paso a paso',
    tip: 'Define los pasos de un proceso institucional, asigna responsables y tiempos. La IA puede guiar a tu equipo a través de cada etapa.',
    steps: ['Crea el flujo con sus pasos', 'Asigna responsable y duración', 'Presiona "Iniciar" para activarlo'],
    emptyTitle: 'Aún no tienes flujos',
    emptyDesc: 'Los flujos documentan procesos institucionales de forma secuencial con responsables y tiempos.',
    emptyExample: 'Ej: Alta de proveedor, Proceso de licitación, Solicitud de viáticos',
  },
};

export default function FlowsPage({ onGoToAssistant }: FlowsPageProps) {
  const [tab, setTab] = useState<Tab>('templates');
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [flows, setFlows] = useState<WorkflowFlow[]>([]);
  const [categories, setCategories] = useState<FlowCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [tipDismissed, setTipDismissed] = useState(false);

  const [tplModal, setTplModal] = useState<{ open: boolean; editing: DocumentTemplate | null }>({ open: false, editing: null });
  const [flowModal, setFlowModal] = useState<{ open: boolean; editing: WorkflowFlow | null }>({ open: false, editing: null });
  const [detailFlow, setDetailFlow] = useState<WorkflowFlow | null>(null);
  const [deleteTpl, setDeleteTpl] = useState<DocumentTemplate | null>(null);
  const [deletingFlow, setDeletingFlow] = useState<WorkflowFlow | null>(null);

  const [toast, setToast] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function loadData() {
    setLoading(true);
    setError('');
    const [catsRes, tplsRes, flowsRes] = await Promise.all([
      supabase.from('flow_categories').select('*').order('name'),
      supabase.from('document_templates').select('*, flow_categories(*)').order('created_at', { ascending: false }),
      supabase.from('workflow_flows').select('*, flow_categories(*)').order('created_at', { ascending: false }),
    ]);
    if (catsRes.error || tplsRes.error || flowsRes.error) {
      setError('No se pudo cargar la información. Intenta de nuevo.');
    } else {
      setCategories(catsRes.data ?? []);
      setTemplates((tplsRes.data ?? []) as DocumentTemplate[]);
      setFlows((flowsRes.data ?? []) as WorkflowFlow[]);
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);
  useEffect(() => { setSelectedCategory(null); setSearch(''); setTipDismissed(false); }, [tab]);

  const templateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    templates.forEach((t) => { if (t.category_id) counts[t.category_id] = (counts[t.category_id] ?? 0) + 1; });
    return counts;
  }, [templates]);

  const flowCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    flows.forEach((f) => { if (f.category_id) counts[f.category_id] = (counts[f.category_id] ?? 0) + 1; });
    return counts;
  }, [flows]);

  const filteredTemplates = useMemo(() => templates.filter((t) => {
    if (selectedCategory && t.category_id !== selectedCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return t.title.toLowerCase().includes(q) || (t.description ?? '').toLowerCase().includes(q) || t.tags.some((x) => x.toLowerCase().includes(q));
    }
    return true;
  }), [templates, selectedCategory, search]);

  const filteredFlows = useMemo(() => flows.filter((f) => {
    if (selectedCategory && f.category_id !== selectedCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return f.title.toLowerCase().includes(q) || (f.description ?? '').toLowerCase().includes(q) || f.tags.some((x) => x.toLowerCase().includes(q));
    }
    return true;
  }), [flows, selectedCategory, search]);

  async function saveTemplate(data: Partial<DocumentTemplate>) {
    if (tplModal.editing) {
      const { error } = await supabase.from('document_templates').update(data).eq('id', tplModal.editing.id);
      if (error) throw error;
      showToast('Formato actualizado.');
    } else {
      const { error } = await supabase.from('document_templates').insert({ ...data, is_system: false });
      if (error) throw error;
      showToast('Formato creado.');
    }
    await loadData();
  }

  async function duplicateTemplate(tpl: DocumentTemplate) {
    const { error } = await supabase.from('document_templates').insert({
      title: `${tpl.title} (copia)`, description: tpl.description, category_id: tpl.category_id,
      content: tpl.content, placeholders: tpl.placeholders, tags: tpl.tags, is_system: false,
    });
    if (error) { showToast('Error al duplicar.'); return; }
    showToast('Formato duplicado.');
    await loadData();
  }

  async function deleteTemplate() {
    if (!deleteTpl) return;
    const { error } = await supabase.from('document_templates').delete().eq('id', deleteTpl.id);
    if (error) throw error;
    showToast('Formato eliminado.');
    await loadData();
  }

  async function useTemplate(tpl: DocumentTemplate) {
    await supabase.from('document_templates').update({ usage_count: tpl.usage_count + 1 }).eq('id', tpl.id);
    onGoToAssistant();
  }

  async function saveFlow(data: Partial<WorkflowFlow>) {
    if (flowModal.editing) {
      const { error } = await supabase.from('workflow_flows').update(data).eq('id', flowModal.editing.id);
      if (error) throw error;
      showToast('Flujo actualizado.');
    } else {
      const { error } = await supabase.from('workflow_flows').insert(data);
      if (error) throw error;
      showToast('Flujo creado.');
    }
    await loadData();
  }

  async function confirmDeleteFlow() {
    if (!deletingFlow) return;
    const { error } = await supabase.from('workflow_flows').delete().eq('id', deletingFlow.id);
    if (error) throw error;
    showToast('Flujo eliminado.');
    await loadData();
  }

  async function toggleArchiveFlow(flow: WorkflowFlow) {
    const newStatus = flow.status === 'archived' ? 'active' : 'archived';
    const { error } = await supabase.from('workflow_flows').update({ status: newStatus }).eq('id', flow.id);
    if (error) { showToast('Error al cambiar estado.'); return; }
    showToast(newStatus === 'archived' ? 'Flujo archivado.' : 'Flujo activado.');
    await loadData();
  }

  async function useFlow(flow: WorkflowFlow) {
    await supabase.from('workflow_flows').update({ usage_count: flow.usage_count + 1 }).eq('id', flow.id);
    onGoToAssistant();
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#1e3a5f] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Cargando flujos y formatos...</p>
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

  const isTpl = tab === 'templates';
  const meta  = TAB_META[tab];

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0 p-5 gap-4">
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
          {(['templates', 'flows'] as const).map((t) => {
            const isActive = tab === t;
            const m = TAB_META[t];
            const count = t === 'templates' ? templates.length : flows.length;
            const Icon = t === 'templates' ? FileText : GitBranch;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg transition-all ${
                  isActive ? 'bg-[#1e3a5f] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={15} className={isActive ? 'text-[#60a5fa]' : 'text-gray-400'} />
                <div className="text-left">
                  <p className={`text-xs font-bold leading-none ${isActive ? 'text-white' : 'text-gray-700'}`}>
                    {m.title}
                  </p>
                  <p className={`text-[10px] leading-none mt-0.5 ${isActive ? 'text-white/60' : 'text-gray-400'}`}>
                    {m.subtitle}
                  </p>
                </div>
                <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-bold ml-0.5 ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => isTpl ? setTplModal({ open: true, editing: null }) : setFlowModal({ open: true, editing: null })}
          className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#0d2240] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all hover:shadow-md"
        >
          <Plus size={16} />
          {isTpl ? 'Nuevo formato' : 'Nuevo flujo'}
        </button>
      </div>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 gap-4 overflow-hidden min-h-0">
        <FlowsCategorySidebar
          categories={categories}
          counts={isTpl ? templateCounts : flowCounts}
          totalCount={isTpl ? templates.length : flows.length}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
          onAdd={() => {}}
          tab={tab}
        />

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Tip banner */}
          {!tipDismissed && (
            <div className="mb-3 flex-shrink-0 bg-[#eff6ff] border border-blue-100 rounded-2xl px-4 py-3 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#2563eb]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Lightbulb size={14} className="text-[#2563eb]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#1e3a5f] mb-1.5">{meta.tip}</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {meta.steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-[#2563eb]/15 text-[#2563eb] text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-[10px] text-blue-700">{step}</span>
                      {i < meta.steps.length - 1 && (
                        <ArrowRight size={9} className="text-blue-300 flex-shrink-0 ml-0.5" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => setTipDismissed(true)} className="text-blue-300 hover:text-blue-500 transition-colors flex-shrink-0 mt-0.5">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Search */}
          <div className="relative mb-3 flex-shrink-0">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isTpl ? 'Buscar por nombre, descripción o etiqueta...' : 'Buscar flujos...'}
              className="w-full pl-9 pr-9 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Results header */}
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <p className="text-xs font-semibold text-gray-500">
              {isTpl
                ? `${filteredTemplates.length} formato${filteredTemplates.length !== 1 ? 's' : ''}`
                : `${filteredFlows.length} flujo${filteredFlows.length !== 1 ? 's' : ''}`}
              {selectedCategory && ` en "${categories.find((c) => c.id === selectedCategory)?.name}"`}
            </p>
            {(search || selectedCategory) && (
              <button onClick={() => { setSearch(''); setSelectedCategory(null); }}
                className="text-xs text-[#2563eb] hover:underline font-medium">
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto">
            {isTpl ? (
              filteredTemplates.length === 0 ? (
                <EmptyState type="templates" meta={meta} onAdd={() => setTplModal({ open: true, editing: null })} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
                  {filteredTemplates.map((tpl) => (
                    <TemplateCard key={tpl.id} tpl={tpl} categories={categories}
                      onEdit={(t) => setTplModal({ open: true, editing: t })}
                      onDelete={setDeleteTpl}
                      onDuplicate={duplicateTemplate}
                      onUse={useTemplate}
                    />
                  ))}
                </div>
              )
            ) : (
              filteredFlows.length === 0 ? (
                <EmptyState type="flows" meta={meta} onAdd={() => setFlowModal({ open: true, editing: null })} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
                  {filteredFlows.map((flow) => (
                    <FlowCard key={flow.id} flow={flow} categories={categories}
                      onEdit={(f) => setFlowModal({ open: true, editing: f })}
                      onDelete={(f) => setDeletingFlow(f)}
                      onArchive={toggleArchiveFlow}
                      onView={setDetailFlow}
                      onUse={useFlow}
                    />
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {tplModal.open && (
        <TemplateModal initial={tplModal.editing} categories={categories}
          onSave={saveTemplate} onClose={() => setTplModal({ open: false, editing: null })} />
      )}
      {flowModal.open && (
        <FlowModal initial={flowModal.editing} categories={categories}
          onSave={saveFlow} onClose={() => setFlowModal({ open: false, editing: null })} />
      )}
      {detailFlow && (
        <FlowDetailDrawer flow={detailFlow} categories={categories}
          onClose={() => setDetailFlow(null)}
          onUse={() => useFlow(detailFlow)}
          onEdit={() => { setFlowModal({ open: true, editing: detailFlow }); setDetailFlow(null); }}
        />
      )}
      {deleteTpl && (
        <ConfirmDeleteModal itemName={deleteTpl.title} itemType="documento"
          onConfirm={deleteTemplate} onClose={() => setDeleteTpl(null)} />
      )}
      {deletingFlow && (
        <ConfirmDeleteModal itemName={deletingFlow.title} itemType="documento"
          onConfirm={confirmDeleteFlow} onClose={() => setDeletingFlow(null)} />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0d2240] text-white text-sm font-medium px-5 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <Bot size={15} className="text-[#22c55e]" />
          {toast}
        </div>
      )}
    </div>
  );
}

function EmptyState({
  type, meta, onAdd,
}: {
  type: 'templates' | 'flows';
  meta: typeof TAB_META['templates'];
  onAdd: () => void;
}) {
  const Icon = type === 'templates' ? FileText : GitBranch;

  return (
    <div className="flex flex-col items-center justify-center min-h-[360px] text-center px-4">
      <div className="relative mb-5">
        <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center">
          <Icon size={32} className="text-gray-300" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#dbeafe] rounded-full flex items-center justify-center">
          <Sparkles size={14} className="text-[#2563eb]" />
        </div>
      </div>

      <h3 className="text-base font-bold text-[#0d2240] mb-1">{meta.emptyTitle}</h3>
      <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-1">{meta.emptyDesc}</p>
      <p className="text-xs text-gray-400 mb-6">{meta.emptyExample}</p>

      <div className="flex items-center gap-2 mb-6 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 flex-wrap justify-center">
        {meta.steps.map((step, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-[#1e3a5f] text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </div>
              <span className="text-xs text-gray-600 whitespace-nowrap">{step}</span>
            </div>
            {i < meta.steps.length - 1 && (
              <ArrowRight size={12} className="text-gray-300 flex-shrink-0 mx-1" />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={onAdd}
        className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#0d2240] text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all hover:shadow-md"
      >
        <Plus size={16} />
        {type === 'templates' ? 'Crear primer formato' : 'Crear primer flujo'}
      </button>
    </div>
  );
}
