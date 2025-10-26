import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { Button } from './core/Button';
import { Card } from './core/Card';

export const SeclusionPanel: React.FC = () => {
  // Avoid calling `getState()` inside the selector which may read from the
  // seclusionPath instance and cause synchronous store updates that lead to
  // nested update loops. Instead we select the reference and snapshot it in
  // an effect into local component state.
  const seclusionPathRef = useGameStore(state => (state as any).seclusionPath);
  const [seclusionState, setSeclusionState] = React.useState<any>(null);
  React.useEffect(() => {
    let mounted = true;
    try {
      if (seclusionPathRef && typeof seclusionPathRef.getState === 'function') {
        const snap = seclusionPathRef.getState();
        if (mounted) setSeclusionState(snap);
      } else {
        if (mounted) setSeclusionState(null);
      }
    } catch (e) { if (mounted) setSeclusionState(null); }
    return () => { mounted = false; };
  }, [seclusionPathRef]);
  const player = useGameStore(state => state.player);
  const enterSeclusion = useGameStore(state => state.enterSeclusion);
  const exitSeclusion = useGameStore(state => state.exitSeclusion);
  const performSeclusionStudy = useGameStore(state => state.performSeclusionStudy);
  const attemptRealmBreakthroughWithConsolidation = useGameStore(state => (state as any).attemptRealmBreakthroughWithConsolidation);
  const seclusionProgress = useGameStore(state => (state as any).ui?.seclusionProgress || 0);
  const seclusionReady = useGameStore(state => (state as any).ui?.seclusionReadyForBreakthrough || false);
  const addEventLog = useGameStore(state => state.addEventLog);

  // Unlock rules
  const canStudy = (player.manuals && player.manuals.length > 0) || (player.skills?.meditation?.level || 0) > 0;
  const isSecluded = seclusionState?.mode === 'secluded';

  return (
    <Card title="Seclusion">
      <div>Mode: {seclusionState?.mode ?? 'idle'}</div>
      <div>Ticks in seclusion: {seclusionState?.ticksSinceSeclusionStart ?? 0}</div>
      <div>Accumulated comprehension: {seclusionState?.accumulatedComprehension ?? 0}</div>
      <div style={{ marginTop: 8 }}>
        <div style={{ marginBottom: 8 }}>
          <strong>Seclusion Progress:</strong> {seclusionProgress}% {seclusionReady ? '(Ready for breakthrough)' : ''}
        </div>
        <div>
          <Button
            onClick={() => {
              try {
                if (typeof attemptRealmBreakthroughWithConsolidation === 'function') {
                  attemptRealmBreakthroughWithConsolidation('seclusion_auto');
                } else if ((window as any).__TEST__ && (window as any).__TEST__.onAttemptBreakthrough) {
                  (window as any).__TEST__.onAttemptBreakthrough();
                } else {
                  addEventLog?.('No breakthrough handler available.');
                }
              } catch (e) {
                try { addEventLog?.('Attempt breakthrough failed.'); } catch { /* ignore */ }
              }
            }}
            disabled={!seclusionReady}
            variant={seclusionReady ? 'primary' : 'secondary'}
            ariaLabel="Attempt Breakthrough"
          >
            Attempt Breakthrough
          </Button>
        </div>
        <div style={{ marginTop: 8 }}>
          <Button onClick={() => { try { enterSeclusion && enterSeclusion(1, false); } catch (e) { addEventLog?.('Enter seclusion failed.'); } }} disabled={isSecluded} variant="secondary" ariaLabel="Enter Seclusion">Enter Seclusion (1yr)</Button>
          {/* Start seclusion according to schedule (cultivationDaysAllocated -> years) */}
          <Button
            onClick={() => {
              try {
                const days = (player as any).cultivationDaysAllocated || 0;
                const years = Math.max(1, Math.ceil(days / 365));
                enterSeclusion && enterSeclusion(years, false);
              } catch (e) { addEventLog?.('Start scheduled seclusion failed.'); }
            }}
            disabled={isSecluded || !((player as any).cultivationDaysAllocated && (player as any).cultivationDaysAllocated > 0)}
            variant="secondary"
            style={{ marginLeft: 8 }}
            ariaLabel="Start Scheduled Seclusion"
          >
            Start Seclusion (use schedule)
          </Button>
          <Button onClick={() => { try { exitSeclusion && exitSeclusion(); } catch (e) { addEventLog?.('Exit seclusion failed.'); } }} disabled={!isSecluded} variant="secondary" style={{ marginLeft: 8 }} ariaLabel="Exit Seclusion">Exit Seclusion</Button>
        </div>
      </div>
      <div style={{ marginTop: 8 }}>
        <Button onClick={() => { try { performSeclusionStudy && performSeclusionStudy(1); } catch (e) { addEventLog?.('Study failed.'); } }} disabled={!isSecluded || !canStudy} variant="primary" ariaLabel="Study">Study (Intensity 1)</Button>
        {!canStudy && <div style={{ color: 'var(--muted)', marginTop: 6 }}>Study unlock: acquire a manual or meditation level ≥ 1.</div>}
      </div>
    </Card>
  );
};

export default SeclusionPanel;
