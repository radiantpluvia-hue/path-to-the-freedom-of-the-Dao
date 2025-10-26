"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rarityDisplay_1 = require("@/utils/rarityDisplay");
describe('getDisplayRarity', () => {
    test('maps letter codes to compact labels', () => {
        expect((0, rarityDisplay_1.getDisplayRarity)('H')).toBe('F');
        expect((0, rarityDisplay_1.getDisplayRarity)('G')).toBe('E');
        expect((0, rarityDisplay_1.getDisplayRarity)('B')).toBe('A');
    });
    test('maps legacy words and TitleCase correctly', () => {
        expect((0, rarityDisplay_1.getDisplayRarity)('common')).toBe('F');
        expect((0, rarityDisplay_1.getDisplayRarity)('Rare')).toBe('D');
        expect((0, rarityDisplay_1.getDisplayRarity)('Mythical')).toBe('S');
    });
    test('returns display labels unchanged', () => {
        expect((0, rarityDisplay_1.getDisplayRarity)('S')).toBe('S');
        expect((0, rarityDisplay_1.getDisplayRarity)('SSS')).toBe('SSS');
    });
    test('handles unknowns gracefully', () => {
        expect((0, rarityDisplay_1.getDisplayRarity)('')).toBe('Unknown');
        expect((0, rarityDisplay_1.getDisplayRarity)(null)).toBe('Unknown');
        expect((0, rarityDisplay_1.getDisplayRarity)('obscure-tier')).toBe('obscure-tier');
    });
});
