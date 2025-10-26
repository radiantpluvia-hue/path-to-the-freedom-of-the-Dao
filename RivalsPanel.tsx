import React, { useEffect, useState, memo } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Rival } from '@/types';
import { Button } from '@/components/core/Button';

function RivalsPanelImpl() {
  const startRivalEncounter = useGameStore(s => s.startRivalEncounter);
  const getRivalRelationship = useGameStore(s => s.getRivalRelationship);
  const setUIProperty = useGameStore(s => s.setUIProperty);
  const [rivals, setRivals] = useState<Rival[]>(() => {
    try { return (useGameStore.getState().getRivals?.() || []).slice(0, 5); } catch { return []; }
  });

  // Snapshot rivals on mount and when rival system signals updates via a cheap tick (day change)
  const day = useGameStore(s => s.world.day);
  useEffect(() => {
    try {
      const list = (useGameStore.getState().getRivals?.() || []).slice(0, 5);
      setRivals(list);
    } catch { /* ignore */ }
  }, [day]);

  const openRivalModal = (rivalId: string) => {
    setUIProperty('selectedRival', rivalId);
  };

  return (
    <div style={{ display: 'grid', gap: '10px' }}>
      {rivals.map((r: Rival) => (
        <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '8px' }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--primary)' }}>
              {r.name} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>• {r.title}</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Lvl {r.level} • {r.realm.replace(/_/g, ' ')}</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button onClick={() => openRivalModal(r.id)} size="small" variant="secondary">View</Button>
            <Button onClick={() => startRivalEncounter(r.id)} size="small">Encounter</Button>
            <span style={{ alignSelf: 'center', fontSize: '0.85rem', color: 'var(--accent)' }}>Rel: {getRivalRelationship(r.id)}</span>
          </div>
        </div>
      ))}
      {rivals.length === 0 && (
        <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>No rivals available yet.</div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button size="small" variant="secondary" onClick={() => {
          try { setRivals((useGameStore.getState().getRivals?.() || []).slice(0,5)); } catch { /* ignore */ }
        }}>Refresh</Button>
      </div>
    </div>
  );
}
export const RivalsPanel = memo(RivalsPanelImpl);
export default RivalsPanel;