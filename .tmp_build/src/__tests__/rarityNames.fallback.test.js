"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rarityNames_1 = require("@/utils/rarityNames");
const rarityDisplay_1 = require("@/utils/rarityDisplay");
describe('displayRarity fallback behavior', () => {
    test('prefers compact mapping over returning same key', () => {
        // INTERNAL_TO_DISPLAY maps 'H' -> 'F' for example
        expect((0, rarityNames_1.displayRarity)('H')).toBe((0, rarityDisplay_1.getDisplayRarity)('H'));
        // If a key already equals a display label, ensure it is returned as-is
        const label = 'S';
        expect((0, rarityDisplay_1.getDisplayRarity)(label)).toBe(label);
        expect((0, rarityNames_1.displayRarity)(label)).toBe(label);
    });
    test('falls back to long human-readable names when compact mapping does not change key', () => {
        // pick a long-name key present in RARITY_DISPLAY_LONG
        const longKey = Object.keys(rarityNames_1.RARITY_DISPLAY_LONG).find(k => typeof k === 'string' && k.length > 1);
        if (!longKey)
            throw new Error('No long-key found in RARITY_DISPLAY_LONG');
        // Ensure displayRarity uses the long name when compact mapping returns the same original key
        const compact = (0, rarityDisplay_1.getDisplayRarity)(longKey);
        if (compact === String(longKey).trim()) {
            expect((0, rarityNames_1.displayRarity)(longKey)).toBe(rarityNames_1.RARITY_DISPLAY_LONG[longKey]);
        }
        else {
            // If compact mapping changes it, ensure displayRarity reflects that mapping
            expect((0, rarityNames_1.displayRarity)(longKey)).toBe(compact);
        }
    });
    test('handles null/undefined gracefully', () => {
        // displayRarity should return 'Unknown' for falsy inputs
        // allow passing undefined/null in tests by casting to any
        expect(rarityNames_1.displayRarity(undefined)).toBe('Unknown');
        expect(rarityNames_1.displayRarity(null)).toBe('Unknown');
    });
});
