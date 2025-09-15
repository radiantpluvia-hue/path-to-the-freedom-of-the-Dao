"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scalingSystem_1 = require("@/data/scalingSystem");
const bloodlines_1 = require("@/data/bloodlines");
const manuals_1 = require("@/data/manuals");
const mentorTeachingsLoader_1 = require("@/data/mentorTeachingsLoader");
// Simple sample realms from scaling system tiers
const realms = [
    'mortal',
    'foundation_establishment',
    'golden_immortal',
    'core_formation',
    'soul_transformation',
    'chaos_saint'
];
function pickAnyManualId() {
    return manuals_1.ALL_MANUALS[0].id;
}
function pickAnyBloodlineId() {
    return bloodlines_1.BLOODLINES[0].id;
}
describe('Realm scaling integration', () => {
    test('realm multiplier increases with higher realms', () => {
        const m1 = (0, scalingSystem_1.getRealmMultiplier)('mortal');
        const m2 = (0, scalingSystem_1.getRealmMultiplier)('golden_immortal');
        const m3 = (0, scalingSystem_1.getRealmMultiplier)('chaos_saint');
        expect(m2).toBeGreaterThan(m1);
        expect(m3).toBeGreaterThan(m2);
    });
    test('manual effects scale up with realm', () => {
        const manualId = pickAnyManualId();
        const low = (0, manuals_1.getManualByIdScaled)(manualId, 'mortal');
        const high = (0, manuals_1.getManualByIdScaled)(manualId, 'chaos_saint');
        // Check at least one numeric key scales upward if present
        const numericKeys = ['cultivationSpeed', 'qi', 'hp', 'atk', 'def', 'speed', 'insight', 'daoHeart'];
        const hasNumeric = numericKeys.some(k => typeof low.effects[k] === 'number');
        if (hasNumeric) {
            numericKeys.forEach(k => {
                if (typeof low.effects[k] === 'number') {
                    expect(high.effects[k]).toBeGreaterThan(low.effects[k]);
                }
            });
        }
    });
    test('bloodline stats scale up with realm', () => {
        const bloodlineId = pickAnyBloodlineId();
        const low = (0, bloodlines_1.getBloodlineByIdScaled)(bloodlineId, 'mortal');
        const high = (0, bloodlines_1.getBloodlineByIdScaled)(bloodlineId, 'chaos_saint');
        const statsLow = low.effects.stats;
        const statsHigh = high.effects.stats;
        Object.keys(statsLow).forEach(k => {
            const lowVal = statsLow[k];
            const highVal = statsHigh[k];
            const lowNum = typeof lowVal === 'number' ? lowVal : (lowVal && lowVal.base) ? lowVal.base : NaN;
            const highNum = typeof highVal === 'number' ? highVal : (highVal && highVal.base) ? highVal.base : NaN;
            if (!Number.isNaN(lowNum) && !Number.isNaN(highNum)) {
                expect(highNum).toBeGreaterThanOrEqual(lowNum);
            }
        });
    });
    test('mentor teaching rewards scale conservatively with realm', () => {
        const mentorId = 'fang_yuan';
        const teachings = mentorTeachingsLoader_1.mentorTeachingsLoader.getTeachingsForMentor(mentorId);
        expect(teachings.length).toBeGreaterThan(0);
        const first = teachings[0];
        const low = mentorTeachingsLoader_1.mentorTeachingsLoader.getTeachingByIdScaled(first.id, 'mortal');
        const high = mentorTeachingsLoader_1.mentorTeachingsLoader.getTeachingByIdScaled(first.id, 'chaos_saint');
        for (const key of Object.keys(first.reward || {})) {
            const v = first.reward[key];
            if (typeof v === 'number' && v > 1) {
                expect(high.reward[key]).toBeGreaterThanOrEqual(low.reward[key]);
            }
            if (typeof v === 'number' && v <= 1) {
                // Coefficients should remain unchanged
                expect(high.reward[key]).toBeCloseTo(low.reward[key]);
            }
        }
    });
});
