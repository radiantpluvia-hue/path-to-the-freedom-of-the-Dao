"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const statTiers_1 = require("../data/statTiers");
const useGameStore_1 = require("../store/useGameStore");
describe('statTiers', () => {
    test('numericToTier maps boundaries correctly', () => {
        expect((0, statTiers_1.numericToTier)(0).id).toBe('none');
        expect((0, statTiers_1.numericToTier)(9).id).toBe('none');
        expect((0, statTiers_1.numericToTier)(10).id).toBe('foundation');
        expect((0, statTiers_1.numericToTier)(50).id).toBe('qi_condensation');
        expect((0, statTiers_1.numericToTier)(200).id).toBe('core_formation');
        expect((0, statTiers_1.numericToTier)(800).id).toBe('nascent_soul');
        expect((0, statTiers_1.numericToTier)(2500).id).toBe('heavenly_king');
        expect((0, statTiers_1.numericToTier)(8000).id).toBe('immortal');
        expect((0, statTiers_1.numericToTier)(30000).id).toBe("B");
    });
    test('tierToNumeric returns median-like representative values', () => {
        expect(typeof (0, statTiers_1.tierToNumeric)('core_formation')).toBe('number');
        expect((0, statTiers_1.tierToNumeric)('none')).toBeGreaterThanOrEqual(0);
    });
    test('tierLabelFor returns name', () => {
        expect(typeof (0, statTiers_1.tierLabelFor)(250)).toBe('string');
    });
});
describe('useGameStore visible stats', () => {
    test('getVisibleStats returns hp numeric and tier labels', () => {
        const store = useGameStore_1.useGameStore.getState();
        // Set known numeric values
        useGameStore_1.useGameStore.setState({ player: { ...store.player, hp: 500, maxHp: 1000, stats: { ...store.player.stats, qi: 350, atk: 220, def: 180, speed: 45 } } });
        const visible = useGameStore_1.useGameStore.getState().getVisibleStats();
        expect(visible.hp).toBe(500);
        expect(typeof visible.qi).toBe('string');
        expect(typeof visible.atk).toBe('string');
        expect(typeof visible.def).toBe('string');
        expect(typeof visible.speed).toBe('string');
    });
});
