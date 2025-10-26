"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
jest.resetModules();
const useGameStore_1 = require("@/store/useGameStore");
const missionTemplateRegistry_1 = require("@/systems/missionTemplateRegistry");
test('Claiming mission with chained template id unlocks registered template mission', () => {
    (0, missionTemplateRegistry_1.clearMissionRegistry)();
    // register a deterministic template
    (0, missionTemplateRegistry_1.registerMissionTemplate)({ id: 'tpl_e2e', title: 'E2E Template', description: 'E2E Desc', baseReward: { spiritStones: { low: 5 } }, difficulty: 'easy' });
    const story = { activeRandomMissions: [{ id: 'm_start', title: 'Start', reward: { yuan: 1, chainedMission: 'tpl_e2e' }, isCompleted: true }], completedQuests: [] };
    const player = { yuan: 0, inventory: [] };
    // Use the real store and set its state for the test
    const us = useGameStore_1.useGameStore;
    us.setState({ player, story });
    const store = us.getState();
    const res = store.claimMissionRewards('m_start');
    expect(res).toBe(true);
    const state = us.getState();
    // The registered template should have produced a new mission title 'E2E Template'
    expect(state.story.activeRandomMissions.some((m) => m.title === 'E2E Template')).toBe(true);
});
