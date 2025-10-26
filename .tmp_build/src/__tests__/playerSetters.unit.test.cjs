"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const playerSetters_1 = require("../utils/playerSetters");
const cultivationRealms_1 = require("../data/cultivationRealms");
describe('playerSetters', () => {
    test('setPlayerRealm with string key sets realm and realmId', () => {
        const p = { name: 'A' };
        const key = cultivationRealms_1.REALM_ORDER[2] || 'mortal';
        const out = (0, playerSetters_1.setPlayerRealm)(p, key);
        expect(out.realm).toBe(key);
        const expectedId = Math.max(1, cultivationRealms_1.REALM_ORDER.indexOf(key) + 1);
        expect(out.realmId).toBe(expectedId);
        // original not mutated
        expect(p.realm).toBeUndefined();
    });
    test('setPlayerRealm with numeric id sets realm string', () => {
        const p = { name: 'B' };
        const out = (0, playerSetters_1.setPlayerRealm)(p, 1);
        expect(out.realmId).toBe(1);
        expect(out.realm).toBe(cultivationRealms_1.REALM_ORDER[0]);
    });
    test('applyRealmToPlayer mutates in-place', () => {
        const p = { name: 'C' };
        (0, playerSetters_1.applyRealmToPlayer)(p, 2);
        expect(p.realmId).toBe(2);
        expect(p.realm).toBe(cultivationRealms_1.REALM_ORDER[1]);
    });
    test('normalizePlayerRealmInState backfills missing fields', () => {
        const state = { player: { name: 'D', realm: 'mortal' } };
        // ensure realmId missing
        delete state.player.realmId;
        (0, playerSetters_1.normalizePlayerRealmInState)(state);
        expect(state.player.realm).toBe('mortal');
        expect(state.player.realmId).toBeGreaterThanOrEqual(1);
    });
    test('setPlayerRealm handles null player safely', () => {
        expect((0, playerSetters_1.setPlayerRealm)(null, 'mortal')).toBeNull();
    });
});
