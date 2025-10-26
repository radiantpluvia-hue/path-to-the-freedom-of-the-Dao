"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const npcManager_1 = require("../systems/npcManager");
const worldState_1 = require("../systems/worldState");
describe('NPC Manager progression', () => {
    beforeEach(() => { worldState_1.worldState.reset(); });
    test('npcs load from template and progress to breakthrough', () => {
        const list = npcManager_1.npcManager.listNPCs();
        expect(list.length).toBeGreaterThan(0);
        // fast-forward a single NPC to breakthrough
        const events = npcManager_1.npcManager.tickNPCs(1000 * 100); // large dt to ensure progress >= 100
        expect(events.length).toBeGreaterThanOrEqual(1);
        const log = worldState_1.worldState.getEventLog();
        expect(log.find((e) => e.type === 'npcBreakthrough')).toBeDefined();
    });
});
