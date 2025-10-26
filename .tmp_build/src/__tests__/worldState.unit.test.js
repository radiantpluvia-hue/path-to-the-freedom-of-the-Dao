"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worldState_1 = require("../systems/worldState");
describe('worldState basic operations', () => {
    beforeEach(() => {
        worldState_1.worldState.reset();
    });
    test('default regions exist and are readable', () => {
        const s = worldState_1.worldState.getState();
        expect(s.qiMap).toBeDefined();
        expect(s.qiMap.central).toBeDefined();
        expect(s.qiMap.north).toBeDefined();
    });
    test('mutateRegion updates qiDensity and persists in snapshot', () => {
        const before = worldState_1.worldState.getRegion('central');
        expect(before).not.toBeNull();
        const updated = worldState_1.worldState.mutateRegion('central', r => { r.qiDensity = 80; r.corrupted = true; });
        expect(updated.qiDensity).toBe(80);
        const readback = worldState_1.worldState.getRegion('central');
        expect(readback.qiDensity).toBe(80);
        expect(readback.corrupted).toBe(true);
    });
    test('advanceTime adjusts hour and day', () => {
        const t1 = worldState_1.worldState.getTime();
        const later = worldState_1.worldState.advanceTime(1000 * 60 * 60 * 5); // +5 hours
        expect(later.hour).toBe((t1.hour + 5) % 24);
    });
    test('event log push and get', () => {
        const entry = worldState_1.worldState.pushEvent({ id: 'test1', type: 'demo' });
        expect(entry.id).toBe('test1');
        const log = worldState_1.worldState.getEventLog();
        expect(log.find((e) => e.id === 'test1')).toBeDefined();
    });
});
