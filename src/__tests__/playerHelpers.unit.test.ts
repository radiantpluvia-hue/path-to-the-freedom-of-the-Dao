import { getPlayerRealmId, getPlayerRealmKey, ensureRealmId } from '@/utils/playerHelpers';

describe('playerHelpers', () => {
  test('getPlayerRealmId handles numeric realmId and numeric realm', () => {
    expect(getPlayerRealmId({ realmId: 3 } as any)).toBe(3);
    expect(getPlayerRealmId({ realm: 2 } as any)).toBe(2);
  });

  test('getPlayerRealmId maps legacy realm strings', () => {
    expect(getPlayerRealmId({ realm: 'mortal' } as any)).toBe(1);
    expect(getPlayerRealmId({ realm: 'cultivator' } as any)).toBe(2);
    expect(getPlayerRealmId({ realm: 'immortal' } as any)).toBe(10);
  });

  test('getPlayerRealmKey prefers realm string and falls back to id', () => {
    expect(getPlayerRealmKey({ realm: 'mortal' } as any)).toBe('mortal');
    expect(getPlayerRealmKey({ realmId: 1 } as any)).toBe('mortal');
  });

  test('ensureRealmId sets realmId when missing', () => {
    const p: any = { realm: 'cultivator' };
    const id = ensureRealmId(p);
    expect(id).toBe(2);
    expect(p.realmId).toBe(2);
  });
});
