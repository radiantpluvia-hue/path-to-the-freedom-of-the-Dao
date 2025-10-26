"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.act7EventExecutors = void 0;
const rng_1 = require("../utils/rng");
const combatConfig_1 = require("../systems/combatConfig");
exports.act7EventExecutors = {
    // Example event executor structure
    "act7_event_1": (state) => {
        // Example: Discover hidden celestial manual
        const item = {
            id: "celestial_manual",
            name: "Celestial Manual",
            quantity: 1,
            qty: 1,
            description: 'An illustrious celestial manual that hums with cosmic power; grants potent stat boosts or a unique passive.',
            meta: { type: "manual", rarity: "D" },
            effects: { cultivationSpeed: 1.5, atk: 25 },
            passiveId: 'celestial_insight'
        };
        state.player.inventory.push(item);
        return state;
    },
    "act7_event_2": (state) => {
        // Example: Great Sect Tournament duel — use centralized combat power
        // Use direct import for computeCombatPower; fallback to a simple heuristic if missing
        const playerPower = (typeof combatConfig_1.computeCombatPower === 'function') ? (0, combatConfig_1.computeCombatPower)(state.player) : (state.player.stats?.atk || 50);
        const rivalPower = Math.floor(playerPower * 0.95);
        const win = (0, rng_1.roll)(state) * playerPower > rivalPower;
        if (win) {
            // Add contribution points if the property exists
            if ('contributionPoints' in state.player) {
                state.player.contributionPoints += 500;
            }
        }
        else {
            const stats = (state.player.stats = state.player.stats || { hp: 100, qi: 0, atk: 0, def: 0, speed: 0 });
            const maxHp = stats.hp || 100;
            stats.hp = Math.max(0, (stats.hp || 0) - Math.floor(maxHp * 0.15));
        }
        return state;
    },
    // Fill in remaining events as no-op stubs for now
    ...Object.fromEntries(Array.from({ length: 28 }, (_, i) => [`act7_event_${i + 3}`, (state) => state]))
};
