import { useGameStore } from '@/store/useGameStore';
import { Rival } from '@/types';
import { Button } from '@/components/core/Button';

export function RivalsPanel() {
  const { startRivalEncounter, getRivalRelationship, setUIProperty } = useGameStore();
  const rivals = useGameStore(state => state.getRivals().slice(0, 5));

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
    </div>
  );
}

export default RivalsPanel;