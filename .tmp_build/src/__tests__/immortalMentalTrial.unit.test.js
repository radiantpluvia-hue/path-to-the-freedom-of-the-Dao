"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const immortalEmperorConsciousness_1 = require("@/systems/immortalEmperorConsciousness");
describe('Immortal mental-world trial', () => {
    test('passing trial increases consciousness and unlocks a memory', () => {
        const c = (0, immortalEmperorConsciousness_1.createSampleConsciousnessFor)('Test Emperor', 'Trial Era');
        c.consciousnessLevel = 0.2;
        const result = c.mentalWorldTrial(200);
        expect(result.passed).toBe(true);
        expect(typeof result.description).toBe('string');
        expect(result.memory).toBeTruthy();
        expect(c.consciousnessLevel).toBeGreaterThanOrEqual(0.2);
    });
    test('failing trial returns backlash', () => {
        const c = (0, immortalEmperorConsciousness_1.createSampleConsciousnessFor)('Test Emperor', 'Trial Era');
        c.consciousnessLevel = 0.9;
        const result = c.mentalWorldTrial(10);
        expect(result.passed).toBe(false);
        expect(result.backlash).toBeGreaterThan(0);
    });
});
