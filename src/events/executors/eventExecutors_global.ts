import { EventExecutor, GameState, HeavensListEntry } from "../../../utils/types";
import { logger } from '../../utils/logger';

// To keep the global executor chunk small we avoid importing the entire
// systems index here. Instead provide a tiny local helper that builds a
// simple heavens list from candidates using the same weighting inputs.
function buildHeavensListLocal(participants: HeavensListEntry[], opts?: any): HeavensListEntry[] {
  const { combatWeight = 1, karmaWeight = 0, fameWeight = 0, maxEntries = 100 } = opts || {};
  const scored = participants.map(p => ({
    p,
    score: (p.combatPower || 0) * combatWeight + (p.karma || 0) * karmaWeight + (p.fame || 0) * fameWeight,
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxEntries).map(s => s.p);
}

function setHeavensListLocal(state: GameState, list: HeavensListEntry[]) {
  try {
    state.world.flags = state.world.flags || {};
    // Keep heavensList available both as a dedicated world property and
    // mirrored in world.flags for older code paths that expect it there.
    try { state.world.heavensList = list; } catch (e) { /* ignore */ }
    state.world.flags['heavensList'] = list as unknown as string | number | boolean;
  } catch (e) {
    // swallow
  }
}

// Phase 2: Ascension executor – forces transition to immortal world when triggered.
// This is invoked by the special ascension event injected at the moment the player reaches true_immortal.
export const forcedAscensionExecutor: EventExecutor = (state, _args) => {
  try {
    if (!state.world.ascended) {
      state.world.currentWorldType = 'immortal';
      state.world.ascended = true;
      // Mark a story flag so other systems (e.g., content packs or diagnostics) can react.
      if (!state.story.storyFlags) state.story.storyFlags = {} as any;
      state.story.storyFlags['ascended_true_immortal'] = true;
      // Light stat / karma nudge to emphasize breakthrough (kept modest; can tune later)
      state.player.karma = (state.player.karma || 0) + 25;
      state.player.combatPower = Math.round((state.player.combatPower || 0) * 1.05 + 10);
    }
  } catch (e) {
    logger.warn('forcedAscensionExecutor failed (non-fatal):', e);
  }
  return state;
};

import { getRng } from '../../utils/rng';

function rng(state: GameState, min: number, max: number) {
  try {
    if (typeof state.rng === 'function') return (state.rng as any)(min, max);
    // Resolve RNG at call-time to allow deterministic injection
    const rfn = getRng(state);
    const sample = (typeof rfn === 'function') ? rfn() : Math.random();
    return sample * (max - min) + min;
  } catch (e) {
  const f = getRng(state);
  const s = (typeof f === 'function') ? f() : Math.random();
  return s * (max - min) + min;
  }
}

function pickCandidates(state: GameState): HeavensListEntry[] {
  const player: HeavensListEntry = {
    id: "player",
    name: state.player.name,
    rank: 0,
    combatPower: state.player.combatPower ?? 1,
    karma: state.player.karma ?? 0,
    fame: state.player.reputation?.["world"] ?? 0,
    title: state.player.title ?? ""
  };
  const npcs: HeavensListEntry[] = (state.world.flags["knownProdigies"] as unknown as HeavensListEntry[]) ?? [];
  return [player, ...npcs];
}

function simulateFight(a: HeavensListEntry, b: HeavensListEntry, state: GameState): HeavensListEntry {
  const aRoll = a.combatPower + rng(state, -0.05 * a.combatPower, 0.05 * a.combatPower) + (a.karma * 0.01);
  const bRoll = b.combatPower + rng(state, -0.05 * b.combatPower, 0.05 * b.combatPower) + (b.karma * 0.01);
  return aRoll >= bRoll ? a : b;
}

function buildBracket(participants: HeavensListEntry[]): HeavensListEntry[][] {
  const size = Math.pow(2, Math.ceil(Math.log2(Math.min(participants.length, 16))));
  const seeds = participants.slice(0, size);
  const bracket: HeavensListEntry[][] = [];
  for (let i = 0; i < size; i += 2) bracket.push([seeds[i], seeds[i + 1]]);
  return bracket;
}

function runBracket(bracket: HeavensListEntry[][], state: GameState): { champion: HeavensListEntry; history: string[][] } {
  const history: string[][] = [];
  let round = bracket;
  while (round.length > 1 || (round.length === 1 && round[0].length === 2)) {
    const next: HeavensListEntry[] = [];
    const roundPairs: string[] = [];
    for (const [a, b] of round) {
      const winner = simulateFight(a, b, state);
      next.push(winner);
      roundPairs.push(`${a.name} vs ${b.name} → ${winner.name}`);
    }
    history.push(roundPairs);
    const nextRound: HeavensListEntry[][] = [];
    for (let i = 0; i < next.length; i += 2) {
      if (next[i + 1]) nextRound.push([next[i], next[i + 1]]);
    }
    round = nextRound;
    if (round.length === 0 && next.length === 1) break;
  }
  const finalistPairs = history[history.length - 1];
  const championName = finalistPairs?.[finalistPairs.length - 1]?.split(" → ").pop() ?? "";
  const champion = [...new Set(bracket.flat())].find(e => e.name === championName) ?? bracket[0][0];
  return { champion, history };
}

export const epochalTournamentExecutor: EventExecutor<{ rankCount?: number }> = (state, args) => {
  const RANK_COUNT = args?.rankCount ?? 100;
  const candidates = pickCandidates(state);
  const heavens = buildHeavensListLocal(candidates, { combatWeight: 0.8, karmaWeight: 0.2, fameWeight: 0.02, maxEntries: RANK_COUNT });
  setHeavensListLocal(state, heavens);

  const entrants = heavens.slice(0, Math.min(16, heavens.length));
  if (entrants.length < 2) {
    state.world.flags["epochalTournament"] = "insufficient_participants";
    return state;
  }

  const bracket = buildBracket(entrants);
  const { champion, history } = runBracket(bracket, state);

  state.world.flags["epochalTournament.history"] = history as unknown as string | number | boolean;
  state.world.flags["epochalTournament.champion"] = champion.name;
  state.world.lastEpochTournamentYear = state.world.day;

  if (champion.id === "player") {
    state.player.karma = (state.player.karma || 0) + 50;
    state.player.combatPower = Math.round((state.player.combatPower || 0) * 1.1 + 50);
    state.player.reputation = { ...(state.player.reputation ?? {}), world: (state.player.reputation?.world ?? 0) + 100 };
    state.player.title = "Epoch Champion";
  } else {
    const known = (state.world.flags["knownProdigies"] as unknown as HeavensListEntry[]) ?? [];
    const idx = known.findIndex(n => n.id === champion.id);
    if (idx >= 0) known[idx] = { ...known[idx], fame: (known[idx].fame ?? 0) + 100, title: "Epoch Champion" };
    state.world.flags["knownProdigies"] = known as unknown as string | number | boolean;
  }

  // Refresh Heavens List post-tournament
  const updatedCandidates = pickCandidates(state);
  const updated = buildHeavensListLocal(updatedCandidates);
  setHeavensListLocal(state, updated);

  return state;
};

export function shouldRunEpochTournament(state: GameState): boolean {
  const last = state.world.lastEpochTournamentYear ?? 0;
  return (state.world.day - last) >= 10000;
}

// Executor: check player alignment and unlock hidden backgrounds when thresholds met
export const global_check_alignment_unlocks: EventExecutor = (state) => {
  try {
    const player = state.player as any;
    // Ensure alignment exists
    const alignment = (player.alignment && player.alignment.id) ? player.alignment.id : null;

    // If player is explicitly demonic, unlock the demonic cultivator background
    if (alignment === 'demonic') {
      // Only set if not already set
      if (!player.background || player.background.id !== 'demon_demonic_cultivator') {
        player.background = { id: 'demon_demonic_cultivator', name: 'Demonic Cultivator' } as any;
        state.story.storyFlags = state.story.storyFlags || {} as any;
        state.story.storyFlags['unlocked_demonic_cultivator'] = true;
      }
      return state;
    }

    // If player has axes and high ruthlessness, also unlock as a fallback
    const axes = (player.alignment && player.alignment.axes) ? player.alignment.axes : null;
    if (axes && (axes.ruthlessness || 0) >= 60) {
      if (!player.background || player.background.id !== 'demon_demonic_cultivator') {
        player.background = { id: 'demon_demonic_cultivator', name: 'Demonic Cultivator' } as any;
        state.story.storyFlags = state.story.storyFlags || {} as any;
        state.story.storyFlags['unlocked_demonic_cultivator'] = true;
      }
    }
  } catch (e) {
    // ignore errors, non-critical
  }
  return state;
};

// Combined unlock executor using alignmentUnlocks mapping
import { checkAndApplyAlignmentUnlocks } from '../../systems/alignmentUnlocks';

export const global_alignment_unlocks_combined: EventExecutor = (state) => {
  try {
    state.story = state.story || {} as any;
    state.story.storyFlags = state.story.storyFlags || {} as any;
    const player = state.player as any;
    const unlocked = checkAndApplyAlignmentUnlocks(player, state.story.storyFlags);
    if (unlocked && unlocked.length > 0) {
      // optional: add to world flags for analytics
      state.world = state.world || {} as any;
      state.world.flags = state.world.flags || {} as any;
      state.world.flags['alignmentUnlocks.last'] = unlocked.slice();
    }
  } catch (e) {
    // ignore
  }
  return state;
};
