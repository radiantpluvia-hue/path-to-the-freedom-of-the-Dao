import { logger } from '../utils/logger';

export type PlayerLike = any;

export interface PassiveHookEntry {
  id: string;
  fn?: (...args: any[]) => any; // runtime-only, not serializable
}

export interface AutoAppliedMeta {
  [passiveId: string]: Record<string, any>;
}

export const safeInc = (obj: any, path: string[], delta: number) => {
  let cur = obj as any;
  for (let i = 0; i < path.length - 1; i++) {
    const k = path[i];
    if (cur[k] == null || typeof cur[k] !== 'object') cur[k] = {};
    cur = cur[k];
  }
  const leaf = path[path.length - 1];
  const prev = Number(cur[leaf] || 0);
  cur[leaf] = prev + delta;
};

export const applyStatDeltas = (player: PlayerLike, passiveId: string, deltas: Record<string, number>) => {
  player._autoApplied = { ...(player._autoApplied || {}) } as AutoAppliedMeta;
  if (player._autoApplied[passiveId]) return; // idempotent
  player._autoApplied[passiveId] = { ...(deltas || {}) };
  Object.keys(deltas || {}).forEach((k) => {
    // apply to stats if path matches
    if (k === 'cultivationSpeed') {
      safeInc(player, ['stats', 'cultivationSpeed'], deltas[k]);
    } else if (['atk', 'def', 'speed'].includes(k)) {
      safeInc(player, ['stats', k], deltas[k]);
    } else {
      // store other numeric fields directly
      safeInc(player, [k], deltas[k]);
    }
  });
};

export const revertStatDeltas = (player: PlayerLike, passiveId: string) => {
  if (!(player._autoApplied && player._autoApplied[passiveId])) return;
  const applied = player._autoApplied[passiveId] || {};
  Object.keys(applied).forEach((k) => {
    const v = applied[k];
    if (k === 'cultivationSpeed') {
      safeInc(player, ['stats', 'cultivationSpeed'], -v);
    } else if (['atk', 'def', 'speed'].includes(k)) {
      safeInc(player, ['stats', k], -v);
    } else {
      safeInc(player, [k], -v);
    }
  });
  delete player._autoApplied[passiveId];
  if (player._autoApplied && Object.keys(player._autoApplied).length === 0) delete player._autoApplied;
};

export const addHook = (player: PlayerLike, event: string, id: string, fn?: (...args: any[]) => any) => {
  player._passiveHooks = { ...(player._passiveHooks || {}) };
  const list = player._passiveHooks[event] || [];
  // avoid adding duplicate id entries
  if (list.some((it: any) => it.id === id)) return;
  player._passiveHooks[event] = [...list, { id, fn }];
};

export const removeHook = (player: PlayerLike, event: string, id: string) => {
  if (!(player._passiveHooks && Array.isArray(player._passiveHooks[event]))) return;
  player._passiveHooks[event] = player._passiveHooks[event].filter((h: any) => h.id !== id);
  if (player._passiveHooks[event].length === 0) delete player._passiveHooks[event];
  if (Object.keys(player._passiveHooks).length === 0) delete player._passiveHooks;
};

export const devSafe = (fn: (...args: any[]) => any) => {
  return (...args: any[]) => {
    try {
      return fn(...args);
    } catch (e) {
      const err = e as any;
      const msg = err && (err.stack || err.message) ? (err.stack || err.message) : String(err);
      logger.warn('Passive hook error:', msg);
    }
  };
};
