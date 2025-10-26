"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_2 = require("@testing-library/react");
const mockUseGameStore_1 = require("../tests/testUtils/mockUseGameStore");
jest.resetModules();
test('Integration: mission progress reported by MissionSystem helper updates UI and logs', () => {
    const story = { activeRandomMissions: [{
                id: 'm-sys-1',
                title: 'System Mission',
                description: 'Progress driven by system',
                objectives: [{ description: 'Gather ore', progress: 0, target: 2 }],
                reward: { yuan: 2 }
            }], completedQuests: [] };
    const addEventLog = jest.fn();
    // Provide a real updateMissionObjectiveProgress that mutates story in-place
    const updateMissionObjectiveProgress = jest.fn((missionId, idx, delta = 1) => {
        const m = story.activeRandomMissions.find((x) => x.id === missionId);
        if (!m)
            return false;
        m.objectives[idx].progress = (m.objectives[idx].progress || 0) + delta;
        addEventLog('System reported progress on: ' + m.title);
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
    const { reportMissionObjectiveProgress } = require('../systems/MissionSystem');
    (0, react_2.render)(react_1.default.createElement(SectPanel));
    // Open details
    const detailsBtn = react_2.screen.getByText('Details');
    react_2.fireEvent.click(detailsBtn);
    (0, react_2.render)(react_1.default.createElement(SectPanel));
    expect(react_2.screen.getByText('Gather ore')).toBeTruthy();
    expect(react_2.screen.getByText('0/2')).toBeTruthy();
    // Call the system helper which should call into the store mock's update
    reportMissionObjectiveProgress('m-sys-1', 0, 1);
    // Re-render to pick up mutated mock state
    (0, react_2.render)(react_1.default.createElement(SectPanel));
    expect(addEventLog).toHaveBeenCalledWith('System reported progress on: System Mission');
    expect(react_2.screen.getByText('1/2')).toBeTruthy();
});
