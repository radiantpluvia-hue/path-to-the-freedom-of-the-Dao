import React, { useMemo, useState } from 'react';
import CODEX_ENTRIES from '../data/codexEntries';
import { CodexEntry } from '../types/codex';
import '../styles/codex.css';

// Optional virtualization via react-window. It's a soft dependency used only when the
// `virtualize` prop is true. This keeps the default bundle small for small codex sizes.
const _FixedSizeList: any = null;
void _FixedSizeList;
// Defer loading react-window until requested to avoid making it a hard dependency for the main bundle.
// We'll perform a dynamic import at render-time when virtualization is requested.

const allEntries = Object.values(CODEX_ENTRIES);

type Props = {
  virtualize?: boolean;
  height?: number;
};

export const CodexList: React.FC<Props> = ({ virtualize = false, height = 400 }) => {
  const [query, setQuery] = useState('');
  const [windowLoaded, setWindowLoaded] = useState(false);
  const [WindowComponent, setWindowComponent] = useState<any>(null);

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

  if (virtualize) {
    // kick off dynamic import on-demand
    if (!windowLoaded) {
      // react-window is optional; attempt to load it and mark loaded regardless so UI doesn't hang
      import('react-window').then((mod: any) => { setWindowComponent(mod.FixedSizeList || mod.FixedSizeList); setWindowLoaded(true); }).catch(() => { setWindowLoaded(true); });
      return <div className="codex-list">Loading...</div>;
    }
    if (WindowComponent) {
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
          <WindowComponent
            height={height}
            itemCount={filtered.length}
            itemSize={88}
            width="100%"
          >
            {Row}
          </WindowComponent>
        </div>
      );
    }
    return <div className="codex-list">No virtualization available.</div>;
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
