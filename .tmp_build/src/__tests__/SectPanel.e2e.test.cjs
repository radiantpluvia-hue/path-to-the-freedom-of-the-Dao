"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_2 = require("@testing-library/react");
const mockUseGameStore_1 = require("../tests/testUtils/mockUseGameStore");
jest.resetModules();
test('End-to-end: mission objective updated by external system is reflected in UI and event log', () => {
    const story = { activeRandomMissions: [{
                id: 'm-e2e-1',
                title: 'E2E Mission',
                description: 'External update',
                objectives: [{ description: 'Collect shards', progress: 0, target: 2 }],
                reward: { yuan: 3 }
            }], completedQuests: [] };
    const addEventLog = jest.fn();
    // Provide the real updateMissionObjectiveProgress implementation inside the mock so
    // external systems can call it as they would in production.
    const updateMissionObjectiveProgress = jest.fn((missionId, idx, delta = 1) => {
        const m = story.activeRandomMissions.find((x) => x.id === missionId);
        if (!m)
            return false;
        m.objectives[idx].progress = (m.objectives[idx].progress || 0) + delta;
        addEventLog('External system updated mission progress: ' + m.title);
        return true;
    });
    // Simulate an external system that will call into the store's update API when triggered
    const externalSystemTrigger = jest.fn((missionId) => {
        // In production, this would be something like sharedMissionSystem.onEvent -> store.updateMissionObjectiveProgress
        return updateMissionObjectiveProgress(missionId, 0, 1);
    });
    const toggleMissionDetails = jest.fn((missionId) => {
        const m = story.activeRandomMissions.find((x) => x.id === missionId);
        if (!m)
            return false;
        m._uiExpanded = !m._uiExpanded;
        return m._uiExpanded;
    });
    (0, mockUseGameStore_1.mockUseGameStore)({ player: { sect: 's1', inventory: [] }, story, updateMissionObjectiveProgress, addEventLog, toggleMissionDetails });
    const SectPanel = require('../components/game/SectPanel').default;
    (0, react_2.render)(react_1.default.createElement(SectPanel));
    // Open details
    const detailsBtn = react_2.screen.getByText('Details');
    react_2.fireEvent.click(detailsBtn);
    (0, react_2.render)(react_1.default.createElement(SectPanel));
    expect(react_2.screen.getByText('Collect shards')).toBeTruthy();
    expect(react_2.screen.getByText('0/2')).toBeTruthy();
    // Trigger external system to update mission progress
    externalSystemTrigger('m-e2e-1');
    // Re-render to pick up mutated mock story
    (0, react_2.render)(react_1.default.createElement(SectPanel));
    expect(addEventLog).toHaveBeenCalledWith('External system updated mission progress: E2E Mission');
    expect(react_2.screen.getByText('1/2')).toBeTruthy();
});
