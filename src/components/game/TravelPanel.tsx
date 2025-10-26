import React, { useMemo } from 'react';
import { runtimeRng } from '@/utils/seededRng';
import { getPlayerRealmKey } from '@/utils/playerHelpers';
import { useGameStore } from '../../store/useGameStore';
import { Button } from '../core/Button';
import SmallChip from '../ui/SmallChip';
import { findShortestPath } from '@/utils/travelPath';

export default function TravelPanel({ onClose }: { onClose: () => void }) {
  const store = useGameStore();
  const { player, startTravel } = store as any;
  const [preRoll, setPreRoll] = React.useState(true);

  const discovered = (player.unlockedMapNodes || []).slice(0, 50);

  const nodes = player.mapNodes || [];
  const edges = player.mapEdges || [];

  const nodeInfo = useMemo(() => {
    const map: Record<string, any> = {};
    for (const id of discovered) {
      const path = findShortestPath(nodes, edges, player.currentMapNode || null, id) || null;
      map[id] = { path, etaSecs: path ? path.totalDurationSeconds : 0, etaTicks: path ? path.totalDurationTicks : 0 };
      // aggregate cost along path
      if (path && path.path && path.path.length > 1) {
        const plannedCost: Record<string, number> = {};
        for (let i = 0; i < path.path.length - 1; i++) {
          const a = path.path[i];
          const b = path.path[i + 1];
          const e: any = (edges || []).find((ed: any) => (ed.from === a && ed.to === b) || (ed.from === b && ed.to === a));
          if (e && e.cost) {
            for (const k of Object.keys(e.cost || {})) plannedCost[k] = (plannedCost[k] || 0) + (e.cost?.[k] || 0);
          }
        }
        if (Object.keys(plannedCost).length > 0) map[id].plannedCost = plannedCost;
        // list encounters
        const encounters: any[] = [];
        for (let i = 0; i < path.path.length - 1; i++) {
          const a = path.path[i];
          const b = path.path[i + 1];
          const e: any = (edges || []).find((ed: any) => (ed.from === a && ed.to === b) || (ed.from === b && ed.to === a));
          if (e && e.encounter) encounters.push({ from: a, to: b, encounter: e.encounter });
        }
        if (encounters.length > 0) {
          // If preRoll toggle on, preview which edges would pre-roll as willTrigger
          if (preRoll) {
            for (const ec of encounters) {
              try {
                const chance = ec.encounter?.chance;
                if (typeof chance === 'number') {
                  const roll = runtimeRng();
                  ec.willTrigger = roll < Math.max(0, Math.min(1, chance));
                }
              } catch (e) { void e; }
            }
          }
          map[id].encounters = encounters;
        }
      }
    }
    return map;
  }, [discovered.join(','), JSON.stringify(nodes || []), JSON.stringify(edges || []), player.currentMapNode, preRoll]);

  const handleStart = (nodeId: string, useGate: boolean) => {
  const realm = getPlayerRealmKey(player) || 'mortal';
    const mortalSlow = (realm === 'mortal' || realm === 'foundation');
    // pass useGate flag; UI now makes the gate choice explicit
    if (mortalSlow) {
      startTravel(nodeId, { fromNodeId: player.currentMapNode || null, mode: 'walk', useGate, preRollEncounters: preRoll });
    } else {
      // higher realms: teleport/instant
      startTravel(nodeId, { fromNodeId: player.currentMapNode || null, mode: 'teleport', useGate, preRollEncounters: preRoll });
    }
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, background: 'rgba(0,0,0,0.35)' }}>
      <div style={{ width: 720, maxHeight: '80vh', overflow: 'auto', background: 'var(--card-bg)', border: '1px solid rgba(255,255,255,0.06)', padding: 16, borderRadius: 8, boxShadow: '0 6px 24px rgba(0,0,0,0.45)' }}>
        <h3>Travel</h3>
        <p>Choose a discovered destination to travel to.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {discovered.length === 0 && <div>No discovered locations yet.</div>}
          {discovered.map((id: string) => {
            const info = nodeInfo[id] || {};
            return (
              <div key={id} style={{ padding: 8, border: '1px solid rgba(255,255,255,0.04)', borderRadius: 6, minWidth: 220 }}>
                <div style={{ fontWeight: 600 }}>{id.replace(/_/g, ' ')}</div>
                <div style={{ marginTop: 8 }}>
                  <div>ETA: {info.etaSecs ? `${info.etaSecs}s` : (info.etaTicks ? `${info.etaTicks} ticks` : 'Instant')}</div>
                  {info.plannedCost && <div>Cost: {Object.entries(info.plannedCost).map(([k,v])=>`${k}:${v}`).join(', ')}</div>}
                  {info.encounters && info.encounters.length > 0 && (
                    <div style={{ marginTop: 6 }}>
                      Risk: {Math.round(info.encounters.reduce((acc:any,e:any)=>acc + (e.encounter?.chance || 0),0) * 100)}%
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
                        {info.encounters.map((ec: any, idx: number) => (
                          <div key={idx}>{ec.from}{' -> '}{ec.to} - chance: {Math.round((ec.encounter?.chance || 0) * 100)}% {ec.willTrigger !== undefined ? ` (pre-roll: ${ec.willTrigger ? 'YES' : 'NO'})` : ''}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                  <Button onClick={() => handleStart(id, false)}><SmallChip>Walk</SmallChip></Button>
                  <Button onClick={() => handleStart(id, true)} variant="secondary"><SmallChip>Use Gate</SmallChip></Button>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 16 }}>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <input type="checkbox" checked={preRoll} onChange={(e) => setPreRoll(e.target.checked)} />
            <span style={{ fontSize: 13 }}>Pre-roll encounters (deterministic) when starting travel</span>
          </label>
          <Button variant="secondary" onClick={onClose}><SmallChip>Close</SmallChip></Button>
        </div>
      </div>
    </div>
  );
}
