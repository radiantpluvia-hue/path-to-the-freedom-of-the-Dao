jest.resetModules();
import { mockUseGameStore } from '../tests/testUtils/mockUseGameStore';

test('Completion sequence: kill objectives complete before craft objectives', () => {
  jest.resetModules();
  const story = { activeRandomMissions: [{
    id: 'm-sequence',
    title: 'Dual Tasks',
    description: 'Kill two wolves then craft an elixir',
    objectives: [
      { description: 'Kill wolves', progress: 0, target: 'shadow_wolf', required: 2 },
      { description: 'Craft elixir', progress: 0, target: 'elixir_life', required: 1 }
    ],
    reward: { yuan: 8 }
  }] } as any;

  const updateMissionObjectiveProgress = jest.fn((missionId: string, idx: number, delta = 1) => {
    const m = story.activeRandomMissions.find((x: any) => x.id === missionId);
    if (!m) return false;
    m.objectives[idx].progress = (m.objectives[idx].progress || 0) + delta;
    return true;
  });

  mockUseGameStore({ player: { sect: 's1', inventory: [] }, story, updateMissionObjectiveProgress });

  const Combat = require('../systems/CombatSystem').CombatSystem;
  const Crafting = require('../systems/CraftingSystem').CraftingSystem;

  const player = { id: 'player', name: 'Hero', hp: 100, maxHp: 100, qi: 0, maxQi: 0, ap: 10, maxAp: 10, stats: { atk: 5, def: 2, speed: 3 }, techniques: [], buffs: [], debuffs: [] } as any;
  const cs = new Combat(player, [], require('../store/useGameStore').useGameStore().getState?.() || require('../store/useGameStore').useGameStore());
  const craft = new Crafting([]);

  // finish kills first
  cs.notifyEnemyDefeated('k1', 'shadow_wolf');
  cs.notifyEnemyDefeated('k2', 'shadow_wolf');

  expect(story.activeRandomMissions[0].objectives[0].progress).toBe(2);
  expect(story.activeRandomMissions[0].objectives[1].progress).toBe(0);

  // then craft
  craft.notifyItemCrafted('elixir_life');
  expect(story.activeRandomMissions[0].objectives[1].progress).toBe(1);
});
