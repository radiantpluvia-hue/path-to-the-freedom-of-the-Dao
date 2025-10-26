"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const useGameStore_1 = require("@/store/useGameStore");
const seededRng_1 = require("@/utils/seededRng");
// Tight deterministic tests for finalizeCharacterCreation's weighted race selection
describe('character creation race/background selection', () => {
    beforeEach(() => {
        const s = useGameStore_1.useGameStore.getState();
        useGameStore_1.useGameStore.setState({ player: { ...s.player, race: '', background: null, name: '' } });
    });
    afterEach(() => {
        (0, seededRng_1.clearRuntimeRng)();
    });
    test('finalizeCharacterCreation picks Human when runtimeRng < 0.8', () => {
        // Force RNG to 0.5 -> should pick Human per implementation
        (0, seededRng_1.setRuntimeRng)(() => 0.5);
        const store = useGameStore_1.useGameStore.getState();
        const ok = store.finalizeCharacterCreation({ name: 'DetTest', gender: 'Male' });
        expect(ok).toBe(true);
        const s2 = useGameStore_1.useGameStore.getState();
        expect(s2.player.race).toBe('Human');
        expect(s2.player.background).not.toBeNull();
    });
    test('finalizeCharacterCreation picks non-Human when runtimeRng >= 0.8', () => {
        // Force RNG sequence: first call to decide race should be >= 0.8
        // Provide an RNG that returns 0.85 for the first call, then 0.0 for any subsequent calls
        let called = 0;
        (0, seededRng_1.setRuntimeRng)(() => (called++ === 0 ? 0.85 : 0.0));
        const store = useGameStore_1.useGameStore.getState();
        const ok = store.finalizeCharacterCreation({ name: 'DetTest2', gender: 'Female' });
        expect(ok).toBe(true);
        const s2 = useGameStore_1.useGameStore.getState();
        expect(s2.player.race).toBeDefined();
        expect(s2.player.race).not.toBe('Human');
        expect(s2.player.background).not.toBeNull();
    });
    test('distribution over many samples approximates 80/20 (seeded RNG)', () => {
        // Use a seeded RNG with deterministic sequence; sample N times and assert Human fraction within +/-5%
        const seedRng = (0, seededRng_1.seededFromString)('char-dist-test');
        (0, seededRng_1.setRuntimeRng)(seedRng);
        const samples = 200; // enough to get stable-ish proportions for unit test
        let humanCount = 0;
        for (let i = 0; i < samples; i++) {
            // reset player before each creation to force random selection
            const s = useGameStore_1.useGameStore.getState();
            useGameStore_1.useGameStore.setState({ player: { ...s.player, race: '', background: null, name: '' } });
            const ok = useGameStore_1.useGameStore.getState().finalizeCharacterCreation({ name: `P${i}`, gender: 'Male' });
            expect(ok).toBe(true);
            const st = useGameStore_1.useGameStore.getState();
            if (st.player.race === 'Human')
                humanCount++;
        }
        const frac = humanCount / samples;
        // Acceptable tolerance: +/-5% of 0.8 => [0.75, 0.85]
        expect(frac).toBeGreaterThanOrEqual(0.75);
        expect(frac).toBeLessThanOrEqual(0.85);
    });
});
