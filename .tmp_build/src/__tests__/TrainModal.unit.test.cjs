"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
const mockUseGameStore_1 = require("../tests/testUtils/mockUseGameStore");
describe('TrainModal additional UI tests', () => {
    afterEach(() => jest.restoreAllMocks());
    // Install a single mocked store and a single TrainModal module instance so the
    // component always calls the same mocked hook function. This avoids module cache
    // and mocking-order issues where different tests reinstall different mocks.
    let useGameStoreMock;
    let TrainModal;
    beforeAll(() => {
        const res = (0, mockUseGameStore_1.mockUseGameStore)({ player: { realm: 1, inventory: {} } });
        useGameStoreMock = res.useGameStoreMock;
        // require the UI after the mock is installed so it binds to the mocked hook
        TrainModal = require('../ui/trainModal').default;
    });
    it('disables Start when required items are missing', () => {
        // Player missing sacrificial_incense needed for heart_demon_confrontation
        useGameStoreMock.setState({ player: { realm: 8, inventory: {} } });
        (0, react_1.render)((0, jsx_runtime_1.jsx)(TrainModal, { open: true, onClose: () => { } }));
        // find the training row by its name
        const row = react_1.screen.getByText(/Heart Demon Confrontation/i)?.closest('.training-row') || react_1.screen.getByText(/Heart Demon Confrontation/i)?.parentElement;
        expect(row).toBeTruthy();
        const btn = (0, react_1.within)(row).getByRole('button', { name: /start/i });
        expect(btn).toBeDisabled();
    });
    it('shows confirmation dialog and calls startTraining when confirming high-risk training', () => {
        const startMock = jest.fn(() => ({ ok: true }));
        // Provide required item so Start is enabled
        const player = { realm: 8, inventory: { sacrificial_incense: 1 }, cooldowns: {}, trainingQueue: null };
        // Update the mocked store state to include the player and the mocked startTrainingById
        useGameStoreMock.setState({ player, startTrainingById: startMock });
        // Sanity-check the training helper directly with the player shape used in the test
        const { hasRequiredItems } = require('../game/training');
        expect(hasRequiredItems(player, ['sacrificial_incense'])).toBe(true);
        (0, react_1.render)((0, jsx_runtime_1.jsx)(TrainModal, { open: true, onClose: () => { } }));
        // find the Heart Demon row and click Start (should open confirmation)
        const row = react_1.screen.getByText(/Heart Demon Confrontation/i)?.closest('.training-row') || react_1.screen.getByText(/Heart Demon Confrontation/i)?.parentElement;
        expect(row).toBeTruthy();
        const startBtn = (0, react_1.within)(row).getByRole('button', { name: /start/i });
        expect(startBtn).not.toBeDisabled();
        react_1.fireEvent.click(startBtn);
        // Confirmation dialog should appear — find the dialog that contains the confirmation text
        const dialogs = react_1.screen.getAllByRole('dialog', { hidden: true });
        const confirm = dialogs.find(d => /This training may have severe consequences/i.test(d.textContent || '')) || react_1.screen.getByText(/This training may have severe consequences/i);
        expect(confirm).toBeTruthy();
        // Click Confirm (button text may be 'Confirm')
        const confirmBtn = react_1.screen.getByRole('button', { name: /confirm/i });
        react_1.fireEvent.click(confirmBtn);
        // startTrainingById mock should have been called
        expect(startMock).toHaveBeenCalled();
    });
});
