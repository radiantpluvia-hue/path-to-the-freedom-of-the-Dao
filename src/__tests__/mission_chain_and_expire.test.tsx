jest.resetModules();
import { mockUseGameStore } from '../tests/testUtils/mockUseGameStore';

test('Completing a mission unlocks chained mission', () => {
  jest.resetModules();
  const chained = { id: 'm_chain_2', title: 'Follow-up Mission', reward: { yuan: 7 } };
  const story = { activeRandomMissions: [{ id: 'm_chain_1', title: 'Starter', reward: { yuan: 3, chainedMission: chained }, isCompleted: true }], completedQuests: [] } as any;
  const player = { yuan: 0, inventory: [] };
  const { useGameStoreMock } = mockUseGameStore({ player, story });

  const store = useGameStoreMock.getState();
  const res = store.claimMissionRewards('m_chain_1');
  expect(res).toBe(true);
  // chained mission should be added
  expect(useGameStoreMock.getState().story.activeRandomMissions.some((m:any) => m.id === 'm_chain_2')).toBe(true);
});

test('Expired missions are removed by checkMissionExpirations', () => {
  jest.resetModules();
  const now = 1000;
  const story = { activeRandomMissions: [ { id: 'm_exp_1', title: 'Soon to expire', expiresAt: 500 }, { id: 'm_exp_2', title: 'Still active', expiresAt: 2000 } ], completedQuests: [] } as any;
  const player = { yuan: 0, inventory: [] };
  const { useGameStoreMock } = mockUseGameStore({ player, story, world: { tick: now } });

  const store = useGameStoreMock.getState();
  const removed = store.checkMissionExpirations(now);
  expect(removed).toBeGreaterThanOrEqual(1);
  expect(useGameStoreMock.getState().story.activeRandomMissions.some((m:any)=>m.id==='m_exp_1')).toBe(false);
  expect(useGameStoreMock.getState().story.activeRandomMissions.some((m:any)=>m.id==='m_exp_2')).toBe(true);
});
