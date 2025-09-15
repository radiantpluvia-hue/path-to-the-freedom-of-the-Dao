"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mentorTeachingsLoader_1 = require("@/data/mentorTeachingsLoader");
describe('Mentor reward deep scaling', () => {
    test('nested numeric fields scale while coefficients <= 1 remain', () => {
        const mentorId = 'fang_yuan';
        const teachings = mentorTeachingsLoader_1.mentorTeachingsLoader.getTeachingsForMentor(mentorId);
        expect(teachings.length).toBeGreaterThan(0);
        const t = teachings.find(tt => typeof (tt.reward?.qi) === 'number') || teachings[0];
        const low = mentorTeachingsLoader_1.mentorTeachingsLoader.getTeachingByIdScaled(t.id, 'mortal');
        const high = mentorTeachingsLoader_1.mentorTeachingsLoader.getTeachingByIdScaled(t.id, 'chaos_saint');
        // top-level numeric > 1
        Object.entries(t.reward || {}).forEach(([k, v]) => {
            if (typeof v === 'number' && v > 1) {
                expect(high.reward[k]).toBeGreaterThanOrEqual(low.reward[k]);
            }
            if (typeof v === 'number' && v <= 1) {
                expect(high.reward[k]).toBeCloseTo(low.reward[k]);
            }
        });
        // nested example if present
        const nested = t.reward?.spiritStones;
        if (nested && typeof nested === 'object') {
            const lowNested = low.reward.spiritStones;
            const highNested = high.reward.spiritStones;
            Object.entries(nested).forEach(([k, v]) => {
                if (typeof v === 'number' && v > 1) {
                    expect(highNested[k]).toBeGreaterThanOrEqual(lowNested[k]);
                }
                if (typeof v === 'number' && v <= 1) {
                    expect(highNested[k]).toBeCloseTo(lowNested[k]);
                }
            });
        }
    });
});
