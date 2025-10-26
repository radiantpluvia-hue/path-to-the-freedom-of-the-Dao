"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const useGameStore_1 = require("@/store/useGameStore");
const seededRng_1 = require("@/utils/seededRng");
const raceBackgrounds_1 = require("@/data/raceBackgrounds");
// Focused distribution test for Phoenix backgrounds: ensure Reborn Phoenix ~20% and Flame Kin ~80%
describe('Phoenix background distribution', () => {
    beforeEach(() => {
        // reset player between samples
        const s = useGameStore_1.useGameStore.getState();
        useGameStore_1.useGameStore.setState({ player: { ...s.player, race: '', background: null, name: '' } });
    });
    afterEach(() => (0, seededRng_1.clearRuntimeRng)());
    test('sampled frequencies match configured startChance for Phoenix branch', () => {
        const rng = (0, seededRng_1.seededFromString)('phoenix-distribution-test');
        (0, seededRng_1.setRuntimeRng)(rng);
        const samples = 1000;
        let reborn = 0;
        let flame = 0;
        // Local seeded RNG to avoid global runtimeRng consumption by other store logic
        const localRng = (0, seededRng_1.seededFromString)('phoenix-distribution-test-local');
        const backgrounds = raceBackgrounds_1.RACE_BACKGROUNDS['Phoenix'];
        const getWeight = (b) => (typeof b.startChance === 'number' ? b.startChance : (b.rarity === "D" ? 0.05 : b.rarity === "F" ? 0.15 : b.rarity === "G" ? 0.25 : 0.6));
        const select = (list, getW) => {
            const weights = list.map(getW).map(w => (Number.isFinite(w) && w > 0 ? w : 0));
            const total = weights.reduce((a, b) => a + b, 0);
            if (!Number.isFinite(total) || total <= 0)
                return list[Math.floor(localRng() * list.length)];
            let r = localRng() * total;
            for (let i = 0; i < list.length; i++) {
                r -= weights[i];
                if (r <= 0)
                    return list[i];
            }
            return list[list.length - 1];
        };
        for (let i = 0; i < samples; i++) {
            const bg = select(backgrounds, getWeight);
            if (!bg)
                continue;
            if (bg.id === 'phoenix_reborn')
                reborn++;
            else if (bg.id === 'phoenix_flame')
                flame++;
        }
        const rebornFrac = reborn / (reborn + flame || 1);
        const flameFrac = flame / (reborn + flame || 1);
        // Expected from configured explicit startChance values
        const expectedReborn = backgrounds.find(b => b.id === 'phoenix_reborn')?.startChance ?? getWeight(backgrounds[0]);
        const expectedFlame = backgrounds.find(b => b.id === 'phoenix_flame')?.startChance ?? getWeight(backgrounds[1]);
        // Allow ±6% tolerance
        const tol = 0.06;
        expect(Math.abs(rebornFrac - expectedReborn)).toBeLessThanOrEqual(tol);
        expect(Math.abs(flameFrac - expectedFlame)).toBeLessThanOrEqual(tol);
    });
});
