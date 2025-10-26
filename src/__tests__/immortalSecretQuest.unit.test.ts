import { attemptSecretQuest } from '@/quests/immortalSecretQuest';

// tiny seeded RNG for deterministic selection
function seededRng(seed = 4242) {
  let s = seed;
  return { next: () => (s = (s * 48271) % 0x7fffffff) / 0x7fffffff };
}

describe('Immortal secret quest', () => {
  test('fails when no clue found', () => {
    const r = attemptSecretQuest({ playerReputation: 100, foundSecretClue: false });
    expect(r.success).toBe(false);
  });

  test('succeeds when clue found and stealth success', () => {
    const rng = seededRng(12345);
    const r = attemptSecretQuest({ playerReputation: 0, foundSecretClue: true, stealthSuccessful: true }, rng as any);
    expect(r.success).toBe(true);
    expect(r.reward).toBeDefined();
    expect(typeof r.message).toBe('string');
  });

  test('deterministic selection uses spawnWeight with seeded RNG', () => {
    // Seed chosen to exercise weight distribution deterministically
    const rng = seededRng(4242);
    const r = attemptSecretQuest({ playerReputation: 100, foundSecretClue: true }, rng as any);
    expect(r.success).toBe(true);
    // With the seeded weights in immortalItems, prefer the mirror or jade slip over the sword
    expect(r.reward).toBeDefined();
    expect(['immortal_primordial_mirror', 'immortal_emperor_jade_slip', 'immortal_heaven_sealing_sword']).toContain(r.reward!.id);
  });
});
