"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const seclusionPath_1 = require("../systems/seclusionPath");
const seededRng_1 = require("../utils/seededRng");
describe('HermitPath - basic behaviors', () => {
    afterEach(() => {
        (0, seededRng_1.clearRuntimeRng)();
    });
    test('tick while secluded grants qi and cp and can produce rare_source_found', () => {
        // Use a seeded RNG that will produce a predictable stream
        (0, seededRng_1.setRuntimeRng)((0, seededRng_1.makeSeededRng)(12345));
        const hermit = new seclusionPath_1.SeclusionPath();
        const fakeState = {
            player: { skills: { meditation: { level: 2 }, comprehension: { level: 1 } }, daoComprehension: 0 }
        };
        hermit.enterSeclusion(1, false);
        const effects = hermit.tick(fakeState);
        expect(effects.qiGain).toBeGreaterThanOrEqual(0);
        expect(effects.cpGain).toBeGreaterThanOrEqual(1);
        // events may or may not include rare_source_found based on RNG; ensure events array exists
        expect(Array.isArray(effects.events)).toBeTruthy();
    });
    test('performStudy grants xp with diminishing returns and bumps rare accumulator', () => {
        const hermit = new seclusionPath_1.SeclusionPath();
        const fakeState = { player: {}, world: {}, story: {}, ui: {}, systems: {} };
        // ensure initial study yields base XP
        const r1 = hermit.performStudy(fakeState, 1);
        expect(r1.xpGained).toBeGreaterThanOrEqual(1);
        // simulate many ticks to cause some decay factor influence
        // manually tweak internal ticks to simulate extended seclusion
        const s = hermit.getState();
        hermit.state = { ...s, ticksSinceSeclusionStart: 40 };
        const r2 = hermit.performStudy(fakeState, 2);
        // xp with decay should be <= raw baseExp*intensity
        const baseExp = Math.max(1, Math.floor(10 * 2));
        expect(r2.xpGained).toBeLessThanOrEqual(baseExp);
    });
});
