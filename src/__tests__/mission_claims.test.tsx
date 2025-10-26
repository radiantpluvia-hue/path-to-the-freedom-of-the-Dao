const { mockUseGameStore } = require('../tests/testUtils/mockUseGameStore');

describe('Mission claim rewards', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('claimMissionRewards applies rewards and moves mission to completed', () => {
    const story = {
      activeRandomMissions: [
        {
          id: 'm_test_1',
          title: 'Test Mission',
          reward: { yuan: 42, items: [{ id: 'test_token', name: 'Test Token' }] },
          isCompleted: true
        }
      ],
      completedQuests: []
    };

    const player = { yuan: 10, inventory: [] };
    const { useGameStoreMock } = mockUseGameStore({ player, story });

    const store = useGameStoreMock.getState();
    const res = store.claimMissionRewards('m_test_1');
    expect(res).toBe(true);
    expect(useGameStoreMock.getState().player.yuan).toBe(52);
    expect(useGameStoreMock.getState().player.inventory.some((i:any) => i.id === 'test_token')).toBe(true);
    expect(useGameStoreMock.getState().story.completedQuests).toContain('m_test_1');
    expect(useGameStoreMock.getState().story.activeRandomMissions.find((m:any) => m.id === 'm_test_1')).toBeUndefined();
  });

  test('claimMissionRewards is idempotent (no double-claim)', () => {
    const story = {
      activeRandomMissions: [
        {
          id: 'm_test_2',
          title: 'Test Mission 2',
          reward: { yuan: 5 },
          isCompleted: true
        }
      ],
      completedQuests: []
    };

    const player = { yuan: 0, inventory: [] };
    const { useGameStoreMock } = mockUseGameStore({ player, story });
    const store = useGameStoreMock.getState();

    const first = store.claimMissionRewards('m_test_2');
    expect(first).toBe(true);
    expect(useGameStoreMock.getState().player.yuan).toBe(5);

    const second = store.claimMissionRewards('m_test_2');
    expect(second).toBe(false);
    expect(useGameStoreMock.getState().player.yuan).toBe(5);
  });
});
