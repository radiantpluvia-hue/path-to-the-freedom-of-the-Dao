"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tierMigration_1 = require("@/migrations/tierMigration");
describe('tierMigration', () => {
    test('maps legacy words to canonical tiers', () => {
        expect((0, tierMigration_1.migrateTier)('common')).toBe('H');
        expect((0, tierMigration_1.migrateTier)('Uncommon')).toBe('G');
        expect((0, tierMigration_1.migrateTier)('RARE')).toBe('F');
        expect((0, tierMigration_1.migrateTier)('epic')).toBe('E');
        expect((0, tierMigration_1.migrateTier)('legendary')).toBe('D');
        expect((0, tierMigration_1.migrateTier)('transcendent')).toBe('B');
    });
    test('preserves tier-like inputs and suffixes', () => {
        expect((0, tierMigration_1.migrateTier)('H')).toBe('H');
        expect((0, tierMigration_1.migrateTier)('h+')).toBe('H+');
        expect((0, tierMigration_1.migrateTier)('f-')).toBe('F-');
    });
    test('revertTier returns legacy words for canonical tiers', () => {
        expect((0, tierMigration_1.revertTier)('H')).toBe('common');
        expect((0, tierMigration_1.revertTier)('G')).toBe('uncommon');
        expect((0, tierMigration_1.revertTier)('B')).toBe('transcendent');
        expect((0, tierMigration_1.revertTier)('unknown')).toBeUndefined();
    });
    test('numeric and unknown inputs default to F', () => {
        expect((0, tierMigration_1.migrateTier)('1')).toBe('F');
        expect((0, tierMigration_1.migrateTier)('')).toBe('F');
        expect((0, tierMigration_1.migrateTier)(null)).toBe('F');
        expect((0, tierMigration_1.migrateTier)('some-odd-string')).toBe('F');
    });
});
