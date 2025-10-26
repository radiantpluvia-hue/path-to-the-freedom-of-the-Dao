import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import ModalCloseButton from '@/components/ui/ModalCloseButton';

export default function NarrativeModal() {
  const { ui, setUIProperty } = useGameStore();
  const narrativeEngine: any = useGameStore(state => state.narrativeEngine);
  const player = useGameStore(state => state.player);

  if (!ui.showNarrative) return null;

  const threads = (narrativeEngine && narrativeEngine.destinyThreads) ? narrativeEngine.destinyThreads : [];

  return (
    <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <div style={{ background: 'var(--dark)', padding: 20, borderRadius: 8, width: 640, maxHeight: '80vh', overflow: 'auto', color: '#ddd' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Narrative Threads</h3>
          <ModalCloseButton onClick={() => setUIProperty('showNarrative', false)} ariaLabel="Close" title="Close" />
        </div>

        <div style={{ marginBottom: 12 }}>
          <strong>Player Affinity:</strong> {(player as any).destinyAffinity ?? 0}
        </div>

        <div>
          {threads.length === 0 ? (
            <div style={{ color: 'var(--muted)' }}>No threads detected.</div>
          ) : (
            <ul>
              {threads.map((t: any) => (
                <li key={t.id}><strong>{t.name || t.id}</strong> — Strength: {t.strength ?? 0}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
