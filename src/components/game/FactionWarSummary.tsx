import React from 'react';

export default function FactionWarSummary({ result }: { result: any }) {
  if (!result) return null;
  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.06)', padding: 12, borderRadius: 6, background: 'var(--dark)' }}>
      <div style={{ fontWeight: 700 }}>Faction War Result</div>
      <div>Victor: {String(result.victor)}</div>
      <div>Attacker casualties: {result.attackerCasualties}</div>
      <div>Defender casualties: {result.defenderCasualties}</div>
      <div>Turns: {result.turns}</div>
    </div>
  );
}
