jest.resetModules();
import { useGameStore } from '@/store/useGameStore';
import { registerMissionTemplate, clearMissionRegistry } from '@/systems/missionTemplateRegistry';

test('Claiming mission with chained template id unlocks registered template mission', () => {
  clearMissionRegistry();
  // register a deterministic template
  registerMissionTemplate({ id: 'tpl_e2e', title: 'E2E Template', description: 'E2E Desc', baseReward: { spiritStones: { low: 5 } }, difficulty: 'easy' } as any);

  const story = { activeRandomMissions: [{ id: 'm_start', title: 'Start', reward: { yuan: 1, chainedMission: 'tpl_e2e' }, isCompleted: true }], completedQuests: [] } as any;
  const player = { yuan: 0, inventory: [] } as any;

  // Use the real store and set its state for the test
  const us = useGameStore as any;
  us.setState({ player, story });

  const store = us.getState();
  const res = store.claimMissionRewards('m_start');
  expect(res).toBe(true);

  const state = us.getState();
  // The registered template should have produced a new mission title 'E2E Template'
  expect(state.story.activeRandomMissions.some((m:any) => m.title === 'E2E Template')).toBe(true);
});
