"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HeavenlyDaoSystem_1 = require("../systems/HeavenlyDaoSystem");
const NarrativeEngine_1 = require("../systems/NarrativeEngine");
describe('HeavenlyDaoSystem reversal techniques', () => {
    it('applies Reverse Pulse Sutra healing or backlash', () => {
        const engine = new NarrativeEngine_1.NarrativeEngine();
        const s = new HeavenlyDaoSystem_1.HeavenlyDaoSystem(engine);
        const player = { hp: 40, maxHp: 100, daoHeart: 10, daoComprehension: 0, activeBuffs: [] };
        // run multiple times to exercise both success and failure paths
        let sawSuccess = false;
        let sawFail = false;
        for (let i = 0; i < 20; i++) {
            // copy player so we can observe net changes
            const p = { ...player };
            const res = s.applyTechnique(p, 'reverse_pulse_sutra');
            if (res.ok && res.healed)
                sawSuccess = true;
            if (!res.ok && res.backlash)
                sawFail = true;
            if (sawSuccess && sawFail)
                break;
        }
        expect(sawSuccess).toBe(true);
        expect(sawFail).toBe(true);
    });
    it('applies Still Flow Meditation buff and increases comprehension', () => {
        const engine = new NarrativeEngine_1.NarrativeEngine();
        const s = new HeavenlyDaoSystem_1.HeavenlyDaoSystem(engine);
        const player = { hp: 80, maxHp: 120, daoHeart: 20, daoComprehension: 3, activeBuffs: [] };
        const res = s.applyTechnique(player, 'still_flow_meditation');
        expect(res.ok).toBe(true);
        expect(player.daoComprehension).toBeGreaterThanOrEqual(8);
        expect(Array.isArray(player.activeBuffs)).toBe(true);
        expect(player.activeBuffs.find((b) => b.id === 'still_flow_meditation')).toBeTruthy();
    });
    it('consumes dao heart for Temporal Echo', () => {
        const engine = new NarrativeEngine_1.NarrativeEngine();
        const s = new HeavenlyDaoSystem_1.HeavenlyDaoSystem(engine);
        const player = { hp: 50, maxHp: 100, daoHeart: 10, daoComprehension: 0 };
        const res = s.applyTechnique(player, 'temporal_echo');
        expect(res.ok).toBe(true);
        expect(player.daoHeart).toBeLessThan(10);
        expect(player.daoComprehension).toBeGreaterThanOrEqual(1);
    });
});
