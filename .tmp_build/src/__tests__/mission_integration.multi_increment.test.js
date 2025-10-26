"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
jest.resetModules();
const mockUseGameStore_1 = require("../tests/testUtils/mockUseGameStore");
test('Multi-increment mission objective (requires multiple kills)', () => {
    jest.resetModules();
    const story = { activeRandomMissions: [{
                id: 'm-multi-kill',
                title: 'Exterminator',
                description: 'Kill 3 shadow bats',
                objectives: [{ description: 'Kill shadow bats', progress: 0, target: 'shadow_bat', required: 3 }],
                reward: { yuan: 10 }
            }] };
    const updateMissionObjectiveProgress = jest.fn((missionId, idx, delta = 1) => {
        const m = story.activeRandomMissions.find((x) => x.id === missionId);
        if (!m)
            return false;
        m.objectives[idx].progress = (m.objectives[idx].progress || 0) + delta;
        return true;
    });
    (0, mockUseGameStore_1.mockUseGameStore)({ player: { sect: 's1', inventory: [] }, story, updateMissionObjectiveProgress });
    const Combat = require('../systems/CombatSystem').CombatSystem;
    const player = { id: 'player', name: 'Hero', hp: 100, maxHp: 100, qi: 0, maxQi: 0, ap: 10, maxAp: 10, stats: { atk: 5, def: 2, speed: 3 }, techniques: [], buffs: [], debuffs: [] };
    const enemyTemplate = { id: 'e', name: 'Shadow Bat', hp: 10, maxHp: 10, qi: 0, maxQi: 0, ap: 5, maxAp: 5, stats: { atk: 2, def: 1, speed: 2 }, techniques: [], buffs: [], debuffs: [] };
    const cs = new Combat(player, [enemyTemplate], require('../store/useGameStore').useGameStore().getState?.() || require('../store/useGameStore').useGameStore());
    // defeat three bats
    cs.notifyEnemyDefeated('e1', 'shadow_bat');
    cs.notifyEnemyDefeated('e2', 'shadow_bat');
    cs.notifyEnemyDefeated('e3', 'shadow_bat');
    expect(story.activeRandomMissions[0].objectives[0].progress).toBe(3);
    expect(updateMissionObjectiveProgress.mock.calls.length).toBeGreaterThanOrEqual(3);
});
