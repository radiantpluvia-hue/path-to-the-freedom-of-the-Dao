jest.resetModules();
import { mockUseGameStore } from '../tests/testUtils/mockUseGameStore';

test('PickupSystem.notifyItemPicked updates mission objectives', () => {
  jest.resetModules();
  const story = { activeRandomMissions: [{
    id: 'm-pickup-1',
    title: 'Collector',
    description: 'Pick up a mysterious token',
    objectives: [{ description: 'Get token', progress: 0, target: 'mysterious_token' }],
    reward: { yuan: 3 }
  }] } as any;

  const updateMissionObjectiveProgress = jest.fn((missionId: string, idx: number, delta = 1) => {
    const m = story.activeRandomMissions.find((x: any) => x.id === missionId);
    if (!m) return false;
    m.objectives[idx].progress = (m.objectives[idx].progress || 0) + delta;
    return true;
  });

  mockUseGameStore({ player: { sect: 's1', inventory: [] }, story, updateMissionObjectiveProgress });

  const Pickup = require('../systems/PickupSystem').PickupSystem;
  const ps = new Pickup();
  ps.notifyItemPicked('mysterious_token');

  expect(story.activeRandomMissions[0].objectives[0].progress).toBe(1);
  expect(updateMissionObjectiveProgress.mock.calls.length).toBeGreaterThanOrEqual(1);
});
