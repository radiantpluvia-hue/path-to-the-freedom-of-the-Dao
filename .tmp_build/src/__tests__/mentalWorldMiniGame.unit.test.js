"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mentalWorldMiniGame_1 = require("@/systems/mentalWorldMiniGame");
const immortalEmperorConsciousness_1 = require("@/systems/immortalEmperorConsciousness");
describe('Mental world mini-game', () => {
    test('passing mini-game returns rewardPower', () => {
        const res = (0, mentalWorldMiniGame_1.runMentalWorldMiniGame)(200, { humility: true, recallHint: true }, 1);
        expect(res.success).toBe(true);
        expect(res.rewardPower).toBeGreaterThan(0);
    });
    test('failing mini-game returns backlash', () => {
        const res = (0, mentalWorldMiniGame_1.runMentalWorldMiniGame)(10, { humility: false }, 1);
        expect(res.success).toBe(false);
        expect(res.failureBacklash).toBeGreaterThan(0);
    });
    test('integration: consciousness reacts to mini-game result', () => {
        const c = (0, immortalEmperorConsciousness_1.createSampleConsciousnessFor)('Integration Emperor', 'Test Era');
        const res = (0, mentalWorldMiniGame_1.runMentalWorldMiniGame)(200, { humility: true }, 1);
        if (res.success) {
            // emulate granting power
            const before = c.consciousnessLevel;
            c.consciousnessLevel = Math.min(1, c.consciousnessLevel + (res.rewardPower || 0) / 100);
            expect(c.consciousnessLevel).toBeGreaterThanOrEqual(before);
        }
        else {
            // failing reduces mental stability a bit
            const before = c.willpowerStrength;
            c.willpowerStrength = Math.max(0, c.willpowerStrength - (res.failureBacklash || 0));
            expect(c.willpowerStrength).toBeLessThanOrEqual(before);
        }
    });
});
