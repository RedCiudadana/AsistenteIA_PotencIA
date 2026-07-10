import { supabase } from './supabase';
import type { DocSource } from '../components/ChatMessage';

// Common Spanish stopwords to skip in keyword matching (too generic to be meaningful)
const STOPWORDS = new Set([
  'para', 'como', 'este', 'esta', 'estos', 'estas', 'pero', 'desde', 'hasta',
  'entre', 'sobre', 'ante', 'bajo', 'tras', 'donde', 'cuando', 'porque',
  'aunque', 'sino', 'pues', 'cada', 'todo', 'toda', 'todos', 'todas',
  'otro', 'otra', 'otros', 'otras', 'mismo', 'misma', 'dicho', 'dicha',
]);

export interface DocContextResult {
  context: string;
  sources: DocSource[];
  hasIndexedContent: boolean;
}

export async function fetchDocumentContext(query: string): Promise<DocContextResult> {
  const { data } = await supabase
    .from('documents')
    .select('name, ext, description, content, tags')
    .eq('status', 'active');

  if (!data?.length) return { context: '', sources: [], hasIndexedContent: false };

  // Words of 3+ chars that are not stopwords
  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));

  if (!queryWords.length) return { context: '', sources: [], hasIndexedContent: false };

  const scored = data
    .map((doc) => {
      // Concatenate all searchable text
      const searchableText = [doc.name, doc.description, doc.content, ...(doc.tags ?? [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      // Count matching keywords
      const score = queryWords.reduce((s, w) => s + (searchableText.includes(w) ? 1 : 0), 0);

      // A document with no content and no description is useless as context
      const hasUsableContent = !!(doc.content?.trim() || doc.description?.trim());

      return { ...doc, score, hasUsableContent };
    })
    .filter((d) => d.score > 0)
    .sort((a, b) => {
      // Prefer docs with actual content over description-only docs
      if (b.hasUsableContent !== a.hasUsableContent) return a.hasUsableContent ? -1 : 1;
      return b.score - a.score;
    })
    .slice(0, 3);

  if (!scored.length) return { context: '', sources: [], hasIndexedContent: false };

  // Build context string; only docs with actual text content count as "indexed"
  let hasIndexedContent = false;

  const context = scored
    .map((doc) => {
      if (doc.content?.trim()) {
        hasIndexedContent = true;
        const body = doc.content.slice(0, 3000);
        return `=== Documento: "${doc.name}" ===\n${body}`;
      } else {
        // No content — include all available metadata so the AI can at least name the document
        const meta: string[] = [];
        if (doc.description?.trim()) meta.push(`Descripción: ${doc.description}`);
        if (doc.tags?.length) meta.push(`Etiquetas: ${doc.tags.join(', ')}`);
        meta.push('ESTADO: Solo metadatos — texto completo no indexado todavía.');
        return `=== Documento registrado (sin texto): "${doc.name}" ===\n${meta.join('\n')}`;
      }
    })
    .filter(Boolean)
    .join('\n\n');

  if (!context) return { context: '', sources: [], hasIndexedContent: false };

  const sources: DocSource[] = scored
    .filter((d) => d.content?.trim() || d.description?.trim())
    .map((doc) => ({
      name: doc.name,
      ext: doc.ext ?? 'pdf',
      excerpt: doc.content?.slice(0, 600) ?? doc.description ?? '[Sin extracto disponible]',
    }));

  return { context, sources, hasIndexedContent };
}
