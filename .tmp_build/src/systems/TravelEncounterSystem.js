"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvePlannedEncountersAndMaybeInterrupt = resolvePlannedEncountersAndMaybeInterrupt;
exports.resolveActiveEncounterOutcome = resolveActiveEncounterOutcome;
const useGameStore_1 = require("../store/useGameStore");
const logger_1 = require("../utils/logger");
const rng_1 = require("../utils/rng");
// Lightweight Travel Encounter System
// - resolves planned encounters at travel start
// - if an interrupting encounter is rolled, it cancels travel and creates player.activeEncounter
// - exposes resolveActiveEncounterOutcome to clear the encounter and optionally resume travel
function resolvePlannedEncountersAndMaybeInterrupt(payload) {
    const s = useGameStore_1.useGameStore.getState();
    try {
        if (!payload || !Array.isArray(payload.edges) || payload.edges.length === 0)
            return null;
        // Only attempt to interrupt when walking
        if (payload.mode && payload.mode !== 'walk')
            return null;
        for (let i = 0; i < payload.edges.length; i++) {
            const edge = payload.edges[i];
            if (!edge || !edge.encounter)
                continue;
            const enc = edge.encounter;
            const chance = Math.max(0, Math.min(1, enc.chance || 0));
            if ((0, rng_1.roll)(useGameStore_1.useGameStore.getState()) < chance) {
                if (enc.interrupt) {
                    const tid = enc.encounterId || edge.templateId || `edge_enc_${i}`;
                    const activeEncounter = {
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
                        useGameStore_1.useGameStore.getState().cancelTravel?.();
                    }
                    catch (e) {
                        // fallback: clear activeTravel field
                        useGameStore_1.useGameStore.setState(state => ({ player: { ...state.player, activeTravel: null } }));
                    }
                    // persist active encounter
                    useGameStore_1.useGameStore.setState(state => ({ player: { ...state.player, activeEncounter } }));
                    return activeEncounter;
                }
                // non-interrupting: could enqueue an event; ignore for now
            }
        }
    }
    catch (e) {
        logger_1.logger.error('TravelEncounterSystem failed', e);
    }
    return null;
}
function resolveActiveEncounterOutcome(outcome) {
    const s = useGameStore_1.useGameStore.getState();
    try {
        // Clear active encounter
        useGameStore_1.useGameStore.setState(state => ({ player: { ...state.player, activeEncounter: null } }));
        if (outcome.resumeTravel) {
            const last = s.player.lastPlannedTravel;
            if (last && typeof useGameStore_1.useGameStore.getState().startTravel === 'function') {
                useGameStore_1.useGameStore.getState().startTravel(last.toNodeId, last.opts || {});
            }
        }
    }
    catch (e) {
        logger_1.logger.error('resolveActiveEncounterOutcome failed', e);
    }
}
