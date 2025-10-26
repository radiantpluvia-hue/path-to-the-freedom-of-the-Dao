// Lightweight internal dialogue/monologue queue (Inner Voice)
export interface Thought {
  id: string;
  speakerId: string;
  text: string;
  importance: number; // higher = more important
  tags?: string[];
  createdAt: number;
  expiresAt?: number;
}

export type ListenerFn = (thought: Thought) => void;

const queues: Map<string, Thought[]> = new Map();
const listeners: Map<string, Set<ListenerFn>> = new Map();
const queueCaps: Map<string, number> = new Map();
// Last enqueue timestamps for throttling: speakerId -> eventKey -> timestamp
const _lastEnqueue: Map<string, Map<string, number>> = new Map();

// Configuration for auto-enqueue behavior and throttles
export interface InnerVoiceConfig {
  autoEnqueue?: {
    breakthrough?: boolean;
    comprehension?: boolean;
    combatNearDeath?: boolean;
  };
  throttleWindows?: { [eventKey: string]: number }; // ms
}

let _config: InnerVoiceConfig = {
  autoEnqueue: { breakthrough: true, comprehension: true, combatNearDeath: true },
  throttleWindows: { breakthrough: 10_000, comprehension: 5_000, combat_near_death: 8_000 }
};

export function setInnerVoiceConfig(cfg: Partial<InnerVoiceConfig>) {
  _config = { ..._config, ...cfg } as InnerVoiceConfig;
}

export function getInnerVoiceConfig() { return _config; }

let _idCounter = 1;
function genId(prefix = 't') {
  return `${prefix}_${Date.now()}_${_idCounter++}`;
}

const DEFAULT_CAP = 10;

function nowMs() { return Date.now(); }

function ensureQueue(speakerId: string) {
  if (!queues.has(speakerId)) queues.set(speakerId, []);
  if (!queueCaps.has(speakerId)) queueCaps.set(speakerId, DEFAULT_CAP);
}

export function setQueueCap(speakerId: string, cap: number) {
  queueCaps.set(speakerId, cap);
}

export function enqueueThought(speakerId: string, text: string, opts?: { importance?: number; tags?: string[]; ttlMs?: number }): string {
  ensureQueue(speakerId);
  const importance = opts?.importance ?? 1;
  const createdAt = nowMs();
  const expiresAt = opts?.ttlMs ? createdAt + opts.ttlMs : undefined;
  const thought: Thought = { id: genId('thought'), speakerId, text, importance, tags: opts?.tags, createdAt, expiresAt };

  const q = queues.get(speakerId);
  if (!q) throw new Error('Internal: queue missing for ' + speakerId);
  const cap = queueCaps.get(speakerId) ?? DEFAULT_CAP;

  // purge expired
  while (q.length) {
    const first = q[0];
    if (first.expiresAt && first.expiresAt <= nowMs()) q.shift();
    else break;
  }

  if (q.length >= cap) {
    // drop lowest importance if new one is higher
    let lowestIdx = 0;
    for (let i = 1; i < q.length; i++) {
      if (q[i].importance < q[lowestIdx].importance) lowestIdx = i;
    }
    if (importance > q[lowestIdx].importance) {
      q.splice(lowestIdx, 1);
      q.push(thought);
    } else {
      // otherwise drop the incoming thought
      return thought.id;
    }
  } else {
    q.push(thought);
  }

  // notify listeners: both speaker-specific and global '*'
  const notify = (set?: Set<ListenerFn>) => set && set.forEach(fn => { try { fn(thought); } catch (e) {/* swallow */} });
  notify(listeners.get(speakerId));
  notify(listeners.get('*'));

  return thought.id;
}

// Centralized enqueue with auto-enqueue config and throttling by eventKey
export function enqueueThoughtAuto(eventKey: string, speakerId: string, text: string, opts?: { importance?: number; tags?: string[]; ttlMs?: number }): string | null {
  try {
    // Respect auto-enqueue flags
    const ae = _config.autoEnqueue || {};
    if (eventKey === 'breakthrough' && ae.breakthrough === false) return null;
    if (eventKey === 'comprehension' && ae.comprehension === false) return null;
    if ((eventKey === 'combat_near_death' || eventKey === 'combat') && ae.combatNearDeath === false) return null;

    // Throttle check
    const throttleMs = (_config.throttleWindows && _config.throttleWindows[eventKey]) || 0;
      if (throttleMs > 0) {
        if (!_lastEnqueue.has(speakerId)) _lastEnqueue.set(speakerId, new Map());
        const per = _lastEnqueue.get(speakerId);
        if (!per) throw new Error('Internal: per missing');
        const last = per.get(eventKey) || 0;
        const now = Date.now();
        if (now - last < throttleMs) return null; // suppressed
        per.set(eventKey, now);
      }

    return enqueueThought(speakerId, text, opts);
  } catch (e) {
    return null;
  }
}

export function peekThoughts(speakerId: string, max = 10): Thought[] {
  ensureQueue(speakerId);
  const q = queues.get(speakerId) || [];
  const now = nowMs();
  // return non-expired slice
  return q.filter(t => !t.expiresAt || t.expiresAt > now).slice(0, max);
}

export function consumeThoughts(speakerId: string, max = 10): Thought[] {
  ensureQueue(speakerId);
  const q = queues.get(speakerId);
  if (!q) return [];
  const now = nowMs();
  const out: Thought[] = [];
  while (out.length < max && q.length) {
    const t = q.shift();
    if (!t) continue;
    if (t.expiresAt && t.expiresAt <= now) continue; // skip expired
    out.push(t);
  }
  return out;
}

export function registerListener(speakerIdOrGlobal: string|'*', cb: ListenerFn): () => void {
  const key = speakerIdOrGlobal;
  if (!listeners.has(key)) listeners.set(key, new Set());
  const set = listeners.get(key);
  if (!set) throw new Error('Internal: listener set missing');
  set.add(cb);
  return () => { set.delete(cb); };
}

export function clearThoughts(speakerId?: string) {
  if (speakerId) queues.set(speakerId, []);
  else queues.clear();
}

export function getQueueLength(speakerId: string): number {
  ensureQueue(speakerId);
  const q = queues.get(speakerId);
  return q ? q.length : 0;
}

// Expose for debugging
export const _internal = { queues, listeners };

// Persistence helpers: snapshot and restore (conservative shape)
export interface InnerVoiceSnapshot {
  queues: { [speakerId: string]: Thought[] };
  caps?: { [speakerId: string]: number };
}

export function getInnerVoiceSnapshot(): InnerVoiceSnapshot {
  const obj: InnerVoiceSnapshot = { queues: {}, caps: {} };
  queues.forEach((q, speakerId) => {
    // Serialize only non-expired thoughts
    const now = nowMs();
    obj.queues[speakerId] = q.filter(t => !t.expiresAt || t.expiresAt > now).map(t => ({ ...t }));
  });
  const caps = obj.caps ?? (obj.caps = {});
  queueCaps.forEach((cap, speakerId) => { caps[speakerId] = cap; });
  if (Object.keys(caps).length === 0) delete obj.caps;
  return obj;
}

export function loadInnerVoiceSnapshot(snapshot?: InnerVoiceSnapshot | null) {
  // Defensive: if snapshot missing, do nothing
  if (!snapshot || typeof snapshot !== 'object' || !snapshot.queues) return;
  // Replace existing queues conservatively
  queues.clear();
  Object.keys(snapshot.queues).forEach(speakerId => {
    const arr = Array.isArray(snapshot.queues[speakerId]) ? snapshot.queues[speakerId].map(t => ({ ...t })) : [];
    queues.set(speakerId, arr);
  });
  // Restore caps if present
  queueCaps.clear();
  const caps = snapshot.caps;
  if (caps && typeof caps === 'object') {
    Object.keys(caps).forEach(sid => { queueCaps.set(sid, caps[sid]); });
  }
}
