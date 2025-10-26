import type { GameState } from '@/types';

export type Objective = {
  id: string;
  type:
    | 'REACH_REALM'
    | 'HAVE_STAT'
    | 'COMPLETE_TASKS'
    | 'GATHER_RESOURCES'
    | 'WIN_DUEL'
    | 'GAIN_ALLIES'
    | 'DEFEAT_ENEMY'
    | 'COMPLETE_MISSION'
    | 'EXPLORE';
  description?: string;
  target: string;
  value: number | string;
  isCompleted?: boolean;
};

export type ObjectiveResult = {
  progress: number; // 0..1
  isCompleted: boolean;
  message?: string;
};

function getRealmKey(gs: GameState): string {
  try {
    const realm = (gs.player as any).realm;
    if (typeof realm === 'string') return realm;
  } catch (e) { void e; }
  return 'mortal';
}

function clamp01(n: number): number { return Math.max(0, Math.min(1, n)); }

// Handlers for objective types referenced by Acts 1–4
const REACH_REALM = (gs: GameState, obj: Objective): ObjectiveResult => {
  const want = String(obj.value || '').toLowerCase().replace(/\s+/g, '_');
  const have = getRealmKey(gs).toLowerCase();
  const done = have === want;
  return { progress: done ? 1 : 0, isCompleted: done };
};

const HAVE_STAT = (gs: GameState, obj: Objective): ObjectiveResult => {
  const targetKey = String(obj.target || '');
  const req = Number(obj.value) || 0;
  const have = Number((gs.player as any)[targetKey]) || 0;
  const progress = clamp01(have / (req || 1));
  return { progress, isCompleted: have >= req };
};

const COMPLETE_TASKS = (gs: GameState, obj: Objective): ObjectiveResult => {
  // Generic placeholder: count tasksCompleted in story flags or player stats if present
  const req = Number(obj.value) || 1;
  const have = Number((gs.story?.storyFlags || {}).tasksCompleted || (gs.player as any).tasksCompleted || 0);
  const progress = clamp01(have / req);
  return { progress, isCompleted: have >= req };
};

const GATHER_RESOURCES = (gs: GameState, obj: Objective): ObjectiveResult => {
  const req = Number(obj.value) || 1;
  const haveStones = ((gs.player.spiritStones?.low || 0) + (gs.player.spiritStones?.mid || 0) * 10 + (gs.player.spiritStones?.high || 0) * 100);
  const haveYuan = Number(gs.player.yuan || 0);
  const have = haveStones + haveYuan; // simplistic aggregation
  const progress = clamp01(have / req);
  return { progress, isCompleted: have >= req };
};

const WIN_DUEL = (gs: GameState, obj: Objective): ObjectiveResult => {
  const req = Number(obj.value) || 1;
  const wins = Number((gs.story?.storyFlags || {}).duelWins || 0);
  return { progress: clamp01(wins / req), isCompleted: wins >= req };
};

const GAIN_ALLIES = (gs: GameState, obj: Objective): ObjectiveResult => {
  const req = Number(obj.value) || 1;
  const allies = Number((gs.story?.storyFlags || {}).allyCount || 0);
  return { progress: clamp01(allies / req), isCompleted: allies >= req };
};

const DEFEAT_ENEMY = (gs: GameState, obj: Objective): ObjectiveResult => {
  const req = Number(obj.value) || 1;
  const kills = Number((gs.story?.storyFlags || {}).enemiesDefeated || 0);
  return { progress: clamp01(kills / req), isCompleted: kills >= req };
};

const COMPLETE_MISSION = (gs: GameState, obj: Objective): ObjectiveResult => {
  const req = Number(obj.value) || 1;
  const comps = Number((gs.story?.storyFlags || {}).missionsCompleted || 0);
  return { progress: clamp01(comps / req), isCompleted: comps >= req };
};

const EXPLORE = (gs: GameState, obj: Objective): ObjectiveResult => {
  const loc = String(obj.value || '').toLowerCase();
  const last = String(gs.player.currentLocationId || '').toLowerCase();
  const done = !!loc && loc === last;
  return { progress: done ? 1 : 0, isCompleted: done };
};

export const OBJECTIVE_HANDLERS: Record<Objective['type'], (gs: GameState, obj: Objective) => ObjectiveResult> = {
  REACH_REALM,
  HAVE_STAT,
  COMPLETE_TASKS,
  GATHER_RESOURCES,
  WIN_DUEL,
  GAIN_ALLIES,
  DEFEAT_ENEMY,
  COMPLETE_MISSION,
  EXPLORE,
};

export function evaluateObjective(gs: GameState, obj: Objective): ObjectiveResult {
  const handler = OBJECTIVE_HANDLERS[obj.type];
  if (!handler) return { progress: 0, isCompleted: false };
  return handler(gs, obj);
}

export function evaluateObjectives(gs: GameState, objectives: Objective[]): { allCompleted: boolean; results: Record<string, ObjectiveResult> } {
  const results: Record<string, ObjectiveResult> = {};
  let all = true;
  for (const o of objectives) {
    const r = evaluateObjective(gs, o);
    results[o.id] = r;
    if (!r.isCompleted) all = false;
  }
  return { allCompleted: all, results };
}
