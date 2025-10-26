// guBranch.ts
// Note: avoid importing alignment module at top-level to prevent require cycles.
// Avoid top-level imports of local systems that may not exist in the test harness
// or that would cause circular requires. Use lazy requires where necessary.

// --- Types & Interfaces ---

export type GuRank =
  | 'Dormant'
  | 'Master1_Init'
  | 'Master1_Mid'
  | 'Master1_Upper'
  | 'Master1_Peak'
  | 'Master2_Init'
  // … etc through Gu Immortal ranks
  | 'Immortal6'
  | 'Immortal7'
  | 'Immortal8'
  | 'Venerable';

export interface GuCultivationState {
  unlocked: boolean;
  affinityWithFangYuan: number;
  currentRank: GuRank;
  apertureProgress: number;
  vitalGuId?: string;
  ownedGuIds: string[];
  sideZoneUnlocked: boolean;     // whether the “Reverend Insanity zone / enemies” are unlocked
}

export interface Player {
  // extend your existing Player interface; keep shapes minimal to avoid type cycles
  guState: GuCultivationState;
  cultivationPath?: any;
  availablePaths?: string[];  // e.g. ['Body', 'Qi', 'Magic', 'Refining']
  alignment?: any;
  affinity?: Record<string, number>; // e.g. affinity to NPCs by id
  // optional hook where spawned encounters are queued
  pendingEncounters?: any[];
  // ... other player fields
}

// --- Constants & Configuration ---

// Affinity threshold to unlock Gu path
const AFFINITY_THRESHOLD = 75;

// Which cultivation paths get locked when Gu is unlocked
const LOCKED_PATHS_WHEN_GU = ['Qi', 'Magic', 'Spirit'];

// Rank progression ordering (you can extend this)
const GU_RANK_ORDER: GuRank[] = [
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
export function increaseAffinity(player: Player, npcId: string, amount: number) {
  player.affinity = player.affinity || {};
  player.affinity[npcId] = (player.affinity[npcId] || 0) + amount;
  if (npcId === 'FangYuan') {
    // Try to use the guCultivation helper if available
    try {
      // Use dynamic import to avoid `require` runtime errors in browser builds.
      void (async () => {
        try {
          const mod = await import('./guCultivation');
          const gu = (mod as any).default || (mod as any);
          if (gu && typeof gu.increaseAffinityWithFangYuan === 'function') {
            try { gu.increaseAffinityWithFangYuan(player as any, amount); } catch (e) { /* ignore */ }
          }
        } catch (e) { /* ignore optional module */ }
      })();
      // Do not await: best-effort integration only.
    } catch (e) {
      // fallback to internal attempt
    }
    attemptUnlockGuPath(player);
  }
}

// Check & unlock Gu path if conditions met
function attemptUnlockGuPath(player: Player) {
  if (player.guState.unlocked) return;
  const affinity = (player.affinity && player.affinity['FangYuan']) || 0;
  if (affinity >= AFFINITY_THRESHOLD) {
    unlockGuPath(player);
  }
}

function unlockGuPath(player: Player) {
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
  } catch (e) {
    // ignore
  }

  onGuPathUnlocked(player);
}

function onGuPathUnlocked(player: Player) {
  // e.g. show UI prompt, grant a starter vital Gu
  console.log('Gu path unlocked!');
  // (you may add player.guState.vitalGuId, etc.)
}

// Called when player performs meaningful action (hook into your onPlayerAction)
export function onPlayerActionWithGu(player: Player, action: any) {
  // Convenience wrapper: lazily call alignment logic then run GU post-action hook.
  try {
    // Prefer synchronous require in Node/Jest environments so effects (like
    // alignment axis shifts and background unlocks) happen immediately. If
    // synchronous require fails (e.g., in some browser bundlers), fall back to
    // an async import which is best-effort.
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('./alignment');
      const alignmentModule = (mod as any).default || (mod as any);
      if (alignmentModule && typeof alignmentModule.onPlayerAction === 'function') {
        try { alignmentModule.onPlayerAction(player as any, action); } catch (e) { /* ignore */ }
      }
    } catch (syncErr) {
      // Fall back to dynamic import if require() isn't available in this env
      void (async () => {
        try {
          const mod = await import('./alignment');
          const alignmentModule = (mod as any).default || (mod as any);
          if (alignmentModule && typeof alignmentModule.onPlayerAction === 'function') {
            try { alignmentModule.onPlayerAction(player as any, action); } catch (e) { /* ignore */ }
          }
        } catch (e) { /* optional */ }
      })();
    }
  } catch (e) {
    console.warn('alignment module not available when calling onPlayerActionWithGu', e);
  }

  // Run GU post-action hook (same logic available separately below)
  try {
    postPlayerActionHook(player, action);
  } catch (e) {
    // swallow
  }

}

// Post-action hook that should be called after alignment logic runs.
// This avoids circular requires: alignment can lazily require this module and call this hook.
export function postPlayerActionHook(player: Player, action: any) {
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
export function progressGu(player: Player, essence: number, materials: number) {
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

function computeThresholdForRank(rank: GuRank): number {
  const idx = GU_RANK_ORDER.indexOf(rank);
  return 100 * (idx + 1) * (idx + 1);  // e.g. quadratic scale
}

function getNextGuRank(rank: GuRank): GuRank | null {
  const idx = GU_RANK_ORDER.indexOf(rank);
  if (idx < 0 || idx + 1 >= GU_RANK_ORDER.length) return null;
  return GU_RANK_ORDER[idx + 1];
}

function onRankUp(player: Player, newRank: GuRank) {
  console.log(`Gu advanced to ${newRank}`);
  // If certain rank threshold unlocks side zone / enemies
  maybeUnlockSideZone(player);
}

// Unlock side zone / special enemies once Gu rank hits some threshold
function maybeUnlockSideZone(player: Player) {
  if (!player.guState.sideZoneUnlocked) {
    const thresholdRank: GuRank = 'Master1_Peak';  // example threshold
    const order = GU_RANK_ORDER;
    if (order.indexOf(player.guState.currentRank) >= order.indexOf(thresholdRank)) {
      player.guState.sideZoneUnlocked = true;
      onSideZoneUnlocked(player);
    }
  }
}

function onSideZoneUnlocked(player: Player) {
  console.log('Side zone with Reynard Insanity–flavored enemies unlocked!');
  // maybe spawn a quest, open UI, register enemy pool, etc.
}

// Example: spawn a side enemy when player enters zone or triggers event
export function spawnSideEnemyIfEligible(player: Player) {
  if (!player.guState.sideZoneUnlocked) return;
  // pick from local GU enemy pool if available
    try {
      void (async () => {
        try {
          const mod = await import('../data/guEnemies');
          const enemies = (mod as any).default || (mod as any);
          if (Array.isArray(enemies) && enemies.length) {
            const { choice } = await import('../utils/rng');
            const pick = choice(enemies);
            if (Array.isArray(player.pendingEncounters)) player.pendingEncounters.push(pick);
            else console.log('spawnSideEnemyIfEligible: would spawn', pick.id || pick.name);
          }
        } catch (e) { /* ignore optional data */ }
      })();
    } catch (e) { /* ignore */ }
  // fallback: create a generic enemy
  const enemy = createSideEnemyForPlayer(player);
  if (Array.isArray(player.pendingEncounters)) player.pendingEncounters.push(enemy);
  else console.log('spawnSideEnemyIfEligible (fallback):', enemy.id || enemy.name);
}

function createSideEnemyForPlayer(player: Player): any {
  // stub: pick difficulty based on Gu rank or alignment
  const strengthFactor = GU_RANK_ORDER.indexOf(player.guState.currentRank) + 1;
  return {
    id: `RS_enemy_${strengthFactor}`,
    name: `Gu Beast Rank ${strengthFactor}`,
    power: 10 * strengthFactor,
    // additional stats...
  } as any;
}

// Export module
export default {
  increaseAffinity,
  onPlayerActionWithGu,
  progressGu,
  spawnSideEnemyIfEligible,
};
