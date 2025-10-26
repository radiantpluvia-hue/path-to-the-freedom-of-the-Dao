/* eslint-disable no-restricted-imports -- references MAJOR_SECTS/MAJOR_FACTIONS for display */
import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { MAJOR_SECTS } from '@/systems/SectSystem';
import { MAJOR_FACTIONS } from '@/systems/SectSystem';

export const FactionStandingPanel: React.FC = () => {
  const { player, systems } = useGameStore();

  const sectName = player.sect ? (MAJOR_SECTS.find(s => s.id === player.sect)?.name || player.sect) : 'None';
  const sectRep = player.sect ? (systems?.sectReputations?.[player.sect] || 0) : 0;

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {/* Sect Reputation */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--accent)' }}>Sect</span>
          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{sectName}</span>
        </div>
        {player.sect && (
          <div style={{ marginTop: 4 }}>
            <div style={{ height: 8, background: 'rgba(34,197,94,0.15)', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(((sectRep) + 100) / 2)}%`,
                background: '#22c55e'
              }} />
            </div>
            <div style={{ marginTop: 4, fontSize: 12, color: 'var(--muted)' }}>
              Reputation: {sectRep > 0 ? '+' : ''}{sectRep}
            </div>
          </div>
        )}
      </div>

      {/* Faction Standings */}
      <div>
        <div style={{ color: 'var(--accent)', marginBottom: 4 }}>Factions</div>
        <div style={{ display: 'grid', gap: 6 }}>
          {Array.isArray(MAJOR_FACTIONS) ? MAJOR_FACTIONS.map(f => {
            const v = systems?.factionStandings?.[f.id] || 0;
            const bar = Math.max(0, Math.min(100, (v + 100) / 2));
            const color = v >= 50 ? '#16a34a' : v >= 0 ? '#ca8a04' : v >= -50 ? '#ea580c' : '#dc2626';
            return (
              <div key={f.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--muted)' }}>{f.name}</span>
                  <span style={{ color }}>{v > 0 ? '+' : ''}{v}</span>
                </div>
                <div style={{ height: 6, background: 'rgba(59,130,246,0.15)', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${bar}%`, background: '#3b82f6' }} />
                </div>
              </div>
            );
          }) : null}
        </div>
      </div>
    </div>
  );
};

export default FactionStandingPanel;