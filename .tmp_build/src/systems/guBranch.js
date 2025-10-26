"use strict";
// guBranch.ts
// Note: avoid importing alignment module at top-level to prevent require cycles.
// Avoid top-level imports of local systems that may not exist in the test harness
// or that would cause circular requires. Use lazy requires where necessary.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.increaseAffinity = increaseAffinity;
exports.onPlayerActionWithGu = onPlayerActionWithGu;
exports.postPlayerActionHook = postPlayerActionHook;
exports.progressGu = progressGu;
exports.spawnSideEnemyIfEligible = spawnSideEnemyIfEligible;
// --- Constants & Configuration ---
// Affinity threshold to unlock Gu path
const AFFINITY_THRESHOLD = 75;
// Which cultivation paths get locked when Gu is unlocked
const LOCKED_PATHS_WHEN_GU = ['Qi', 'Magic', 'Spirit'];
// Rank progression ordering (you can extend this)
const GU_RANK_ORDER = [
    'Dormant',
    'Master1_Init',
    'Master1_Mid',
    'Master1_Upper',
    'Master1_Peak',
    'Master2_Init',
    // …
    'Immortal6',
    'Immortal7',
    'Immortal8',
    'Venerable'
];
// Affinity event: when the player’s affinity with Fang Yuan increases
function increaseAffinity(player, npcId, amount) {
    player.affinity = player.affinity || {};
    player.affinity[npcId] = (player.affinity[npcId] || 0) + amount;
    if (npcId === 'FangYuan') {
        // Try to use the guCultivation helper if available
        try {
            // Use dynamic import to avoid `require` runtime errors in browser builds.
            void (async () => {
                try {
                    const mod = await Promise.resolve().then(() => __importStar(require('./guCultivation')));
                    const gu = mod.default || mod;
                    if (gu && typeof gu.increaseAffinityWithFangYuan === 'function') {
                        try {
                            gu.increaseAffinityWithFangYuan(player, amount);
                        }
                        catch (e) { /* ignore */ }
                    }
                }
                catch (e) { /* ignore optional module */ }
            })();
            // Do not await: best-effort integration only.
        }
        catch (e) {
            // fallback to internal attempt
        }
        attemptUnlockGuPath(player);
    }
}
// Check & unlock Gu path if conditions met
function attemptUnlockGuPath(player) {
    if (player.guState.unlocked)
        return;
    const affinity = (player.affinity && player.affinity['FangYuan']) || 0;
    if (affinity >= AFFINITY_THRESHOLD) {
        unlockGuPath(player);
    }
}
function unlockGuPath(player) {
    player.guState.unlocked = true;
    player.guState.currentRank = 'Dormant';
    player.guState.apertureProgress = 0;
    player.guState.sideZoneUnlocked = false;
    // Lock other paths
    if (Array.isArray(player.availablePaths)) {
        player.availablePaths = player.availablePaths.filter(p => !LOCKED_PATHS_WHEN_GU.includes(p));
    }
    // Force current path to a Gu path id (best-effort; avoid calling external helpers)
    try {
        player.cultivationPath = 'RefiningGu';
    }
    catch (e) {
        // ignore
    }
    onGuPathUnlocked(player);
}
function onGuPathUnlocked(player) {
    // e.g. show UI prompt, grant a starter vital Gu
    console.log('Gu path unlocked!');
    // (you may add player.guState.vitalGuId, etc.)
}
// Called when player performs meaningful action (hook into your onPlayerAction)
function onPlayerActionWithGu(player, action) {
    // Convenience wrapper: lazily call alignment logic then run GU post-action hook.
    try {
        // Prefer synchronous require in Node/Jest environments so effects (like
        // alignment axis shifts and background unlocks) happen immediately. If
        // synchronous require fails (e.g., in some browser bundlers), fall back to
        // an async import which is best-effort.
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const mod = require('./alignment');
            const alignmentModule = mod.default || mod;
            if (alignmentModule && typeof alignmentModule.onPlayerAction === 'function') {
                try {
                    alignmentModule.onPlayerAction(player, action);
                }
                catch (e) { /* ignore */ }
            }
        }
        catch (syncErr) {
            // Fall back to dynamic import if require() isn't available in this env
            void (async () => {
                try {
                    const mod = await Promise.resolve().then(() => __importStar(require('./alignment')));
                    const alignmentModule = mod.default || mod;
                    if (alignmentModule && typeof alignmentModule.onPlayerAction === 'function') {
                        try {
                            alignmentModule.onPlayerAction(player, action);
                        }
                        catch (e) { /* ignore */ }
                    }
                }
                catch (e) { /* optional */ }
            })();
        }
    }
    catch (e) {
        console.warn('alignment module not available when calling onPlayerActionWithGu', e);
    }
    // Run GU post-action hook (same logic available separately below)
    try {
        postPlayerActionHook(player, action);
    }
    catch (e) {
        // swallow
    }
}
// Post-action hook that should be called after alignment logic runs.
// This avoids circular requires: alignment can lazily require this module and call this hook.
function postPlayerActionHook(player, action) {
    // Then, optionally reward affinity with FangYuan under certain actions
    if (action === 'betray_ally' || action === 'use_forbidden_art') {
        increaseAffinity(player, 'FangYuan', 3);
    }
    if (action === 'refuse_sect_mission') {
        increaseAffinity(player, 'FangYuan', 1);
    }
    // If Gu path unlocked, maybe incorporate special triggers
    if (player.guState && player.guState.unlocked) {
        // e.g. gaining resources helps aperture progress
        // or certain actions also increase Gu progress
    }
}
// Advance Gu cultivation progress (feeding, breaking walls, etc.)
function progressGu(player, essence, materials) {
    if (!player.guState.unlocked) {
        console.warn('Cannot progress Gu: not unlocked.');
        return;
    }
    // simple formula
    player.guState.apertureProgress += essence * 1.0 + materials * 0.5;
    const needed = computeThresholdForRank(player.guState.currentRank);
    if (player.guState.apertureProgress >= needed) {
        const next = getNextGuRank(player.guState.currentRank);
        if (next) {
            player.guState.currentRank = next;
            player.guState.apertureProgress = 0;
            onRankUp(player, next);
        }
    }
}
function computeThresholdForRank(rank) {
    const idx = GU_RANK_ORDER.indexOf(rank);
    return 100 * (idx + 1) * (idx + 1); // e.g. quadratic scale
}
function getNextGuRank(rank) {
    const idx = GU_RANK_ORDER.indexOf(rank);
    if (idx < 0 || idx + 1 >= GU_RANK_ORDER.length)
        return null;
    return GU_RANK_ORDER[idx + 1];
}
function onRankUp(player, newRank) {
    console.log(`Gu advanced to ${newRank}`);
    // If certain rank threshold unlocks side zone / enemies
    maybeUnlockSideZone(player);
}
// Unlock side zone / special enemies once Gu rank hits some threshold
function maybeUnlockSideZone(player) {
    if (!player.guState.sideZoneUnlocked) {
        const thresholdRank = 'Master1_Peak'; // example threshold
        const order = GU_RANK_ORDER;
        if (order.indexOf(player.guState.currentRank) >= order.indexOf(thresholdRank)) {
            player.guState.sideZoneUnlocked = true;
            onSideZoneUnlocked(player);
        }
    }
}
function onSideZoneUnlocked(player) {
    console.log('Side zone with Reynard Insanity–flavored enemies unlocked!');
    // maybe spawn a quest, open UI, register enemy pool, etc.
}
// Example: spawn a side enemy when player enters zone or triggers event
function spawnSideEnemyIfEligible(player) {
    if (!player.guState.sideZoneUnlocked)
        return;
    // pick from local GU enemy pool if available
    try {
        void (async () => {
            try {
                const mod = await Promise.resolve().then(() => __importStar(require('../data/guEnemies')));
                const enemies = mod.default || mod;
                if (Array.isArray(enemies) && enemies.length) {
                    const choice = enemies[Math.floor(Math.random() * enemies.length)];
                    if (Array.isArray(player.pendingEncounters))
                        player.pendingEncounters.push(choice);
                    else
                        console.log('spawnSideEnemyIfEligible: would spawn', choice.id || choice.name);
                }
            }
            catch (e) { /* ignore optional data */ }
        })();
    }
    catch (e) { /* ignore */ }
    // fallback: create a generic enemy
    const enemy = createSideEnemyForPlayer(player);
    if (Array.isArray(player.pendingEncounters))
        player.pendingEncounters.push(enemy);
    else
        console.log('spawnSideEnemyIfEligible (fallback):', enemy.id || enemy.name);
}
function createSideEnemyForPlayer(player) {
    // stub: pick difficulty based on Gu rank or alignment
    const strengthFactor = GU_RANK_ORDER.indexOf(player.guState.currentRank) + 1;
    return {
        id: `RS_enemy_${strengthFactor}`,
        name: `Gu Beast Rank ${strengthFactor}`,
        power: 10 * strengthFactor,
        // additional stats...
    };
}
// Export module
exports.default = {
    increaseAffinity,
    onPlayerActionWithGu,
    progressGu,
    spawnSideEnemyIfEligible,
};
