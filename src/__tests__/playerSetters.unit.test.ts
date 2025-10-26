import { setPlayerRealm, applyRealmToPlayer, normalizePlayerRealmInState } from '../utils/playerSetters';
import { REALM_ORDER } from '../data/cultivationRealms';

describe('playerSetters', () => {
  test('setPlayerRealm with string key sets realm and realmId', () => {
    const p = { name: 'A' };
    const key = REALM_ORDER[2] || 'mortal';
    const out = setPlayerRealm(p, key);
    expect(out.realm).toBe(key);
    const expectedId = Math.max(1, REALM_ORDER.indexOf(key) + 1);
    expect(out.realmId).toBe(expectedId);
  // original not mutated
  expect((p as any).realm).toBeUndefined();
  });

  test('setPlayerRealm with numeric id sets realm string', () => {
    const p = { name: 'B' };
    const out = setPlayerRealm(p, 1);
    expect(out.realmId).toBe(1);
    expect(out.realm).toBe(REALM_ORDER[0]);
  });

  test('applyRealmToPlayer mutates in-place', () => {
    const p: any = { name: 'C' };
    applyRealmToPlayer(p, 2);
    expect(p.realmId).toBe(2);
    expect(p.realm).toBe(REALM_ORDER[1]);
  });

  test('normalizePlayerRealmInState backfills missing fields', () => {
    const state: any = { player: { name: 'D', realm: 'mortal' } };
    // ensure realmId missing
    delete state.player.realmId;
    normalizePlayerRealmInState(state);
    expect(state.player.realm).toBe('mortal');
    expect(state.player.realmId).toBeGreaterThanOrEqual(1);
  });

  test('setPlayerRealm handles null player safely', () => {
    expect(setPlayerRealm(null as any, 'mortal')).toBeNull();
  });
});
