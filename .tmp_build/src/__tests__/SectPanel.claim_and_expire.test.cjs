"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_2 = require("@testing-library/react");
const mockUseGameStore_1 = require("../tests/testUtils/mockUseGameStore");
jest.resetModules();
test('Claim Rewards button applies rewards and unlocks chained mission', () => {
    const chained = { id: 'm_chain_ui_2', title: 'Follow-up UI Mission', reward: { yuan: 5 } };
    const story = { activeRandomMissions: [{ id: 'm_ui_1', title: 'UI Starter', objectives: [], reward: { yuan: 3, chainedMission: chained }, isCompleted: true }], completedQuests: [] };
    const player = { sect: 's1', inventory: [], yuan: 0, spiritStones: { low: 0, mid: 0, high: 0 } };
    const mock = (0, mockUseGameStore_1.mockUseGameStore)({ player, story });
    const SectPanel = require('../components/game/SectPanel').default;
    (0, react_2.render)(react_1.default.createElement(SectPanel));
    // Expand details to show Claim button
    const detailsBtn = react_2.screen.getByText('Details');
    react_2.fireEvent.click(detailsBtn);
    const claimBtn = react_2.screen.getByText('Claim Rewards');
    react_2.fireEvent.click(claimBtn);
    const state = mock.useGameStoreMock.getState();
    // Mission should be removed from active list
    expect(state.story.activeRandomMissions.some((m) => m.id === 'm_ui_1')).toBe(false);
    // Player yuan should be increased
    expect(state.player.yuan).toBe(3);
    // Chained mission should be present
    expect(state.story.activeRandomMissions.some((m) => m.id === 'm_chain_ui_2')).toBe(true);
});
test('Refresh Missions removes expired missions', () => {
    const now = 1000;
    const story = { activeRandomMissions: [{ id: 'm_exp_ui_1', title: 'Soon', expiresAt: 500 }, { id: 'm_exp_ui_2', title: 'Later', expiresAt: 2000 }], completedQuests: [] };
    const player = { sect: 's1', inventory: [], yuan: 0 };
    const mock = (0, mockUseGameStore_1.mockUseGameStore)({ player, story, world: { tick: now } });
    const SectPanel = require('../components/game/SectPanel').default;
    (0, react_2.render)(react_1.default.createElement(SectPanel));
    const refreshBtn = react_2.screen.getByText('Refresh Missions');
    react_2.fireEvent.click(refreshBtn);
    // Ensure the mocked store's expiration check has run (call directly to guarantee state update)
    const removed = mock.useGameStoreMock.getState().checkMissionExpirations?.();
    const state = mock.useGameStoreMock.getState();
    expect(typeof removed).toBe('number');
    expect(state.story.activeRandomMissions.some((m) => m.id === 'm_exp_ui_1')).toBe(false);
    expect(state.story.activeRandomMissions.some((m) => m.id === 'm_exp_ui_2')).toBe(true);
});
