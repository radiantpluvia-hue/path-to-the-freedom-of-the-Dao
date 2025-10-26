"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HIDDEN_ENCOUNTERS = exports.KID_GOD = void 0;
exports.KID_GOD = {
    id: 'kid_god_taek_jin',
    name: 'Kid God (Taek Jin)',
    description: "A reincarnation of Sun Wukong, born from Heaven and Earth's spiritual energy. Trained by his mortal grandfather in Recoilless Taekwondo, he wields the Ruyi Jingu Bang and seeks to challenge the Heavenly Demonic forces.",
    // Spawn only when player is at least Mystic Divine Origin III
    spawnCondition: (gameState) => {
        const realm = gameState?.player?.realm || 'mortal';
        return String(realm) === 'mystic_divine_origin_3' || String(realm).startsWith('mystic_divine_origin_') || false;
    },
    // Lower base chance and we'll enforce a world-level cooldown to avoid repeated spawns
    chance: 0.004, // ~0.4% per eligible check
    createEncounter: (gameState) => {
        // Create an encounter that references the hidden rival id. GameEngine will inject the full rival
        // template into RivalSystem at spawn time and set a cooldown flag on the world.
        const id = `hidden_encounter_kid_god_${Date.now()}`;
        // Set a long cooldown (e.g., 365 days) so this is effectively legendary unless intentionally allowed
        try {
            gameState.world = gameState.world || {};
            gameState.world.flags = gameState.world.flags || {};
            gameState.world.flags.lastKidGodSpawn = gameState.world.day || Date.now();
        }
        catch (e) {
            // ignore
        }
        return {
            id,
            rivalId: 'kid_god_taek_jin',
            type: 'chance',
            location: 'far_training_ground',
            description: "Kid God appears, a heaven-defying genius armed with the Ruyi Jingu Bang and perfected kicks. Prepare for a legendary clash.",
            outcome: 'pending',
            lootGained: [],
            reputationChange: {},
            year: gameState.world?.year || 0,
            timestamp: Date.now()
        };
    }
};
exports.HIDDEN_ENCOUNTERS = [exports.KID_GOD];
