import React from 'react';
import { useGameStore } from '../store/useGameStore';

export const SeclusionPanel: React.FC = () => {
  const seclusionState = useGameStore(state => (state as any).seclusionPath?.getState ? (state as any).seclusionPath.getState() : null);
  const player = useGameStore(state => state.player);
  const enterSeclusion = useGameStore(state => state.enterSeclusion);
  const exitSeclusion = useGameStore(state => state.exitSeclusion);
  const performSeclusionStudy = useGameStore(state => state.performSeclusionStudy);

  // Unlock rules
  const canStudy = (player.manuals && player.manuals.length > 0) || (player.skills?.meditation?.level || 0) > 0;
  const isSecluded = seclusionState?.mode === 'secluded';

  return (
    <div className="seclusion-panel" style={{ padding: 8, border: '1px solid #666', borderRadius: 6, background: '#fafafa' }}>
      <h3>Seclusion</h3>
      <div>Mode: {seclusionState?.mode ?? 'idle'}</div>
      <div>Ticks in seclusion: {seclusionState?.ticksSinceSeclusionStart ?? 0}</div>
      <div>Accumulated comprehension: {seclusionState?.accumulatedComprehension ?? 0}</div>
      <div style={{ marginTop: 8 }}>
        <button onClick={() => enterSeclusion(1, false)} disabled={isSecluded}>Enter Seclusion (1yr)</button>
        <button onClick={() => exitSeclusion()} disabled={!isSecluded} style={{ marginLeft: 8 }}>Exit Seclusion</button>
      </div>
      <div style={{ marginTop: 8 }}>
        <button onClick={() => performSeclusionStudy(1)} disabled={!isSecluded || !canStudy}>Study (Intensity 1)</button>
        {!canStudy && <div style={{ color: '#777', marginTop: 6 }}>Study unlock: acquire a manual or meditation level ≥ 1.</div>}
      </div>
    </div>
  );
};

export default SeclusionPanel;
