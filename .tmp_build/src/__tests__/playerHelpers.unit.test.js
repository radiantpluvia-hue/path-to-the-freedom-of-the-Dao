"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const playerHelpers_1 = require("@/utils/playerHelpers");
describe('playerHelpers', () => {
    test('getPlayerRealmId handles numeric realmId and numeric realm', () => {
        expect((0, playerHelpers_1.getPlayerRealmId)({ realmId: 3 })).toBe(3);
        expect((0, playerHelpers_1.getPlayerRealmId)({ realm: 2 })).toBe(2);
    });
    test('getPlayerRealmId maps legacy realm strings', () => {
        expect((0, playerHelpers_1.getPlayerRealmId)({ realm: 'mortal' })).toBe(1);
        expect((0, playerHelpers_1.getPlayerRealmId)({ realm: 'cultivator' })).toBe(2);
        expect((0, playerHelpers_1.getPlayerRealmId)({ realm: 'immortal' })).toBe(10);
    });
    test('getPlayerRealmKey prefers realm string and falls back to id', () => {
        expect((0, playerHelpers_1.getPlayerRealmKey)({ realm: 'mortal' })).toBe('mortal');
        expect((0, playerHelpers_1.getPlayerRealmKey)({ realmId: 1 })).toBe('mortal');
    });
    test('ensureRealmId sets realmId when missing', () => {
        const p = { realm: 'cultivator' };
        const id = (0, playerHelpers_1.ensureRealmId)(p);
        expect(id).toBe(2);
        expect(p.realmId).toBe(2);
    });
});
