"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eventManager_1 = require("../systems/eventManager");
const worldState_1 = require("../systems/worldState");
describe('EventManager basic behavior', () => {
    beforeEach(() => {
        worldState_1.worldState.reset();
    });
    test('createInstance and advanceInstance work and log events', () => {
        const inst = eventManager_1.eventManager.createInstance('bandit_ambush');
        expect(inst).toBeDefined();
        const beforeLog = worldState_1.worldState.getEventLog();
        eventManager_1.eventManager.advanceInstance(inst.id, 'fight');
        const afterLog = worldState_1.worldState.getEventLog();
        expect(afterLog.length).toBeGreaterThan(beforeLog.length);
    });
    test('checkInterrupts can return an interrupt object', () => {
        // increase chance by setting chosenType stability low
        const fakeSession = { chosenType: { stability: 0.1 } };
        // Force Math.random to return a tiny value so interrupt triggers
        jest.spyOn(Math, 'random').mockReturnValue(0.001);
        const res = eventManager_1.eventManager.checkInterrupts(fakeSession);
        expect(res).not.toBeNull();
        expect(res.type).toBe('interrupt');
        Math.random.mockRestore();
    });
});
