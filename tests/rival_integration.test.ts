import { useGameStore } from '../src/store/useGameStore';

describe('Rival integration (store-level)', () => {
  test('getRivals and getRivalById return valid rivals and encounter flow works', () => {
    const store = useGameStore.getState();
    const rivals = store.getRivals();
    expect(Array.isArray(rivals)).toBe(true);
    expect(rivals.length).toBeGreaterThan(0);

    const first = rivals[0];
    expect(first).toBeDefined();
    const id = first.id;

    const byId = store.getRivalById(id);
    expect(byId).not.toBeNull();
    expect(byId!.id).toBe(id);

    // Check encounter status (should return an object)
    const status = store.getRivalEncounterStatus(id);
    expect(status).toHaveProperty('canEncounter');

    // Attempt to record an encounter if allowed; this should not throw
    try {
      const ok = store.canEncounterRival(id);
      // call recordRivalEncounter but tolerate it returning early due to cooldowns
      store.recordRivalEncounter(id);
      expect(typeof ok).toBe('boolean');
    } catch (e) {
      // Fail the test if unexpected exception thrown
      throw e;
    }
  });

  test('startCombatWithRival returns boolean and does not crash', () => {
    const store = useGameStore.getState();
    const rivals = store.getRivals();
    const id = rivals[0].id;
    const res = store.startCombatWithRival(id);
    // startCombatWithRival may depend on optional subsystems; ensure it returns a boolean
    expect(typeof res).toBe('boolean');
  });
});
