"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eraManager_1 = require("@/era/eraManager");
describe('reincarnation guard', () => {
    test('cannot reincarnate to earlier era via manager', () => {
        const world = { currentEraIndex: 3 };
        const gs = { player: { name: 'p' }, world, story: {} };
        // sameEra is allowed and should not throw
        expect(() => eraManager_1.eraManager.attemptReincarnation(gs, { sameEra: true, seed: 'x' })).not.toThrow();
        // direct to earlier index should throw
        gs.world.currentEraIndex = 5;
        expect(() => eraManager_1.eraManager.reincarnateToIndex(gs, 4, 'x')).toThrow('Cannot reincarnate into an earlier era');
    });
});
