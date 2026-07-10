import { useEffect, useState, useMemo } from 'react';
import {
  Plus, Search, LayoutGrid, List, RefreshCw,
  FileText, Filter, Bot, X,
} from 'lucide-react';
import { supabase, type Document, type Category } from '../../lib/supabase';
import CategorySidebar from './CategorySidebar';
import { DocumentCard, DocumentTable } from './DocumentViews';
import CategoryModal from './CategoryModal';
import DocumentModal from './DocumentModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';

type ViewMode = 'grid' | 'list';
type StatusFilter = 'all' | 'active' | 'archived';

interface DocumentsPageProps {
  onGoToAssistant: () => void;
}

export default function DocumentsPage({ onGoToAssistant }: DocumentsPageProps) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Modal state
  const [categoryModal, setCategoryModal] = useState<{ open: boolean; editing: Category | null }>({ open: false, editing: null });
  const [docModal, setDocModal] = useState<{ open: boolean; editing: Document | null }>({ open: false, editing: null });
  const [deleteDoc, setDeleteDoc] = useState<Document | null>(null);
  const [deleteCat, setDeleteCat] = useState<Category | null>(null);

  // Toast
  const [toast, setToast] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  // ── Data loading ─────────────────────────────────────────────────────────────
  async function loadData() {
    setLoading(true);
    setError('');
    const [{ data: cats, error: catErr }, { data: docData, error: docErr }] = await Promise.all([
      supabase.from('document_categories').select('*').order('name'),
      supabase
        .from('documents')
        .select('*, document_categories(*)')
        .order('created_at', { ascending: false }),
    ]);

    if (catErr || docErr) {
      setError('No se pudo cargar la información. Intenta de nuevo.');
    } else {
      setCategories(cats ?? []);
      setDocs((docData as Document[]) ?? []);
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  // ── Derived data ─────────────────────────────────────────────────────────────
  const docCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const d of docs) {
      if (d.category_id) counts[d.category_id] = (counts[d.category_id] ?? 0) + 1;
    }
    return counts;
  }, [docs]);

  const filtered = useMemo(() => {
    return docs.filter((d) => {
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      if (selectedCategory !== null && d.category_id !== selectedCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          d.name.toLowerCase().includes(q) ||
          (d.description ?? '').toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [docs, selectedCategory, statusFilter, search]);

  // ── Category CRUD ─────────────────────────────────────────────────────────────
  async function saveCategory(data: { name: string; color: string; description: string }) {
    if (categoryModal.editing) {
      const { error } = await supabase
        .from('document_categories')
        .update(data)
        .eq('id', categoryModal.editing.id);
      if (error) throw error;
      showToast('Categoría actualizada.');
    } else {
      const { error } = await supabase.from('document_categories').insert(data);
      if (error) throw error;
      showToast('Categoría creada.');
    }
    await loadData();
  }

  async function deleteCategory() {
    if (!deleteCat) return;
    const { error } = await supabase
      .from('document_categories')
      .delete()
      .eq('id', deleteCat.id);
    if (error) throw error;
    if (selectedCategory === deleteCat.id) setSelectedCategory(null);
    showToast('Categoría eliminada. Los documentos quedan sin categoría.');
    await loadData();
  }

  // ── Document CRUD ─────────────────────────────────────────────────────────────
  async function saveDocument(data: Partial<Document>) {
    if (docModal.editing) {
      const { error } = await supabase
        .from('documents')
        .update(data)
        .eq('id', docModal.editing.id);
      if (error) throw error;
      showToast('Documento actualizado.');
    } else {
      const { error } = await supabase.from('documents').insert({ ...data, status: 'active' });
      if (error) throw error;
      showToast('Documento agregado.');
    }
    await loadData();
  }

  async function deleteDocument() {
    if (!deleteDoc) return;
    const { error } = await supabase.from('documents').delete().eq('id', deleteDoc.id);
    if (error) throw error;
    showToast('Documento eliminado.');
    await loadData();
  }

  async function toggleArchive(doc: Document) {
    const newStatus = doc.status === 'active' ? 'archived' : 'active';
    const { error } = await supabase.from('documents').update({ status: newStatus }).eq('id', doc.id);
    if (error) { showToast('Error al cambiar estado.'); return; }
    showToast(newStatus === 'archived' ? 'Documento archivado.' : 'Documento activado.');
    await loadData();
  }

  // ── Loading / Error states ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#1e3a5f] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Cargando documentos...</p>
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
    <div className="flex-1 flex gap-5 p-5 overflow-hidden min-h-0">
      {/* Category sidebar */}
      <CategorySidebar
        categories={categories}
        docCounts={docCounts}
        totalCount={docs.filter((d) => statusFilter === 'all' || d.status === statusFilter).length}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
        onAdd={() => setCategoryModal({ open: true, editing: null })}
        onEdit={(cat) => setCategoryModal({ open: true, editing: cat })}
        onDelete={(cat) => setDeleteCat(cat)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, descripción o etiqueta..."
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all placeholder:text-gray-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 text-xs font-medium">
            {(['all', 'active', 'archived'] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === s ? 'bg-[#1e3a5f] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {s === 'all' ? 'Todos' : s === 'active' ? 'Activos' : 'Archivados'}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#1e3a5f] text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#1e3a5f] text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List size={15} />
            </button>
          </div>

          {/* Add document */}
          <button
            onClick={() => setDocModal({ open: true, editing: null })}
            className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#0d2240] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all hover:shadow-md"
          >
            <Plus size={16} />
            Agregar documento
          </button>
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-[#0d2240]">
              {selectedCategory
                ? categories.find((c) => c.id === selectedCategory)?.name ?? 'Categoría'
                : 'Todos los documentos'}
            </p>
            <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 font-semibold">
              {filtered.length}
            </span>
          </div>
          {(search || selectedCategory) && (
            <button
              onClick={() => { setSearch(''); setSelectedCategory(null); }}
              className="text-xs text-[#2563eb] hover:underline flex items-center gap-1"
            >
              <Filter size={12} /> Limpiar filtros
            </button>
          )}
        </div>

        {/* Document list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                <FileText size={24} className="text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-500">No se encontraron documentos</p>
              <p className="text-xs text-gray-400 mt-1">
                {search ? 'Intenta con otros términos de búsqueda.' : 'Agrega tu primer documento con el botón de arriba.'}
              </p>
              {!search && (
                <button
                  onClick={() => setDocModal({ open: true, editing: null })}
                  className="mt-4 flex items-center gap-1.5 text-xs text-[#2563eb] hover:underline font-medium"
                >
                  <Plus size={13} /> Agregar documento
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
              {filtered.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  categories={categories}
                  onEdit={(d) => setDocModal({ open: true, editing: d })}
                  onDelete={setDeleteDoc}
                  onArchive={toggleArchive}
                  onUseInAssistant={() => onGoToAssistant()}
                />
              ))}
            </div>
          ) : (
            <div className="pb-4">
              <DocumentTable
                docs={filtered}
                categories={categories}
                onEdit={(d) => setDocModal({ open: true, editing: d })}
                onDelete={setDeleteDoc}
                onArchive={toggleArchive}
                onUseInAssistant={() => onGoToAssistant()}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {categoryModal.open && (
        <CategoryModal
          initial={categoryModal.editing}
          onSave={saveCategory}
          onClose={() => setCategoryModal({ open: false, editing: null })}
        />
      )}

      {docModal.open && (
        <DocumentModal
          initial={docModal.editing}
          categories={categories}
          onSave={saveDocument}
          onClose={() => setDocModal({ open: false, editing: null })}
        />
      )}

      {deleteDoc && (
        <ConfirmDeleteModal
          itemName={deleteDoc.name}
          itemType="documento"
          onConfirm={deleteDocument}
          onClose={() => setDeleteDoc(null)}
        />
      )}

      {deleteCat && (
        <ConfirmDeleteModal
          itemName={deleteCat.name}
          itemType="categoría"
          warningNote="Los documentos de esta categoría quedarán sin categoría asignada. No se eliminarán."
          onConfirm={deleteCategory}
          onClose={() => setDeleteCat(null)}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0d2240] text-white text-sm font-medium px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
          <Bot size={15} className="text-[#22c55e]" />
          {toast}
        </div>
      )}
    </div>
  );
}
