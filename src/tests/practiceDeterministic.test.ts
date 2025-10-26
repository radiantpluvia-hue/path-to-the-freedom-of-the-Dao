import { useGameStore } from '../store/useGameStore';

describe('practiceTechnique deterministic behaviors', () => {
  beforeEach(() => {
    // reset player state
    const s = useGameStore.getState();
    useGameStore.setState({ player: { ...s.player, currentQi: 200, fatigue: 0, techniques: [{ id: 'dt_test_tech', name: 'DT Test', masteryXp: 4, masteryRank: 0 }] } } as any);
  });

  afterEach(() => {
    // restore any mocks
    jest.restoreAllMocks();
  });

  test('rank-up occurs when XP threshold reached', () => {
    const s = useGameStore.getState();
    // Force Math.random to return high value so no botch and no epiphany randomness changes
    jest.spyOn(global.Math, 'random').mockReturnValue(0.99);

    const res = s.practiceTechnique('dt_test_tech');
    expect(res.success).toBe(true);

  const updatedRaw = useGameStore.getState().player.techniques.find((t: any) => (typeof t === 'object' ? t.id === 'dt_test_tech' : false));
  expect(updatedRaw).toBeTruthy();
  const updated: any = updatedRaw as any;
  // Starting XP 4 + PRACTICE_XP (4) => 8; with RANK_XP=5 => rank increases by 1, remainder 3
  expect(typeof updated.masteryRank === 'number' ? updated.masteryRank : 0).toBeGreaterThanOrEqual(1);
  expect(typeof updated.masteryXp === 'number' ? updated.masteryXp : -1).toBe(3);
  });

  test('botch applies temporary debuff via buffSystem', () => {
    const s = useGameStore.getState();
    // set fatigue high to ensure botchChance low-threshold triggers
    useGameStore.setState({ player: { ...s.player, fatigue: 22, currentQi: 200 } } as any);
    // Force Math.random to 0 to guarantee botch
    jest.spyOn(global.Math, 'random').mockReturnValue(0);

  // spy on buffSystem.applyBuff
  const buffSpy = jest.spyOn((s as any).buffSystem, 'applyBuff' as any);

    const res = s.practiceTechnique('dt_test_tech');
    expect(res.success).toBe(false);
    expect(res.message).toMatch(/botched/);
    expect(buffSpy).toHaveBeenCalled();

  // Fatigue should have increased by BOTCH_EXTRA_FATIGUE (5): initial 22 + ADD_FATIGUE(4) + BOTCH_EXTRA_FATIGUE(5) = 31
  const post = useGameStore.getState().player.fatigue;
  expect(post).toBeGreaterThanOrEqual(31);
  });
});
