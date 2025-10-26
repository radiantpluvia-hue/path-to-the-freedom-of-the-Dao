"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PickupSystem = void 0;
const MissionSystem_1 = require("./MissionSystem");
/**
 * Lightweight system to expose an item-pickup hook for mission objectives.
 * Mirrors the pattern used by CombatSystem and CraftingSystem.
 */
class PickupSystem {
    constructor(gameStore) {
        this.gameStore = gameStore;
    }
    notifyItemPicked(itemId) {
        try {
            // Prefer injected store (supports getState/setState or plain object). Fall back to test module/global.
            let state = null;
            if (this.gameStore) {
                const gs = this.gameStore;
                if (typeof gs.getState === 'function')
                    state = gs.getState();
                else if (typeof gs === 'function')
                    state = gs();
                else
                    state = gs;
            }
            if (!state) {
                try {
                    const mod = require('@/store/useGameStore');
                    const useFn = mod && mod.useGameStore ? mod.useGameStore : mod;
                    state = useFn && typeof useFn.getState === 'function' ? useFn.getState() : (typeof useFn === 'function' ? useFn() : null);
                }
                catch (e) { /* ignore */ }
            }
            if (!state)
                state = globalThis.gameStore;
            if (!state || !state.story || !Array.isArray(state.story.activeRandomMissions))
                return;
            for (const m of state.story.activeRandomMissions) {
                if (!m.objectives)
                    continue;
                for (let i = 0; i < m.objectives.length; i++) {
                    const obj = m.objectives[i];
                    if (obj.target && (obj.target === itemId || String(obj.target) === String(itemId))) {
                        (0, MissionSystem_1.reportMissionObjectiveProgress)(m.id, i, 1);
                    }
                }
            }
        }
        catch (e) { /* ignore */ }
    }
}
exports.PickupSystem = PickupSystem;
