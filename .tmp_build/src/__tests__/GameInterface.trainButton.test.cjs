"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
const mockUseGameStore_1 = require("../tests/testUtils/mockUseGameStore");
const GameInterface_1 = require("@/components/game/GameInterface");
describe('GameInterface train button', () => {
    it('opens the TrainModal when Train button is clicked', () => {
        // Provide a minimal mocked store for rendering the UI
        (0, mockUseGameStore_1.mockUseGameStore)({ ui: { currentScreen: 'game' }, player: { inventory: [] } });
        (0, react_1.render)((0, jsx_runtime_1.jsx)(GameInterface_1.GameInterface, {}));
        // The Train button should be present in the cultivation panel
        const btn = react_1.screen.getByText('Train');
        expect(btn).toBeTruthy();
        react_1.fireEvent.click(btn);
        // The modal should show training options
        expect(react_1.screen.getByText(/Choose a training method/i)).toBeTruthy();
        // Use role lookup to avoid collisions with descriptive text elsewhere; allow multiple matches
        const cmpBtns = react_1.screen.getAllByRole('button', { name: /Comprehend Manual/i });
        expect(cmpBtns.length).toBeGreaterThanOrEqual(1);
    });
});
