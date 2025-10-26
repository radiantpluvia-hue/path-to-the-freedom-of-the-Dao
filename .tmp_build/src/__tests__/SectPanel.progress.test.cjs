"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_2 = require("@testing-library/react");
const mockUseGameStore_1 = require("../tests/testUtils/mockUseGameStore");
jest.resetModules();
test('Details toggle and objective progress update', () => {
    const story = { activeRandomMissions: [{
                id: 'm-prog-1',
                title: 'Progress Mission',
                description: 'Make progress',
                objectives: [{ description: 'Do thing', progress: 0, target: 3 }],
                reward: { yuan: 5 }
            }], completedQuests: [] };
    const addEventLog = jest.fn();
    const updateMissionObjectiveProgress = jest.fn((missionId, idx, delta = 1) => {
        const m = story.activeRandomMissions.find((x) => x.id === missionId);
        if (!m)
            return false;
        m.objectives[idx].progress = (m.objectives[idx].progress || 0) + delta;
        addEventLog('Progress made on mission: ' + m.title);
        return true;
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
    // our mock toggles story in-place but the component is not reactive to the mocked store
    // re-render to pick up the mutated story (tests commonly re-render after mutating mock state)
    (0, react_2.render)(react_1.default.createElement(SectPanel));
    expect(react_2.screen.getByText('Do thing')).toBeTruthy();
    expect(react_2.screen.getByText('0/3')).toBeTruthy();
    // Simulate progress update via store API
    updateMissionObjectiveProgress('m-prog-1', 0, 2);
    // Re-render to pick up mocked state changes
    // (component uses store reference; our mock mutated story in-place so UI should reflect on re-render)
    // Force re-render by requiring and rendering again (simple approach for test)
    (0, react_2.render)(react_1.default.createElement(SectPanel));
    expect(addEventLog).toHaveBeenCalledWith('Progress made on mission: Progress Mission');
    expect(react_2.screen.getByText('2/3')).toBeTruthy();
});
