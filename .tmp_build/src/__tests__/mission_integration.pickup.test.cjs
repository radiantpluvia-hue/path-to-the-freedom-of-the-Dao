"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
jest.resetModules();
const mockUseGameStore_1 = require("../tests/testUtils/mockUseGameStore");
test('PickupSystem.notifyItemPicked updates mission objectives', () => {
    jest.resetModules();
    const story = { activeRandomMissions: [{
                id: 'm-pickup-1',
                title: 'Collector',
                description: 'Pick up a mysterious token',
                objectives: [{ description: 'Get token', progress: 0, target: 'mysterious_token' }],
                reward: { yuan: 3 }
            }] };
    const updateMissionObjectiveProgress = jest.fn((missionId, idx, delta = 1) => {
        const m = story.activeRandomMissions.find((x) => x.id === missionId);
        if (!m)
            return false;
        m.objectives[idx].progress = (m.objectives[idx].progress || 0) + delta;
        return true;
    });
    (0, mockUseGameStore_1.mockUseGameStore)({ player: { sect: 's1', inventory: [] }, story, updateMissionObjectiveProgress });
    const Pickup = require('../systems/PickupSystem').PickupSystem;
    const ps = new Pickup();
    ps.notifyItemPicked('mysterious_token');
    expect(story.activeRandomMissions[0].objectives[0].progress).toBe(1);
    expect(updateMissionObjectiveProgress.mock.calls.length).toBeGreaterThanOrEqual(1);
});
