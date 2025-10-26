import React, { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Button } from '../core/Button';
import SmallChip from '../ui/SmallChip';
import { resolvePlannedEncountersAndMaybeInterrupt } from '@/systems/TravelEncounterSystem';

export default function RealTimeTravelHUD() {
  const store = useGameStore();
  const { player, cancelTravel: _cancelTravel } = store as any;
  void _cancelTravel;
  const active: any = player.activeTravel;
  const realMeta = active?.meta || {};
  const secs = realMeta?.realTimeDurationSeconds || 0;
  const [remaining, setRemaining] = useState(secs);
  const startRef = useRef<number | null>(null);
  const arrivalEpochMs = realMeta?.arrivalEpochMs || null;
  const pending: any[] = realMeta?.pendingEncounters || [];
  const pendingIndexRef = useRef(0);

  useEffect(() => {
    if (!active || !realMeta.realTime) return;
    // Compute remaining time using absolute arrivalEpochMs when available; falls back to relative duration
    const nowMs = Date.now();
    if (arrivalEpochMs) {
      setRemaining(Math.max(0, Math.ceil((arrivalEpochMs - nowMs) / 1000)));
    } else {
      // fallback: resume from saved timestamp if present
      const saved = realMeta.realTimeStartTimestamp || null;
      startRef.current = saved ? Number(saved) : Date.now();
      setRemaining(secs - Math.floor((Date.now() - (startRef.current || Date.now())) / 1000));
    }
    const iv = setInterval(() => {
      const now = Date.now();
      const rem = arrivalEpochMs ? Math.max(0, Math.ceil((arrivalEpochMs - now) / 1000)) : Math.max(0, secs - Math.floor((now - (startRef.current || now)) / 1000));
      setRemaining(rem);

      // Check pending encounters and trigger if their epoch has passed
      try {
        const idx = pendingIndexRef.current || 0;
        if (pending && pending.length > idx) {
          const next = pending[idx];
          if (next && next.epochMs && Date.now() >= next.epochMs) {
            // Trigger encounter: set player.activeEncounter via TravelEncounterSystem
              try {
              // Compose an activeEncounter object and persist via system
              const _created = resolvePlannedEncountersAndMaybeInterrupt({ edges: [next], fromNodeId: next.from, toNodeId: next.to, mode: 'walk' });
              void _created;
              // advance pending index to avoid retrigger
              pendingIndexRef.current = idx + 1;
              // Pause HUD while encounter active (we simply stop interval until encounter resolves)
              clearInterval(iv);
              return;
            } catch (e) {
              // ignore and continue
            }
          }
        }
      } catch (e) {
        // ignore pending errors
      }

      if (rem <= 0) {
        clearInterval(iv);
        // finish travel: resolve arrival via processTravelTick
        try { (useGameStore.getState() as any).processTravelTick(); } catch (e) { void e; }
      }
    }, 500);
    return () => clearInterval(iv);
  }, [active, realMeta.realTime, secs]);

  if (!active || !realMeta.realTime) return null;

  return (
    <div style={{ position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 60 }}>
      <div style={{ background: 'rgba(0,0,0,0.55)', padding: 12, borderRadius: 8, display: 'flex', gap: 12, alignItems: 'center', minWidth: 360, boxShadow: '0 6px 18px rgba(0,0,0,0.35)' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{`Travelling to ${String(active.toNodeId || '').replace(/_/g, ' ')}`}</div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, marginTop: 8, overflow: 'hidden' }}>
            <div style={{ width: `${Math.round((( (realMeta.arrivalEpochMs ? Math.max(0, Math.ceil((realMeta.arrivalEpochMs - Date.now())/1000)) : realMeta.realTimeDurationSeconds) - remaining) / Math.max(1, realMeta.realTimeDurationSeconds)) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent), var(--primary))' }} />
          </div>
          <div style={{ marginTop: 8 }}>{remaining}s remaining</div>
          {realMeta.plannedEncounters && realMeta.plannedEncounters.length > 0 && (
            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.9 }}>Risk along route: {Math.round(realMeta.plannedEncounters.reduce((acc:any,e:any)=>acc + (e.encounter?.chance || 0),0) * 100)}%</div>
          )}
        </div>
        <div>
          <Button variant="secondary" onClick={() => { try { (useGameStore.getState() as any).cancelTravel(); } catch (e) { void e; } }}>
            <SmallChip style={{ padding: '4px 8px' }}>Cancel</SmallChip>
          </Button>
        </div>
      </div>
    </div>
  );
}
