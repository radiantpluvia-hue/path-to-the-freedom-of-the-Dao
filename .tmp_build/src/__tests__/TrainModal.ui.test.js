"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
const mockUseGameStore_1 = require("../tests/testUtils/mockUseGameStore");
// TrainModal imports use a relative path to the store. To ensure our test mock
// is applied correctly we require the component after installing the jest mock
// (mockUseGameStore registers a jest.mock for the alias; some files use
// relative imports so we load the component after mocking the module view).
describe('TrainModal UI', () => {
    it('calls the comprehend training method in test env when clicking Comprehend Manual', () => {
        const comprehendMock = jest.fn(() => ({ success: true, message: 'trained' }));
        const { useGameStoreMock } = (0, mockUseGameStore_1.mockUseGameStore)({ ui: { showTechniqueMastery: false }, trainComprehendManual: comprehendMock });
        // require the component after installing the mock so relative imports pick up the mocked store
        const TrainModal = require('../components/game/TrainModal').default;
        const onClose = jest.fn();
        (0, react_1.render)((0, jsx_runtime_1.jsx)(TrainModal, { open: true, onClose: onClose }));
        const btn = react_1.screen.getByText('Comprehend Manual');
        react_1.fireEvent.click(btn);
        const stateFn = useGameStoreMock.getState().trainComprehendManual;
        expect(stateFn).toHaveBeenCalled();
        // the UI should show the training result message synchronously in test env
        expect(react_1.screen.getByText(/trained/i)).toBeTruthy();
    });
    it('calls onClose when Close button is clicked', () => {
        (0, mockUseGameStore_1.mockUseGameStore)({ ui: { showTechniqueMastery: false } });
        const TrainModal = require('../components/game/TrainModal').default;
        const onClose = jest.fn();
        (0, react_1.render)((0, jsx_runtime_1.jsx)(TrainModal, { open: true, onClose: onClose }));
        const closeBtn = react_1.screen.getByText('Close');
        react_1.fireEvent.click(closeBtn);
        expect(onClose).toHaveBeenCalled();
    });
});
