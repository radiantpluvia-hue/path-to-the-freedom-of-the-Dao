jest.resetModules();
import { mockUseGameStore } from '../tests/testUtils/mockUseGameStore';

test('Repeated crafting objective (requires multiple crafts)', () => {
  jest.resetModules();
  const story = { activeRandomMissions: [{
    id: 'm-repeat-craft',
    title: 'Brewer',
    description: 'Craft 2 healing draughts',
    objectives: [{ description: 'Craft draughts', progress: 0, target: 'healing_draught', required: 2 }],
    reward: { yuan: 6 }
  }] } as any;

  const updateMissionObjectiveProgress = jest.fn((missionId: string, idx: number, delta = 1) => {
    const m = story.activeRandomMissions.find((x: any) => x.id === missionId);
    if (!m) return false;
    m.objectives[idx].progress = (m.objectives[idx].progress || 0) + delta;
    return true;
  });

  mockUseGameStore({ player: { sect: 's1', inventory: [] }, story, updateMissionObjectiveProgress });

  const Crafting = require('../systems/CraftingSystem').CraftingSystem;
  const craft = new Crafting([]);

  craft.notifyItemCrafted('healing_draught');
  craft.notifyItemCrafted('healing_draught');

  expect(story.activeRandomMissions[0].objectives[0].progress).toBe(2);
  expect(updateMissionObjectiveProgress.mock.calls.length).toBeGreaterThanOrEqual(2);
});
