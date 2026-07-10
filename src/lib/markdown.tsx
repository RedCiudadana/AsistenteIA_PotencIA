import { type ReactNode } from 'react';

let _key = 0;
function k() { return `md-${_key++}`; }

// ── Inline renderer ──────────────────────────────────────────────────────────
// Handles **bold**, *italic*, `code`, and plain text in order of appearance.

type InlinePattern = {
  re: RegExp;
  render: (inner: string) => ReactNode;
};

const INLINE_PATTERNS: InlinePattern[] = [
  {
    re: /\*\*\*(.+?)\*\*\*/s,
    render: (t) => <strong key={k()} className="font-bold italic text-[#0d2240]">{t}</strong>,
  },
  {
    re: /\*\*(.+?)\*\*/s,
    render: (t) => <strong key={k()} className="font-semibold text-[#0d2240]">{t}</strong>,
  },
  {
    re: /`(.+?)`/,
    render: (t) => (
      <code key={k()} className="bg-[#f0f5ff] text-[#1e3a5f] px-1.5 py-0.5 rounded text-[11px] font-mono border border-[#dbeafe]">
        {t}
      </code>
    ),
  },
  {
    re: /\*([^*\n]+?)\*/,
    render: (t) => <em key={k()} className="italic text-gray-700">{t}</em>,
  },
];

export function renderInline(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    let earliest = Infinity;
    let bestPattern: InlinePattern | null = null;
    let bestMatch: RegExpMatchArray | null = null;

    for (const p of INLINE_PATTERNS) {
      const m = remaining.match(p.re);
      if (m && m.index !== undefined && m.index < earliest) {
        earliest = m.index;
        bestPattern = p;
        bestMatch = m;
      }
    }

    if (bestMatch && bestPattern && earliest < Infinity) {
      if (earliest > 0) parts.push(remaining.slice(0, earliest));
      parts.push(bestPattern.render(bestMatch[1]));
      remaining = remaining.slice(earliest + bestMatch[0].length);
    } else {
      parts.push(remaining);
      break;
    }
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

// ── Block renderer ───────────────────────────────────────────────────────────

export function MarkdownContent({ content }: { content: string }) {
  const lines = content.split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // ── Fenced code block ──────────────────────────────────────────
    if (trimmed.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push(
        <pre key={k()} className="bg-[#0d2240] text-[#e2e8f0] rounded-xl px-4 py-3.5 text-[11.5px] font-mono overflow-x-auto my-3 leading-relaxed border border-[#1e3a5f]/30">
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      i++; // skip closing ```
      continue;
    }

    // ── Blockquote ─────────────────────────────────────────────────
    if (trimmed.startsWith('> ')) {
      const qLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        qLines.push(lines[i].trim().slice(2));
        i++;
      }
      blocks.push(
        <blockquote key={k()} className="border-l-4 border-[#2563eb] pl-4 py-1 my-2.5 bg-[#f0f5ff] rounded-r-xl">
          <p className="text-sm text-[#1e3a5f] leading-relaxed italic">{qLines.map(renderInline)}</p>
        </blockquote>
      );
      continue;
    }

    // ── Heading 1 ──────────────────────────────────────────────────
    if (trimmed.startsWith('# ')) {
      blocks.push(
        <h1 key={k()} className="text-base font-bold text-[#0d2240] mt-5 mb-2 pb-1.5 border-b border-gray-100">
          {renderInline(trimmed.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    // ── Heading 2 ──────────────────────────────────────────────────
    if (trimmed.startsWith('## ')) {
      blocks.push(
        <h2 key={k()} className="text-sm font-bold text-[#0d2240] mt-4 mb-1.5 flex items-center gap-2">
          <span className="w-1 h-4 bg-[#2563eb] rounded-full inline-block flex-shrink-0" />
          {renderInline(trimmed.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    // ── Heading 3 ──────────────────────────────────────────────────
    if (trimmed.startsWith('### ')) {
      blocks.push(
        <h3 key={k()} className="text-sm font-semibold text-[#1e3a5f] mt-3 mb-1">
          {renderInline(trimmed.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    // ── Horizontal rule ────────────────────────────────────────────
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      blocks.push(<hr key={k()} className="border-gray-200 my-3" />);
      i++;
      continue;
    }

    // ── Unordered list ─────────────────────────────────────────────
    if (trimmed.match(/^[-*+] /)) {
      const items: ReactNode[] = [];
      while (i < lines.length && lines[i].trim().match(/^[-*+] /)) {
        const text = lines[i].trim().replace(/^[-*+] /, '');
        items.push(
          <li key={k()} className="flex items-start gap-2.5 text-gray-700">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb] flex-shrink-0 mt-[7px]" />
            <span className="leading-relaxed">{renderInline(text)}</span>
          </li>
        );
        i++;
      }
      blocks.push(<ul key={k()} className="space-y-1.5 my-2.5 pl-0">{items}</ul>);
      continue;
    }

    // ── Ordered list ───────────────────────────────────────────────
    if (trimmed.match(/^\d+[.)]\s/)) {
      const items: ReactNode[] = [];
      let num = 1;
      while (i < lines.length && lines[i].trim().match(/^\d+[.)]\s/)) {
        const text = lines[i].trim().replace(/^\d+[.)]\s/, '');
        items.push(
          <li key={k()} className="flex items-start gap-2.5 text-gray-700">
            <span className="w-5 h-5 rounded-md bg-[#1e3a5f] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
              {num}
            </span>
            <span className="leading-relaxed flex-1">{renderInline(text)}</span>
          </li>
        );
        num++;
        i++;
      }
      blocks.push(<ol key={k()} className="space-y-2 my-2.5 pl-0">{items}</ol>);
      continue;
    }

    // ── Empty line ─────────────────────────────────────────────────
    if (trimmed === '') {
      i++;
      continue;
    }

    // ── Paragraph ──────────────────────────────────────────────────
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('> ') &&
      !lines[i].trim().match(/^[-*+] /) &&
      !lines[i].trim().match(/^\d+[.)]\s/) &&
      !['---', '***', '___'].includes(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push(
        <p key={k()} className="text-gray-800 leading-[1.7] text-sm">
          {renderInline(paraLines.join(' '))}
        </p>
      );
    }
  }

  return <div className="space-y-1.5">{blocks}</div>;
}
