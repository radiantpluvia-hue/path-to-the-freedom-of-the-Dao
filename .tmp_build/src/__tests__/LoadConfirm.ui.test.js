"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
const mockUseGameStore_1 = require("../tests/testUtils/mockUseGameStore");
describe('Load confirmation modal', () => {
    it('shows confirmation and calls loadGame on confirm', () => {
        const loadGameMock = jest.fn();
        const { useGameStoreMock } = (0, mockUseGameStore_1.mockUseGameStore)({ ui: { currentScreen: 'game', saveInProgress: false }, loadGame: loadGameMock });
        // import the component after installing the mock so its module-level import is mocked
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const TopBar = require('@/components/game/TopBar').default;
        (0, react_1.render)((0, jsx_runtime_1.jsx)(TopBar, { currentScreen: "game", setUIProperty: () => { } }));
        const loadBtn = react_1.screen.getByTitle('Load game');
        expect(loadBtn).toBeInTheDocument();
        // Click load — should open modal rather than calling loadGame directly
        react_1.fireEvent.click(loadBtn);
        // Modal title should be visible
        expect(react_1.screen.getByText(/Load saved game\?/i)).toBeInTheDocument();
        // Confirm button should call loadGame
        const confirmBtn = react_1.screen.getByText(/Confirm/i);
        react_1.fireEvent.click(confirmBtn);
        expect(loadGameMock).toHaveBeenCalled();
        // Cleanup mock
        useGameStoreMock.mockRestore?.();
    });
});
