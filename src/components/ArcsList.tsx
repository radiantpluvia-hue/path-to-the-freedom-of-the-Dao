import React, { useMemo, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import SmallChip from './ui/SmallChip';

type UIArc = { id: string; title: string; description: string; disabled?: boolean };

export const ArcsList: React.FC = () => {
  const { storySystem } = useGameStore();

  const arcs: UIArc[] = useMemo(() => {
    if (!storySystem || typeof storySystem.getActsForUI !== 'function') return [];
    try {
      const s = useGameStore.getState();
      const result = storySystem.getActsForUI?.({
        player: s.player,
        world: s.world,
        story: s.story,
        ui: s.ui,
        systems: s.systems
      } as any);
      if (!Array.isArray(result)) return [];
      return result.map((r: any) => ({ id: String(r.id), title: String(r.title || ''), description: String(r.description || ''), disabled: !!r.disabled }));
    } catch (e) {
      return [];
    }
  }, [storySystem]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const isCurrent = (id: string) => useGameStore.getState().story.currentAct === id;

  const renderDescription = (id: string, text: string) => {
    const long = text.length > 140;
    const open = expanded[id];
    if (!long) return <span>{text}</span>;
    return (
      <>
        <span>{open ? text : `${text.slice(0, 140)}…`}</span>
        <button
          onClick={() => toggle(id)}
          style={{ marginLeft: 8, fontSize: 12, border: 'none', background: 'transparent', cursor: 'pointer' }}
        >
          <SmallChip style={{ marginLeft: 0, fontSize: 12, borderRadius: 4 }}>{open ? 'Less' : 'More'}</SmallChip>
        </button>
      </>
    );
  };

  if (!arcs.length) {
    return (
      <div style={{ color: 'var(--muted)', fontSize: 13 }}>No arcs available.</div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {arcs.map(arc => (
        <div
          key={arc.id}
          style={{
            padding: 10,
            border: '1px solid var(--border)',
            borderRadius: 6,
            background: arc.disabled ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
            opacity: arc.disabled ? 0.6 : 1
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <strong style={{ color: 'var(--primary)' }}>{arc.title}</strong>
            {isCurrent(arc.id) && (
              <SmallChip style={{ fontSize: 12, marginLeft: 6 }} variant="accent">(Current)</SmallChip>
            )}
            {arc.disabled && (
              <SmallChip style={{ marginLeft: 'auto', fontSize: 12 }} variant="neutral">Coming soon</SmallChip>
            )}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5 }}>
            {renderDescription(arc.id, arc.description)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ArcsList;
