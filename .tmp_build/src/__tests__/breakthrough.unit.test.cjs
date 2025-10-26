"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const breakthroughChallenge_1 = require("../systems/breakthroughChallenge");
describe('BreakthroughChallenge probability', () => {
    test('computeChance respects modifiers and stance bonuses', () => {
        const base = 0.3;
        const c1 = breakthroughChallenge_1.breakthroughChallenge.computeChance(base, { stance: 'Focus', physiqueModifiers: 0.02, worldModifiers: 0.01 });
        const c2 = breakthroughChallenge_1.breakthroughChallenge.computeChance(base, { stance: 'Defy', physiqueModifiers: 0.02, worldModifiers: 0.01 });
        expect(c1).toBeGreaterThan(c2);
        expect(c1).toBeCloseTo(0.3 + 0.05 + 0.02 + 0.01, 5);
    });
    test('attemptBreakthrough success and failure with mocked random', () => {
        // force success
        jest.spyOn(Math, 'random').mockReturnValue(0.01);
        const res = breakthroughChallenge_1.breakthroughChallenge.attemptBreakthrough(0.5, { stance: 'Flow', physiqueModifiers: 0 });
        expect(res.success).toBe(true);
        expect(res.reward).toBeDefined();
        Math.random.mockRestore();
        // force failure
        jest.spyOn(Math, 'random').mockReturnValue(0.99);
        const res2 = breakthroughChallenge_1.breakthroughChallenge.attemptBreakthrough(0.1, { stance: 'Flow' });
        expect(res2.success).toBe(false);
        expect(res2.penalty).toBeDefined();
        Math.random.mockRestore();
    });
});
