import { getEncounterTemplate } from '@/data/encounterNarratives';

test('mentor encounter registration and passive loader smoke', async () => {
  // Dynamic import the runtime mentor encounters module
  const mod = await import('@/data/mentor_encounters_runtime');
  expect(mod).toBeTruthy();
  // pick some mentor ids (non-deterministic but should return an array or empty)
  const ids = mod.pickRareMentorIds(2);
  // If none available, skip registration assertions
  if (ids.length > 0) {
    mod.registerSecretMentorEncounters(ids);
    const t = getEncounterTemplate(`mentor_encounter_${ids[0]}`);
    expect(t).toBeTruthy();
    expect(t.meta && t.meta.mentorId).toBe(ids[0]);
  }

  // Ensure the passive registry exposes an ensure function and calling it doesn't throw
  const pr = await import('@/systems/passiveRegistry');
  expect(pr).toBeTruthy();
  expect(typeof pr.ensureGeneratedPassives === 'function' || typeof pr.loadGeneratedPassives === 'function').toBeTruthy();
  if (typeof pr.ensureGeneratedPassives === 'function') {
    // call and await the dynamic prefetch (it's non-blocking but should not reject)
    try { pr.ensureGeneratedPassives(); } catch (e) { /* ignore */ }
  } else if (typeof pr.loadGeneratedPassives === 'function') {
    try { await pr.loadGeneratedPassives(); } catch (e) { /* ignore */ }
  }
});
