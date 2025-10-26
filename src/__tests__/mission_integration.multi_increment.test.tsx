jest.resetModules();
import { mockUseGameStore } from '../tests/testUtils/mockUseGameStore';

test('Multi-increment mission objective (requires multiple kills)', () => {
  jest.resetModules();
  const story = { activeRandomMissions: [{
    id: 'm-multi-kill',
    title: 'Exterminator',
    description: 'Kill 3 shadow bats',
    objectives: [{ description: 'Kill shadow bats', progress: 0, target: 'shadow_bat', required: 3 }],
    reward: { yuan: 10 }
  }] } as any;

  const updateMissionObjectiveProgress = jest.fn((missionId: string, idx: number, delta = 1) => {
    const m = story.activeRandomMissions.find((x: any) => x.id === missionId);
    if (!m) return false;
    m.objectives[idx].progress = (m.objectives[idx].progress || 0) + delta;
    return true;
  });

  mockUseGameStore({ player: { sect: 's1', inventory: [] }, story, updateMissionObjectiveProgress });

  const Combat = require('../systems/CombatSystem').CombatSystem;
  const player = { id: 'player', name: 'Hero', hp: 100, maxHp: 100, qi: 0, maxQi: 0, ap: 10, maxAp: 10, stats: { atk: 5, def: 2, speed: 3 }, techniques: [], buffs: [], debuffs: [] } as any;
  const enemyTemplate = { id: 'e', name: 'Shadow Bat', hp: 10, maxHp: 10, qi: 0, maxQi: 0, ap: 5, maxAp: 5, stats: { atk: 2, def: 1, speed: 2 }, techniques: [], buffs: [], debuffs: [] } as any;

  const cs = new Combat(player, [enemyTemplate as any], require('../store/useGameStore').useGameStore().getState?.() || require('../store/useGameStore').useGameStore());

  // defeat three bats
  cs.notifyEnemyDefeated('e1', 'shadow_bat');
  cs.notifyEnemyDefeated('e2', 'shadow_bat');
  cs.notifyEnemyDefeated('e3', 'shadow_bat');

  expect(story.activeRandomMissions[0].objectives[0].progress).toBe(3);
  expect(updateMissionObjectiveProgress.mock.calls.length).toBeGreaterThanOrEqual(3);
});
