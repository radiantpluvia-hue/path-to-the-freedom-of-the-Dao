"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rarity_1 = require("@/config/rarity");
const weightedSampling_1 = require("@/utils/weightedSampling");
const seededRng_1 = require("@/utils/seededRng");
describe('RARITY_WEIGHTS sampling distribution (deterministic)', () => {
    test('sampling frequencies roughly match configured weights', () => {
        const entries = Object.keys(rarity_1.RARITY_WEIGHTS).map(k => ({ id: k, weight: rarity_1.RARITY_WEIGHTS[k] }));
        const counts = {};
        Object.keys(rarity_1.RARITY_WEIGHTS).forEach(k => counts[k] = 0);
        const draws = 500;
        for (let i = 0; i < draws; i++) {
            const picked = (0, weightedSampling_1.selectFromWeightedList)(entries, (it) => it.weight, seededRng_1.runtimeRng);
            if (picked)
                counts[picked.id]++;
        }
        // Normalize frequencies and ensure ordering by weight (higher weight -> more picks)
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        const sortedWeights = Object.entries(rarity_1.RARITY_WEIGHTS).sort((a, b) => b[1] - a[1]);
        // Check that the highest-weight rarity is the top picked
        expect(sorted[0][0]).toBe(sortedWeights[0][0]);
        // Check rough proportions: each weight's fraction should be within a small tolerance
        const totalWeight = Object.values(rarity_1.RARITY_WEIGHTS).reduce((s, n) => s + n, 0);
        Object.entries(rarity_1.RARITY_WEIGHTS).forEach(([k, w]) => {
            const expectedFrac = w / totalWeight;
            const observedFrac = counts[k] / draws;
            // Allow 10% absolute tolerance for small sample sizes
            expect(Math.abs(observedFrac - expectedFrac)).toBeLessThanOrEqual(0.10);
        });
    });
});
