"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
jest.resetModules();
const mockUseGameStore_1 = require("../tests/testUtils/mockUseGameStore");
test('CombatSystem.notifyEnemyDefeated updates mission objectives', () => {
    jest.resetModules();
    const story = { activeRandomMissions: [{
                id: 'm-kill-1',
                title: 'Kill Wolves',
                description: 'Eliminate shadow wolves',
                objectives: [{ description: 'Kill wolves', progress: 0, target: 'shadow_wolves' }],
                reward: { yuan: 1 }
            }], completedQuests: [] };
    const updateMissionObjectiveProgress = jest.fn((missionId, idx, delta = 1) => {
        const m = story.activeRandomMissions.find((x) => x.id === missionId);
        if (!m)
            return false;
        m.objectives[idx].progress = (m.objectives[idx].progress || 0) + delta;
        return true;
    });
    // Provide small helper mocks used by CombatSystem during initialization
    const getSectReputation = jest.fn(() => 0);
    (0, mockUseGameStore_1.mockUseGameStore)({ player: { sect: 's1', inventory: [] }, story, updateMissionObjectiveProgress, getSectReputation });
    // instantiate a CombatSystem and call the hook
    const Combat = require('../systems/CombatSystem').CombatSystem;
    const player = { id: 'player', name: 'Hero', hp: 100, maxHp: 100, qi: 0, maxQi: 0, ap: 10, maxAp: 10, stats: { atk: 5, def: 2, speed: 3 }, techniques: [], buffs: [], debuffs: [] };
    const enemy = { id: 'enemy1', name: 'Shadow Wolf', hp: 10, maxHp: 10, qi: 0, maxQi: 0, ap: 5, maxAp: 5, stats: { atk: 2, def: 1, speed: 2 }, techniques: [], buffs: [], debuffs: [] };
    const cs = new Combat(player, [enemy], require('../store/useGameStore').useGameStore().getState?.() || require('../store/useGameStore').useGameStore());
    // call notifyEnemyDefeated matching the enemy type
    cs.notifyEnemyDefeated('enemy1', 'shadow_wolves');
    expect(story.activeRandomMissions[0].objectives[0].progress).toBe(1);
});
test('CraftingSystem.notifyItemCrafted updates mission objectives', () => {
    jest.resetModules();
    const story = { activeRandomMissions: [{
                id: 'm-craft-1',
                title: 'Make Elixir',
                description: 'Craft special elixirs',
                objectives: [{ description: 'Craft elixir', progress: 0, target: 'elixir_life' }],
                reward: { yuan: 2 }
            }], completedQuests: [] };
    const updateMissionObjectiveProgress = jest.fn((missionId, idx, delta = 1) => {
        const m = story.activeRandomMissions.find((x) => x.id === missionId);
        if (!m)
            return false;
        m.objectives[idx].progress = (m.objectives[idx].progress || 0) + delta;
        return true;
    });
    // Provide getSectReputation so CraftingSystem (if it instantiates a store) does not fail
    const getSectReputation2 = jest.fn(() => 0);
    (0, mockUseGameStore_1.mockUseGameStore)({ player: { sect: 's1', inventory: [] }, story, updateMissionObjectiveProgress, getSectReputation: getSectReputation2 });
    const Crafting = require('../systems/CraftingSystem').CraftingSystem;
    const cs = new Crafting([]);
    cs.notifyItemCrafted('elixir_life');
    expect(story.activeRandomMissions[0].objectives[0].progress).toBe(1);
});
