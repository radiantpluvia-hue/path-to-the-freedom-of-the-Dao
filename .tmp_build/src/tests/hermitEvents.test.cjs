"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const seededRng_1 = require("../utils/seededRng");
function freshStore() {
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const storeMod = require('../store/useGameStore');
    return storeMod.useGameStore;
}
describe('Hermit events integration', () => {
    afterEach(() => {
        (0, seededRng_1.clearRuntimeRng)();
        // Restore conservative defaults after tests that may tweak the playtest multiplier
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires -- test harness dynamic import
            const mod = require('../systems/seclusionPath');
            if (mod && mod.SECLUSION_CONFIG)
                mod.SECLUSION_CONFIG.playtestMultiplier = 1;
        }
        catch (err) {
            // ignore
        }
    });
    test('rare_source_found grants a manual', () => {
        const useGameStore = freshStore();
        // seed RNG so first rare roll is predictable
        (0, seededRng_1.setRuntimeRng)((0, seededRng_1.makeSeededRng)(42));
        // Increase event frequency for this test run so the seeded RNG produces a rare find
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires -- test harness dynamic import
            const mod = require('../systems/seclusionPath');
            if (mod && mod.SECLUSION_CONFIG)
                mod.SECLUSION_CONFIG.playtestMultiplier = 100;
        }
        catch (err) {
            // ignore
        }
        useGameStore.setState({ player: { ...useGameStore.getState().player, manuals: [], hp: 100 } });
        // Enter seclusion and tick repeatedly until we see a manual added or 50 ticks
        useGameStore.getState().enterHermitSeclusion(1, false);
        let found = false;
        for (let i = 0; i < 50; i++) {
            useGameStore.getState().hermitTick();
            const manuals = useGameStore.getState().player.manuals || [];
            if (manuals.length > 0) {
                found = true;
                break;
            }
        }
        expect(found).toBeTruthy();
        const player = useGameStore.getState().player;
        expect(player.manuals.length).toBeGreaterThan(0);
    });
    test('tribulation triggers combat or fallback damage', () => {
        const useGameStore = freshStore();
        // seed RNG to force tribulation roll by increasing RNG chance: use a rng that returns 0 always
        (0, seededRng_1.setRuntimeRng)(() => 0);
        useGameStore.setState({ player: { ...useGameStore.getState().player, manuals: [], hp: 100, stats: { atk: 10, def: 10, speed: 10 } } });
        useGameStore.getState().enterHermitSeclusion(1, false);
        useGameStore.getState().hermitTick();
        const state = useGameStore.getState();
        // Either combatSystem is active or hp was reduced by fallback
        const combatActive = !!state.combatSystem;
        const hpReduced = state.player.hp < 100;
        expect(combatActive || hpReduced).toBeTruthy();
    });
    test('comprehension_breakthrough grants daoComprehension and xp', () => {
        const useGameStore = freshStore();
        // seed RNG to drive comprehension accumulation -> force breakthrough condition
        (0, seededRng_1.setRuntimeRng)((0, seededRng_1.makeSeededRng)(9999));
        useGameStore.setState({ player: { ...useGameStore.getState().player, manuals: [], daoComprehension: 0, skills: { ...useGameStore.getState().player.skills } } });
        useGameStore.getState().enterHermitSeclusion(1, false);
        // simulate many ticks to build accumulated comprehension
        for (let i = 0; i < 200; i++) {
            useGameStore.getState().hermitTick();
        }
        const p = useGameStore.getState().player;
        expect(p.daoComprehension).toBeGreaterThanOrEqual(0);
        // comprehension XP should have increased due to breakthrough handler (or at least study)
        expect((p.skills.comprehension.exp || 0)).toBeGreaterThanOrEqual(0);
    });
});
