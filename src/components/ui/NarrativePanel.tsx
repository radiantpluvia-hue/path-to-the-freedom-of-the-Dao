import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import DestinyAffinityBadge from './DestinyAffinityBadge';

export default function NarrativePanel() {
  const narrativeEngine: any = useGameStore(state => state.narrativeEngine);
  const player = useGameStore(state => state.player);

  const destinyThreads = (narrativeEngine && Array.isArray(narrativeEngine.destinyThreads)) ? narrativeEngine.destinyThreads : [];
  const karmaHistory = (narrativeEngine && Array.isArray(narrativeEngine.karmaHistory)) ? narrativeEngine.karmaHistory : [];
  const karmicSeeds = Array.isArray(player.karmicSeeds) ? player.karmicSeeds : [];
  const destinyAffinity = (player && typeof (player as any).destinyAffinity === 'number') ? (player as any).destinyAffinity : 0;

  return (
    <div className="narrative-panel" style={{ padding: 12, border: '1px solid #444', borderRadius: 6, background: '#111', color: '#ddd' }}>
      <h3 style={{ marginTop: 0 }}>Destiny Threads</h3>
      <DestinyAffinityBadge value={destinyAffinity} />
      {destinyThreads.length === 0 ? (
        <div style={{ fontStyle: 'italic', opacity: 0.8 }}>No destiny threads detected.</div>
      ) : (
        <ul>
          {destinyThreads.map((t: any) => (
            <li key={t.id} style={{ marginBottom: 6 }}>
              <strong>{t.name || t.id}</strong> — Strength: {t.strength ?? t.weight ?? 0}
              {Array.isArray(t.connections) && t.connections.length > 0 && (
                <div style={{ fontSize: 12, opacity: 0.9 }}>Connections: {t.connections.map((c: any) => c.target).join(', ')}</div>
              )}
            </li>
          ))}
        </ul>
      )}

      <h3>Karmic Seeds</h3>
      {karmicSeeds.length === 0 && karmaHistory.length === 0 ? (
        <div style={{ fontStyle: 'italic', opacity: 0.8 }}>No karmic seeds or history.</div>
      ) : (
        <div>
          {karmicSeeds.length > 0 && (
            <div>
              <strong>Active Seeds</strong>
              <ul>
                {karmicSeeds.map((s: any, idx: number) => (
                  <li key={`seed_${idx}`}>{s.name || s.id} — {s.description || ''}</li>
                ))}
              </ul>
            </div>
          )}

          {karmaHistory.length > 0 && (
            <div>
              <strong>Recent Karma Events</strong>
              <ul>
                {karmaHistory.slice(0, 10).map((k: any, i: number) => (
                  <li key={`k_${i}`}>{k.reason || k.type || 'karma'}: {k.value ?? k.delta ?? 0}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
