// Lightweight WorldState implementation for Path to Dao features
// Minimal, data-driven, serializable store for world variables used by EventManager and MeditationSubsystem.

export type RegionId = string;

export type QiRegion = {
  regionId: RegionId;
  qiDensity: number; // 0-100
  corrupted?: boolean;
  auraType?: string | null;
};

export type WorldTime = {
  timestamp: number; // epoch ms
  day: number; // day count
  hour: number; // 0-23
  season: 'spring'|'summer'|'autumn'|'winter';
  moonPhase: 'new'|'waxing'|'full'|'waning';
};

export type WorldEventLogEntry = {
  id: string;
  time: number;
  type: string;
  payload?: any;
};

export type EventInstance = {
  id: string;
  templateId: string;
  state?: any;
  origin?: any;
  startedAt: number;
};

export type WorldStateShape = {
  qiMap: Record<RegionId, QiRegion>;
  time: WorldTime;
  era: string;
  eventLog: WorldEventLogEntry[];
  rumors: Array<{ id: string; content: string; truthiness: number; expiry?: number }>;
  eventInstances?: EventInstance[];
  // codex stores discovered lore fragments; use any[] to avoid importing LoreFragment type and creating a circular import
  codex?: any[];
};

const DEFAULT_TIME: WorldTime = {
  timestamp: Date.now(),
  day: 0,
  hour: 8,
  season: 'spring',
  moonPhase: 'waxing'
};

const DEFAULT_STATE: WorldStateShape = {
  qiMap: {
    'central': { regionId: 'central', qiDensity: 50, corrupted: false, auraType: null },
    'north': { regionId: 'north', qiDensity: 30, corrupted: false, auraType: null },
  },
  time: DEFAULT_TIME,
  era: 'AgeOfBeginnings',
  eventLog: [],
  rumors: []
  ,eventInstances: []
};

let _state: WorldStateShape = JSON.parse(JSON.stringify(DEFAULT_STATE));

export const worldState = {
  getState(): WorldStateShape {
    // return shallow clone to avoid accidental mutation
    return JSON.parse(JSON.stringify(_state));
  },
  load(serialized: WorldStateShape) {
    try {
      _state = JSON.parse(JSON.stringify(serialized || DEFAULT_STATE));
    } catch (e) {
      _state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  },
  reset() {
    _state = JSON.parse(JSON.stringify(DEFAULT_STATE));
  },
  applyMutation(mutation: (s: WorldStateShape) => void) {
    // Apply mutation to internal state and return a snapshot for logging
    const before = JSON.parse(JSON.stringify(_state));
    try {
      mutation(_state as WorldStateShape);
    } catch (e) {
      // Mutation failed; do not partially apply
      _state = before;
      throw e;
    }
    return JSON.parse(JSON.stringify(_state));
  },
  // QiMap helpers
  getRegion(regionId: RegionId): QiRegion | null {
    return _state.qiMap[regionId] ? JSON.parse(JSON.stringify(_state.qiMap[regionId])) : null;
  },
  setRegion(region: QiRegion) {
    _state.qiMap[region.regionId] = JSON.parse(JSON.stringify(region));
    return this.getRegion(region.regionId);
  },
  mutateRegion(regionId: RegionId, mutator: (r: QiRegion) => void) {
    if (!_state.qiMap[regionId]) throw new Error('region not found');
    const before = JSON.parse(JSON.stringify(_state.qiMap[regionId]));
    try {
      mutator(_state.qiMap[regionId]);
    } catch (e) {
      _state.qiMap[regionId] = before;
      throw e;
    }
    return this.getRegion(regionId);
  },

  // Time helpers
  advanceTime(ms: number) {
    // Update timestamp
    _state.time.timestamp += ms;
    // Compute hour/day increments based on current hour to avoid inconsistencies
    const hoursToAdd = Math.floor(ms / (1000 * 60 * 60));
    const totalHours = _state.time.hour + hoursToAdd;
    const newHour = ((totalHours % 24) + 24) % 24;
    const addedDays = Math.floor(totalHours / 24);
    _state.time.hour = newHour;
    _state.time.day = _state.time.day + addedDays;
    return this.getTime();
  },
  getTime() {
    return JSON.parse(JSON.stringify(_state.time));
  },

  // Event log
  pushEvent(entry: Omit<WorldEventLogEntry, 'time'> & { time?: number }) {
    const e: WorldEventLogEntry = { ...entry as any, time: entry.time || Date.now() };
    _state.eventLog.push(e);
    return e;
  },
  getEventLog() {
    return JSON.parse(JSON.stringify(_state.eventLog));
  },

  // Event instances persistence
  getEventInstances() {
    return JSON.parse(JSON.stringify(_state.eventInstances || []));
  },
  pushEventInstance(inst: EventInstance) {
    _state.eventInstances = _state.eventInstances || [];
    _state.eventInstances.push(JSON.parse(JSON.stringify(inst)));
    return inst;
  },
  updateEventInstance(instanceId: string, mutator: (i: EventInstance)=>void) {
    _state.eventInstances = _state.eventInstances || [];
    const idx = _state.eventInstances.findIndex(e => e.id === instanceId);
    if (idx < 0) throw new Error('instance not found');
    const before = JSON.parse(JSON.stringify(_state.eventInstances[idx]));
    try {
      mutator(_state.eventInstances[idx]);
    } catch (e) {
      _state.eventInstances[idx] = before;
      throw e;
    }
    return JSON.parse(JSON.stringify(_state.eventInstances[idx]));
  },

  // Rumors
  postRumor(rumor: { id: string; content: string; truthiness: number; expiry?: number }) {
    _state.rumors.push({ ...rumor });
    return rumor;
  },
  getRumors() {
    return JSON.parse(JSON.stringify(_state.rumors));
  }
};
