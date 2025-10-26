"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eventManager_1 = require("../systems/eventManager");
const worldState_1 = require("../systems/worldState");
describe('Event chain persistence & advancement', () => {
    beforeEach(() => { worldState_1.worldState.reset(); });
    test('create bandit chain instance and advance through steps', () => {
        const inst = eventManager_1.eventManager.createInstance('bandit_ambush');
        expect(inst).toBeDefined();
        const instances = eventManager_1.eventManager.getInstances();
        expect(instances.find((i) => i.id === inst.id)).toBeDefined();
        // advance twice to progress through the chain
        eventManager_1.eventManager.advanceInstance(inst.id, 'fight');
        eventManager_1.eventManager.advanceInstance(inst.id, 'pursue');
        const instAfter = eventManager_1.eventManager.getInstances().find((i) => i.id === inst.id);
        expect(instAfter).toBeDefined();
        expect(instAfter.state.step).toBeGreaterThanOrEqual(2);
    });
});
