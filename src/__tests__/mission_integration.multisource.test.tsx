jest.resetModules();
import { mockUseGameStore } from '../tests/testUtils/mockUseGameStore';

test('Multi-source mission progress: combat and crafting update different objectives', () => {
  jest.resetModules();
  const story = { activeRandomMissions: [{
    id: 'm-multi-1',
    title: 'Hunt and Brew',
    description: 'Kill a beast and craft an elixir',
    objectives: [
      { description: 'Kill beast', progress: 0, target: 'shadow_wolf' },
      { description: 'Craft elixir', progress: 0, target: 'elixir_life' }
    ],
    reward: { yuan: 5 }
  }] } as any;

  const updateMissionObjectiveProgress = jest.fn((missionId: string, idx: number, delta = 1) => {
    const m = story.activeRandomMissions.find((x: any) => x.id === missionId);
    if (!m) return false;
    m.objectives[idx].progress = (m.objectives[idx].progress || 0) + delta;
    return true;
  });

  mockUseGameStore({ player: { sect: 's1', inventory: [] }, story, updateMissionObjectiveProgress });

  // require systems after mocks
  const Combat = require('../systems/CombatSystem').CombatSystem;
  const Crafting = require('../systems/CraftingSystem').CraftingSystem;

  // instantiate combat and call notifyEnemyDefeated
  const player = { id: 'player', name: 'Hero', hp: 100, maxHp: 100, qi: 0, maxQi: 0, ap: 10, maxAp: 10, stats: { atk: 5, def: 2, speed: 3 }, techniques: [], buffs: [], debuffs: [] } as any;
  const enemy = { id: 'e1', name: 'Shadow Wolf', hp: 10, maxHp: 10, qi: 0, maxQi: 0, ap: 5, maxAp: 5, stats: { atk: 2, def: 1, speed: 2 }, techniques: [], buffs: [], debuffs: [] } as any;

  const cs = new Combat(player, [enemy], require('../store/useGameStore').useGameStore().getState?.() || require('../store/useGameStore').useGameStore());
  cs.notifyEnemyDefeated('e1', 'shadow_wolf');

  // craft event
  const craft = new Crafting([]);
  craft.notifyItemCrafted('elixir_life');

  // both objectives should have been incremented
  expect(story.activeRandomMissions[0].objectives[0].progress).toBe(1);
  expect(story.activeRandomMissions[0].objectives[1].progress).toBe(1);
  // and the mocked updater should have been called at least twice
  expect(updateMissionObjectiveProgress.mock.calls.length).toBeGreaterThanOrEqual(2);
});
