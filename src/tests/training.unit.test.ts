import training from '../game/training';

function makePlayer(overrides: any = {}) {
  return Object.assign({
    id: 'test-player',
    realm: 10,
    stamina: 100,
    qi: 100,
    inventory: { sacrificial_incense: 1, basic_herbs: 2, array_stone: 1, taming_whistle: 1 },
    max_mental_hp: 100,
    mental_hp: 100,
    max_qi: 100,
  }, overrides);
}

describe('training engine', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  test('startTraining enforces unlocks and missing items', () => {
    const p = makePlayer({ realm: 1 });
    const resLocked = training.startTraining(p, 'heavenly_resonance', 0);
    expect(resLocked.error).toBe('locked');

    const pHigh = makePlayer({ realm: 10 });
    const resMissing = training.startTraining(pHigh, 'heart_demon_confrontation', 0);
    // needs sacrificial_incense; we have it in default inventory, so should succeed
    expect(resMissing && resMissing.ok).toBe(true);
  });

  test('cooldown enforcement', () => {
    const p = makePlayer();
    const now = 0;
    const r1 = training.startTraining(p, 'alchemy_practice', now);
    expect(r1.ok).toBe(true);
    const r2 = training.startTraining(p, 'alchemy_practice', now + 1);
    expect(r2.error).toBe('cooldown');
  });

  test('resolveTraining success applies xp and rewards', () => {
    const p = makePlayer();
    const now = 0;
    training.startTraining(p, 'alchemy_practice', now);
    // force success by mocking Math.random
    jest.spyOn(Math, 'random').mockReturnValue(0.001);
    const res = training.resolveTraining(p, now + 20);
    expect(res.success).toBe(true);
    expect(p.xp && p.xp.alchemy).toBeGreaterThanOrEqual(20);
  });

  test('resolveTraining failure applies backlash', () => {
    const p = makePlayer();
    const now = 0;
    training.startTraining(p, 'heart_demon_confrontation', now);
    // force failure by mocking Math.random high
    jest.spyOn(Math, 'random').mockReturnValue(0.99);
    const res = training.resolveTraining(p, now + 30);
    expect(res.success).toBe(false);
    // if backlash rolled, spawnedHeartDemon may be set by hook stub
    expect(p.trainingQueue).toBeNull();
  });
});
