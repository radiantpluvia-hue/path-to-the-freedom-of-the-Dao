"use strict";
// Lightweight WorldState implementation for Path to Dao features
// Minimal, data-driven, serializable store for world variables used by EventManager and MeditationSubsystem.
Object.defineProperty(exports, "__esModule", { value: true });
exports.worldState = void 0;
const DEFAULT_TIME = {
    timestamp: Date.now(),
    day: 0,
    hour: 8,
    season: 'spring',
    moonPhase: 'waxing'
};
const DEFAULT_STATE = {
    qiMap: {
        'central': { regionId: 'central', qiDensity: 50, corrupted: false, auraType: null },
        'north': { regionId: 'north', qiDensity: 30, corrupted: false, auraType: null },
    },
    time: DEFAULT_TIME,
    era: 'AgeOfBeginnings',
    eventLog: [],
    rumors: [],
    eventInstances: []
};
let _state = JSON.parse(JSON.stringify(DEFAULT_STATE));
exports.worldState = {
    getState() {
        // return shallow clone to avoid accidental mutation
        return JSON.parse(JSON.stringify(_state));
    },
    load(serialized) {
        try {
            _state = JSON.parse(JSON.stringify(serialized || DEFAULT_STATE));
        }
        catch (e) {
            _state = JSON.parse(JSON.stringify(DEFAULT_STATE));
        }
    },
    reset() {
        _state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    },
    applyMutation(mutation) {
        // Apply mutation to internal state and return a snapshot for logging
        const before = JSON.parse(JSON.stringify(_state));
        try {
            mutation(_state);
        }
        catch (e) {
            // Mutation failed; do not partially apply
            _state = before;
            throw e;
        }
        return JSON.parse(JSON.stringify(_state));
    },
    // QiMap helpers
    getRegion(regionId) {
        return _state.qiMap[regionId] ? JSON.parse(JSON.stringify(_state.qiMap[regionId])) : null;
    },
    setRegion(region) {
        _state.qiMap[region.regionId] = JSON.parse(JSON.stringify(region));
        return this.getRegion(region.regionId);
    },
    mutateRegion(regionId, mutator) {
        if (!_state.qiMap[regionId])
            throw new Error('region not found');
        const before = JSON.parse(JSON.stringify(_state.qiMap[regionId]));
        try {
            mutator(_state.qiMap[regionId]);
        }
        catch (e) {
            _state.qiMap[regionId] = before;
            throw e;
        }
        return this.getRegion(regionId);
    },
    // Time helpers
    advanceTime(ms) {
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
    pushEvent(entry) {
        const e = { ...entry, time: entry.time || Date.now() };
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
    pushEventInstance(inst) {
        _state.eventInstances = _state.eventInstances || [];
        _state.eventInstances.push(JSON.parse(JSON.stringify(inst)));
        return inst;
    },
    updateEventInstance(instanceId, mutator) {
        _state.eventInstances = _state.eventInstances || [];
        const idx = _state.eventInstances.findIndex(e => e.id === instanceId);
        if (idx < 0)
            throw new Error('instance not found');
        const before = JSON.parse(JSON.stringify(_state.eventInstances[idx]));
        try {
            mutator(_state.eventInstances[idx]);
        }
        catch (e) {
            _state.eventInstances[idx] = before;
            throw e;
        }
        return JSON.parse(JSON.stringify(_state.eventInstances[idx]));
    },
    // Rumors
    postRumor(rumor) {
        _state.rumors.push({ ...rumor });
        return rumor;
    },
    getRumors() {
        return JSON.parse(JSON.stringify(_state.rumors));
    }
};
