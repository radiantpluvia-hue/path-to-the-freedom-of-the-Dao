"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
const mockUseGameStore_1 = require("../tests/testUtils/mockUseGameStore");
const makeMission = (id = 'm1') => ({ id, title: 'Test Mission', description: 'Collect herbs', objectives: [] });
describe('SectPanel mission flow', () => {
    test('Accept calls completeMission or attemptMission', () => {
        jest.resetModules();
        const completeMission = jest.fn(() => true);
        const attemptMission = jest.fn(() => true);
        const story = { activeRandomMissions: [makeMission()] };
        (0, mockUseGameStore_1.mockUseGameStore)({ player: { sect: 's1', inventory: [] }, story, completeMission, attemptMission });
        // require after mocking
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const SectPanel = require('../components/game/SectPanel').default;
        (0, react_1.render)((0, jsx_runtime_1.jsx)(SectPanel, {}));
        expect(react_1.screen.getByText(/Test Mission/i)).toBeInTheDocument();
        const acceptBtn = react_1.screen.getByRole('button', { name: /Accept/i });
        react_1.fireEvent.click(acceptBtn);
        // either completeMission or attemptMission should have been called
        expect(completeMission.mock.calls.length + attemptMission.mock.calls.length).toBeGreaterThan(0);
    });
    test('Decline calls declineSectMission', () => {
        jest.resetModules();
        const declineSectMission = jest.fn();
        const story = { activeRandomMissions: [makeMission('m2')] };
        (0, mockUseGameStore_1.mockUseGameStore)({ player: { sect: 's1', inventory: [] }, story, declineSectMission });
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const SectPanel = require('../components/game/SectPanel').default;
        (0, react_1.render)((0, jsx_runtime_1.jsx)(SectPanel, {}));
        const declineBtn = react_1.screen.getByRole('button', { name: /Decline/i });
        react_1.fireEvent.click(declineBtn);
        expect(declineSectMission).toHaveBeenCalledWith('m2');
    });
});
