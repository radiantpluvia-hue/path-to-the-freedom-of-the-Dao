"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
const mockUseGameStore_1 = require("../tests/testUtils/mockUseGameStore");
describe('SectPanel', () => {
    test('renders member view and calls leaveSect and requestSectMission', () => {
        const leaveSect = jest.fn();
        const requestSectMission = jest.fn();
        const setUIProperty = jest.fn();
        const addEventLog = jest.fn();
        // reset module registry so each test can install its own mock state
        jest.resetModules();
        (0, mockUseGameStore_1.mockUseGameStore)({
            player: { sect: 'test_sect', inventory: [{ id: 'x' }], spiritStones: { low: 0, mid: 0, high: 0 } },
            leaveSect,
            requestSectMission,
            setUIProperty,
            addEventLog,
            getSectReputation: (id) => 42,
        });
        // require after mocking so the module picks up the jest mock
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const SectPanel = require('../components/game/SectPanel').default;
        (0, react_1.render)((0, jsx_runtime_1.jsx)(SectPanel, {}));
        // member heading and reputation (match combined text)
        expect(react_1.screen.getByText(/Member of:/i)).toBeInTheDocument();
        expect(react_1.screen.getByText(/Reputation:\s*42/i)).toBeInTheDocument();
        // Request mission
        const requestBtn = react_1.screen.getByRole('button', { name: /Request Sect Mission/i });
        react_1.fireEvent.click(requestBtn);
        expect(requestSectMission).toHaveBeenCalled();
        // Leave sect
        const leaveBtn = react_1.screen.getByRole('button', { name: /Leave Sect/i });
        react_1.fireEvent.click(leaveBtn);
        expect(leaveSect).toHaveBeenCalled();
        expect(addEventLog).toHaveBeenCalledWith('You left your sect.');
    });
    test('renders non-member view and Browse Sects navigates to sects screen', () => {
        const setUIProperty = jest.fn();
        jest.resetModules();
        (0, mockUseGameStore_1.mockUseGameStore)({ player: { sect: null, inventory: [] }, setUIProperty });
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const SectPanel = require('../components/game/SectPanel').default;
        (0, react_1.render)((0, jsx_runtime_1.jsx)(SectPanel, {}));
        expect(react_1.screen.getByText(/You are not a member of any sect/i)).toBeInTheDocument();
        const browseBtn = react_1.screen.getByRole('button', { name: /Browse Sects/i });
        react_1.fireEvent.click(browseBtn);
        expect(setUIProperty).toHaveBeenCalledWith('currentScreen', 'sects');
    });
});
