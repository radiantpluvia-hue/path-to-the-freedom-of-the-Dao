import { useGameStore } from '../store/useGameStore';
import { logger } from '../utils/logger';
import { roll } from '../utils/rng';
import type { ActiveEncounter } from '../types';

// Lightweight Travel Encounter System
// - resolves planned encounters at travel start
// - if an interrupting encounter is rolled, it cancels travel and creates player.activeEncounter
// - exposes resolveActiveEncounterOutcome to clear the encounter and optionally resume travel

export function resolvePlannedEncountersAndMaybeInterrupt(payload: { edges: any[]; fromNodeId?: string | null; toNodeId?: string | null; mode?: string }) {
  const s = useGameStore.getState();
  try {
    if (!payload || !Array.isArray(payload.edges) || payload.edges.length === 0) return null;
    // Only attempt to interrupt when walking
    if (payload.mode && payload.mode !== 'walk') return null;

    for (let i = 0; i < payload.edges.length; i++) {
      const edge = payload.edges[i];
      if (!edge || !edge.encounter) continue;
      const enc = edge.encounter;
  const chance = Math.max(0, Math.min(1, enc.chance || 0));
  if (roll(useGameStore.getState()) < chance) {
        if (enc.interrupt) {
          const tid = enc.encounterId || edge.templateId || `edge_enc_${i}`;
          const activeEncounter: ActiveEncounter = {
            encounterId: tid,
            edgeIndex: i,
            fromNodeId: payload.fromNodeId || null,
            toNodeId: payload.toNodeId || null,
            startedAtTick: s.world.tick || 0,
            meta: { edge },
            branchState: { currentTemplateId: tid, choiceHistory: [] }
          };
          // cancel travel and set encounter
          try {
            (useGameStore.getState() as any).cancelTravel?.();
          } catch (e) {
            // fallback: clear activeTravel field
            useGameStore.setState(state => ({ player: { ...state.player, activeTravel: null } } as any));
          }
          // persist active encounter
          useGameStore.setState(state => ({ player: { ...state.player, activeEncounter } } as any));
          return activeEncounter;
        }
        // non-interrupting: could enqueue an event; ignore for now
      }
    }
  } catch (e) {
    logger.error('TravelEncounterSystem failed', e);
  }
  return null;
}

export function resolveActiveEncounterOutcome(outcome: { success: boolean; resumeTravel?: boolean }) {
  const s = useGameStore.getState();
  try {
    // Clear active encounter
    useGameStore.setState(state => ({ player: { ...state.player, activeEncounter: null } } as any));
    if (outcome.resumeTravel) {
      const last: any = s.player.lastPlannedTravel;
      if (last && typeof (useGameStore.getState() as any).startTravel === 'function') {
        (useGameStore.getState() as any).startTravel(last.toNodeId, last.opts || {});
      }
    }
  } catch (e) {
    logger.error('resolveActiveEncounterOutcome failed', e);
  }
}
