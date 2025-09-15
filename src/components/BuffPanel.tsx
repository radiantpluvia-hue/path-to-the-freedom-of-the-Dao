import React, { KeyboardEvent, useEffect, useState } from 'react';
import { useGameStore, Buff } from '@/store/useGameStore';
import '../styles/buffPanel.css';
import statIcon from '@/assets/icons/stat.svg';
import defaultIcon from '@/assets/icons/default.svg';

const Icon = ({ type }: { type: string }) => {
  const src = type === 'stat' ? statIcon : defaultIcon;
  return <img src={src} alt="" width={28} height={28} aria-hidden />;
};

export const BuffPanel: React.FC = () => {
  const player = useGameStore(state => state.player);
  const removeBuff = useGameStore(state => state.removeBuff);
  const [tick, setTick] = useState(() => useGameStore.getState().world.tick || 0);

  useEffect(() => {
    // subscribe to store changes and detect tick changes (typings vary by zustand version)
    const unsub = useGameStore.subscribe((newState, oldState) => {
      const newTick = newState?.world?.tick || 0;
      const oldTick = oldState?.world?.tick || 0;
      if (newTick !== oldTick) setTick(newTick);
    });
    return () => unsub();
  }, []);

  if (!player.activeBuffs || player.activeBuffs.length === 0) {
    return null;
  }

  const onKey = (e: KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      removeBuff(id);
    }
  };

  return (
    <aside className="buff-panel" aria-label="Active buffs">
      <div className="buff-panel__header">
        <h4 style={{ margin: 0, fontSize: '1rem' }}>Active Buffs</h4>
        <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{player.activeBuffs.length}</div>
      </div>

      {player.activeBuffs.map((b: Buff) => {
        // Detect percent-based stat effects for chart
        const percentStatKey = b.effects?.stats && Object.entries(b.effects.stats).find(([, v]) => typeof v === 'object' && (v as any).percent);
        const percentValue = percentStatKey ? ((percentStatKey[1] as any).percent as number) : 0;
        const initial = b.initialDuration || b.duration || 0;
        const remaining = Math.max(0, b.duration || 0);
        const progress = initial > 0 ? Math.max(0, Math.min(1, remaining / initial)) : 0;
        const dir = document.documentElement.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr';

        return (
          <div
            key={b.id}
            role="button"
            tabIndex={0}
            aria-pressed={false}
            onKeyDown={(e) => onKey(e, b.id)}
            onClick={() => removeBuff(b.id)}
            title={`${b.name}: ${b.description}`}
            className={`buff-card ${b.expiring ? 'expiring' : ''}`}
            dir={dir}
          >
            <div className="buff-card__icon">
              <Icon type={b.category || 'default'} />
            </div>

            <div className="buff-card__meta">
              <div className="buff-card__title-row">
                <div className="buff-card__name">{b.name}</div>
                <div className="buff-card__duration">{b.durationType === 'ticks' ? `Time: ${b.duration}` : `Uses: ${b.duration}`}</div>
              </div>
              <div className="buff-card__desc">{b.description}</div>

              {/* Accessible tooltip element (hidden until hover/focus) */}
              <div className="buff-tooltip" role="tooltip" aria-hidden>
                <strong>{b.name}</strong>
                <div style={{ marginTop: 6 }}>{b.description}</div>
                {percentValue > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Percent effect: {(percentValue * 100).toFixed(0)}%</div>
                  </div>
                )}
              </div>

              {percentValue > 0 && (
                <div className="buff-chart" aria-hidden>
                  <div className={`buff-chart__bar animated`} style={{ width: `${Math.min(100, percentValue * 100)}%` }} />
                </div>
              )}

              {/* Progress for remaining duration (animated) */}
              {initial > 0 && (
                <div>
                  <div className="buff-chart" aria-hidden>
                    <div className={`buff-chart__bar animated`} style={{ width: `${progress * 100}%` }} />
                  </div>
                  <div className="buff-card__countdown">{b.durationType === 'ticks' ? `Ticks left: ${remaining}` : `Uses left: ${remaining}`}</div>
                </div>
              )}
            </div>

            <div>
              <button
                className="buff-card__remove"
                aria-label={`Remove buff ${b.name}`}
                onClick={(e) => { e.stopPropagation(); removeBuff(b.id); }}
                onKeyDown={(e) => e.stopPropagation()}
              >
                Remove
              </button>
            </div>
          </div>
        );
      })}
    </aside>
  );
};

export default BuffPanel;
