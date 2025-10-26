import React, { useState } from 'react';
import CompetitorCard from './CompetitorCard';
import SmallChip from '@/components/ui/SmallChip';

export default function BracketView({
  result,
  onClose
}: {
  result: { bracketSize: number; winnerIndex: any; rounds: number; roundsData?: any[] };
  onClose?: () => void;
}) {
  const { bracketSize, winnerIndex, rounds, roundsData, participants } = result as any;
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);

  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.06)', padding: 12, borderRadius: 6, background: 'var(--dark)', maxWidth: 900, overflowX: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 700 }}>Tournament Bracket</div>
        <div>
          {onClose && <button style={{ padding: 0 }} onClick={onClose}><SmallChip>Close</SmallChip></button>}
        </div>
      </div>

      <div style={{ marginTop: 8, color: 'var(--muted)' }}>
        Bracket size: {bracketSize} • Rounds: {rounds} • Winner: {String(winnerIndex)}
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
        {/* Render each round as a column */}
        {(roundsData || []).map((r: any, ri: any) => (
          <div key={`round-${ri}`} style={{ minWidth: 180, borderLeft: '1px dashed rgba(255,255,255,0.03)', paddingLeft: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Round {ri + 1}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {r.matches.map((m: any, mi: number) => (
                <div key={`r${ri}m${mi}`} style={{ padding: 8, borderRadius: 4, background: 'rgba(255,255,255,0.02)', cursor: 'pointer' }} onClick={() => {
                  // find participant profiles for a/b
                  const a = (participants || []).find((p: any) => String(p.id) === String(m.aId));
                  const b = (participants || []).find((p: any) => String(p.id) === String(m.bId));
                  setSelectedProfile({ a: a ? a.profile || a : null, b: b ? b.profile || b : null, match: m });
                }}>
                  <div style={{ fontSize: '0.9rem' }}>
                    {String(m.aId)} <strong>vs</strong> {String(m.bId)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                    Winner: {String(m.winnerId)} • strength: {Number(m.aStrength || 0).toFixed(2)}/{Number(m.bStrength || 0).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedProfile && (
        <div style={{ marginTop: 12, padding: 10, borderRadius: 6, background: 'rgba(0,0,0,0.6)', color: 'var(--text)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 700 }}>Match Details</div>
          <button style={{ padding: 0 }} onClick={() => setSelectedProfile(null)}><SmallChip>Close</SmallChip></button>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <div style={{ minWidth: 260 }}>
              <CompetitorCard profile={selectedProfile.a} label="A" />
            </div>

            <div style={{ minWidth: 260 }}>
              <CompetitorCard profile={selectedProfile.b} label="B" />
            </div>
          </div>
          <div style={{ marginTop: 8, color: 'var(--muted)' }}>Winner: {String(selectedProfile.match.winnerId)}</div>
        </div>
      )}
    </div>
  );
}
