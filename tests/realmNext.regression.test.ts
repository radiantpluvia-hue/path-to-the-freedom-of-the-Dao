const { CULTIVATION_REALMS, REALM_ORDER, getNextRealm } = require('../src/data/cultivationRealms');

test('explicit nextRealm in CULTIVATION_REALMS takes precedence over REALM_ORDER', () => {
  // Create a temporary realm entry with explicit nextRealm
  const key = 'test_realm_explicit';
  const next = 'test_realm_next';
  // mutate the in-memory map for the test
  (CULTIVATION_REALMS as any)[key] = { id: key, name: 'Test Realm', minorStages: 1, description: '', qiRequirement: 1, lifespanBonus: 0, breakthroughDifficulty: 1, nextRealm: next };
  // Ensure REALM_ORDER does not place the next item directly after key
  const idx = REALM_ORDER.indexOf(key);
  const resolved = getNextRealm(key);
  expect(resolved).toBe(next);
  // cleanup
  delete (CULTIVATION_REALMS as any)[key];
});