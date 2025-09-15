import { EventExecutor, GameState, HeavensListEntry } from "../../../utils/types";
import { buildHeavensList, setHeavensList } from '@/systems';

function rng(state: GameState, min: number, max: number) {
  return state.rng ? state.rng(min, max) : (Math.random() * (max - min) + min);
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
  const aRoll = a.combatPower + rng(state, -0.05, 0.05) * a.combatPower + (a.karma * 0.01);
  const bRoll = b.combatPower + rng(state, -0.05, 0.05) * b.combatPower + (b.karma * 0.01);
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
  const heavens = buildHeavensList(candidates, { combatWeight: 0.8, karmaWeight: 0.2, fameWeight: 0.02, maxEntries: RANK_COUNT });
  setHeavensList(state, heavens);

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
  const updated = buildHeavensList(updatedCandidates);
  setHeavensList(state, updated);

  return state;
};

export function shouldRunEpochTournament(state: GameState): boolean {
  const last = state.world.lastEpochTournamentYear ?? 0;
  return (state.world.day - last) >= 10000;
}
