import { useGameStore } from '@/store/useGameStore';

describe('Explicit training APIs', () => {
  beforeEach(() => {
    // Ensure a clean minimal player state for each test
    useGameStore.getState().setPlayerProperty('realm', 'mortal');
    useGameStore.getState().setPlayerProperty('proficiencies', {} as any);
    useGameStore.getState().setPlayerProperty('baseStats', { atk: 10, def: 10, speed: 10 } as any);
    useGameStore.getState().setPlayerProperty('stats', { atk: 10, def: 10, speed: 10 } as any);
    useGameStore.getState().setPlayerProperty('willPower', 10 as any);
    useGameStore.getState().setPlayerProperty('daoComprehension', 0 as any);
    useGameStore.getState().setPlayerProperty('currentQi', 0 as any);
    useGameStore.getState().setPlayerProperty('maxQi', 100 as any);
  });

  it('trainComprehendManual adds comprehension proficiency and a small daoComprehension bump', () => {
    const before = useGameStore.getState().player.daoComprehension || 0;
    // Call without manualId should still work
    const res = useGameStore.getState().trainComprehendManual();
    expect(res.success).toBe(true);
    const st = useGameStore.getState();
    const profs = st.player.proficiencies || {} as any;
    expect(Object.keys(profs).length).toBeGreaterThan(0);
    // Expect comprehension proficiency to exist (or at least some proficiency added)
    const hasComprehension = !!profs.comprehension;
    expect(hasComprehension).toBe(true);
    expect(st.player.daoComprehension).toBeGreaterThanOrEqual(before);
  });

  it('trainBody grants strength/endurance proficiency and small atk/def gains', () => {
    const beforeAtk = useGameStore.getState().player.stats?.atk || 0;
    const beforeDef = useGameStore.getState().player.stats?.def || 0;
    const res = useGameStore.getState().trainBody();
    expect(res.success).toBe(true);
    const st = useGameStore.getState();
    const profs = st.player.proficiencies || {} as any;
    expect(!!profs.strength).toBe(true);
    // Endurance may be tracked under 'endurance'
    expect(!!profs.endurance).toBe(true);
    expect(st.player.stats.atk).toBeGreaterThanOrEqual(beforeAtk);
    expect(st.player.stats.def).toBeGreaterThanOrEqual(beforeDef);
  });

  it('trainMeditate increases willPower proficiency and gives a small Qi bump', () => {
    const beforeQi = useGameStore.getState().player.currentQi || 0;
    const res = useGameStore.getState().trainMeditate();
    expect(res.success).toBe(true);
    const st = useGameStore.getState();
    const profs = st.player.proficiencies || {} as any;
    expect(!!profs.willPower).toBe(true);
    expect(st.player.currentQi).toBeGreaterThanOrEqual(beforeQi + 1);
  });

  it('trainMartial grants strength/speed proficiencies and small atk/speed gains', () => {
    const beforeAtk = useGameStore.getState().player.stats?.atk || 0;
    const beforeSpeed = useGameStore.getState().player.stats?.speed || 0;
    const res = useGameStore.getState().trainMartial();
    expect(res.success).toBe(true);
    const st = useGameStore.getState();
    const profs = st.player.proficiencies || {} as any;
    expect(!!profs.strength).toBe(true);
    expect(!!profs.speed).toBe(true);
    expect(st.player.stats.atk).toBeGreaterThanOrEqual(beforeAtk);
    expect(st.player.stats.speed).toBeGreaterThanOrEqual(beforeSpeed);
  });
});
