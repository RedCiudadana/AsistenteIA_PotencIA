import { supabase } from './supabase';
import type { DocSource } from '../components/ChatMessage';

const STOPWORDS = new Set([
  'para', 'como', 'este', 'esta', 'estos', 'estas', 'pero', 'desde', 'hasta',
  'entre', 'sobre', 'ante', 'bajo', 'tras', 'donde', 'cuando', 'porque',
  'aunque', 'sino', 'pues', 'cada', 'todo', 'toda', 'todos', 'todas',
  'otro', 'otra', 'otros', 'otras', 'mismo', 'misma', 'dicho', 'dicha',
  'que', 'con', 'por', 'una', 'uno', 'los', 'las', 'del', 'son', 'ser',
  'han', 'hay', 'mas', 'sus', 'les', 'cual', 'cuya', 'cuyo', 'cuyas',
]);

export interface DocContextResult {
  context: string;
  sources: DocSource[];
  hasIndexedContent: boolean;
  noDocsFound: boolean;
}

/** Lowercase, remove diacritics, strip punctuation — enables accent-insensitive matching */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Instead of always cutting from position 0, find the window in the document
 * where the query words appear most densely and extract that section.
 */
function extractRelevantExcerpt(content: string, queryWords: string[], maxLen = 4000): string {
  if (content.length <= maxLen) return content;

  const normalized = normalize(content);

  // Find the position of the first query word occurrence
  let firstPos = -1;
  for (const word of queryWords) {
    const pos = normalized.indexOf(word);
    if (pos !== -1 && (firstPos === -1 || pos < firstPos)) {
      firstPos = pos;
    }
  }

  // If no match found or match is near the beginning, take from start
  if (firstPos === -1 || firstPos < 400) return content.slice(0, maxLen);

  // Center the window around the first match, biased slightly backward for context
  const start = Math.max(0, firstPos - 600);
  const end = Math.min(content.length, start + maxLen);
  const prefix = start > 0 ? '[...] ' : '';
  const suffix = end < content.length ? ' [...]' : '';
  return prefix + content.slice(start, end) + suffix;
}

export async function fetchDocumentContext(query: string): Promise<DocContextResult> {
  const { data } = await supabase
    .from('documents')
    .select('name, ext, description, content, tags')
    .eq('status', 'active');

  if (!data?.length) {
    return { context: '', sources: [], hasIndexedContent: false, noDocsFound: true };
  }

  const queryWords = normalize(query)
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));

  if (!queryWords.length) {
    return { context: '', sources: [], hasIndexedContent: false, noDocsFound: false };
  }

  const scored = data
    .map((doc) => {
      const normName    = normalize(doc.name ?? '');
      const normDesc    = normalize(doc.description ?? '');
      const normContent = normalize(doc.content ?? '');
      const normTags    = normalize((doc.tags ?? []).join(' '));

      // Weighted scoring: name/tags = 4×, description = 2×, content presence = 1 per word
      let score = 0;
      for (const w of queryWords) {
        score += (normName.match(new RegExp(w, 'g'))    ?? []).length * 4;
        score += (normTags.match(new RegExp(w, 'g'))    ?? []).length * 3;
        score += (normDesc.match(new RegExp(w, 'g'))    ?? []).length * 2;
        score += normContent.includes(w) ? 1 : 0;
      }

      const hasUsableContent = !!(doc.content?.trim() || doc.description?.trim());
      return { ...doc, score, hasUsableContent };
    })
    .filter((d) => d.score > 0)
    .sort((a, b) => {
      // Docs with full text rank above metadata-only docs at equal score
      if (b.hasUsableContent !== a.hasUsableContent) return a.hasUsableContent ? -1 : 1;
      return b.score - a.score;
    })
    .slice(0, 4);

  if (!scored.length) {
    return { context: '', sources: [], hasIndexedContent: false, noDocsFound: false };
  }

  let hasIndexedContent = false;

  const context = scored
    .map((doc) => {
      if (doc.content?.trim()) {
        hasIndexedContent = true;
        const excerpt = extractRelevantExcerpt(doc.content, queryWords, 4000);
        return `=== DOCUMENTO: "${doc.name}" ===\n${excerpt}`;
      }
      // Metadata-only document
      const meta: string[] = [];
      if (doc.description?.trim()) meta.push(`Descripción: ${doc.description}`);
      if (doc.tags?.length)        meta.push(`Etiquetas: ${doc.tags.join(', ')}`);
      meta.push('ESTADO: Solo metadatos — texto completo no indexado todavía.');
      return `=== DOCUMENTO REGISTRADO (SIN TEXTO): "${doc.name}" ===\n${meta.join('\n')}`;
    })
    .filter(Boolean)
    .join('\n\n---\n\n');

  if (!context) {
    return { context: '', sources: [], hasIndexedContent: false, noDocsFound: false };
  }

  const sources: DocSource[] = scored
    .filter((d) => d.content?.trim() || d.description?.trim())
    .map((doc) => ({
      name: doc.name,
      ext: doc.ext ?? 'pdf',
      excerpt: doc.content?.trim()
        ? extractRelevantExcerpt(doc.content, queryWords, 600)
        : (doc.description ?? '[Sin extracto disponible]'),
    }));

  return { context, sources, hasIndexedContent, noDocsFound: false };
}
