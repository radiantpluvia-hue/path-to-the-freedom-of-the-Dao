// Tests for scaling of alignment-derived passives
// We manipulate alignment axes and assert scaling thresholds produce expected bonuses.

// eslint-disable-next-line @typescript-eslint/no-var-requires
const alignment = require('../src/systems/alignment');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bridge = require('../src/systems/AlignmentPassiveBridge');

function basePlayer() {
  return {
    id: 'p1',
    name: 'Scaler',
    stats: { attack: 0, defense: 0, speed: 0 },
    reputation: 0,
    alignment: { id: 'neutral', axes: { virtue:0, order:0, independence:0, ruthlessness:0 } }
  } as any;
}

describe('Alignment passive scaling', () => {
  test('bloodthirsty scales with ruthlessness', () => {
    const p = basePlayer();
    alignment.shiftPlayerAxes(p, { ruthlessness: 25 }); // should trigger first tier
  const atkAfterTier1 = p.stats.attack;
    expect(atkAfterTier1).toBeGreaterThanOrEqual(1);
    alignment.shiftPlayerAxes(p, { ruthlessness: 40 }); // push to higher tier
    const atkAfterTier2 = p.stats.attack;
    expect(atkAfterTier2).toBeGreaterThan(atkAfterTier1);
    expect(p.alignment?.id).toBe('demonic');
  });

  test('honor_bound scales with virtue', () => {
    const p = basePlayer();
    alignment.shiftPlayerAxes(p, { virtue: 40, order: 10 }); // virtue 40 -> should be at least tier2
    expect(p.stats.attack).toBeGreaterThanOrEqual(2);
  });

  test('wildcraft speed scaling with independence (unorthodox)', () => {
    const p = basePlayer();
    alignment.shiftPlayerAxes(p, { independence: 80, order: -100 }); // strong negative order favors unorthodox
    expect(p.alignment?.id).toBe('unorthodox');
    expect(p.stats.speed).toBeGreaterThanOrEqual(1);
  });
});
