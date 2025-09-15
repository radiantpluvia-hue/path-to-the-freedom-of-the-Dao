import React, { useMemo, useState } from 'react';
import CODEX_ENTRIES from '../data/codexEntries';
import { CodexEntry } from '../types/codex';
import '../styles/codex.css';

// Optional virtualization via react-window. It's a soft dependency used only when the
// `virtualize` prop is true. This keeps the default bundle small for small codex sizes.
let FixedSizeList: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
  FixedSizeList = require('react-window').FixedSizeList;
} catch (e) {
  FixedSizeList = null;
}

const allEntries = Object.values(CODEX_ENTRIES);

type Props = {
  virtualize?: boolean;
  height?: number;
};

export const CodexList: React.FC<Props> = ({ virtualize = false, height = 400 }) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allEntries;
    return allEntries.filter((e) => (
      e.title.toLowerCase().includes(q) ||
      (e.summary || '').toLowerCase().includes(q) ||
      e.content.join(' ').toLowerCase().includes(q) ||
      (e.tags || []).join(' ').toLowerCase().includes(q)
    ));
  }, [query]);

  const renderEntry = (entry: CodexEntry) => (
    <details key={entry.id} className="codex-entry" data-testid={`codex-entry-${entry.id}`}>
      <summary className="codex-entry-summary">{entry.title}</summary>
      <div className="codex-entry-body">
        {entry.summary && <p className="codex-entry-summary-text"><em>{entry.summary}</em></p>}
        {entry.content.map((p, i) => <p key={i} className="codex-entry-paragraph">{p}</p>)}
      </div>
    </details>
  );

  if (virtualize && FixedSizeList) {
    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const entry = filtered[index];
      return (
        <div style={style}>
          {renderEntry(entry)}
        </div>
      );
    };

    return (
      <div className="codex-list">
        <div className="codex-search-row">
          <input
            aria-label="Search codex"
            placeholder="Search codex..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="codex-search-input"
          />
        </div>
        <FixedSizeList
          height={height}
          itemCount={filtered.length}
          itemSize={88}
          width="100%"
        >
          {Row}
        </FixedSizeList>
      </div>
    );
  }

  return (
    <div className="codex-list">
      <div className="codex-search-row">
        <input
          aria-label="Search codex"
          placeholder="Search codex..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="codex-search-input"
        />
      </div>
      <div className="codex-grid">
        {filtered.map((entry: CodexEntry) => renderEntry(entry))}
      </div>
    </div>
  );
};

export default CodexList;
