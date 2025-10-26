"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
const mockUseGameStore_1 = require("../tests/testUtils/mockUseGameStore");
const react_2 = require("@testing-library/react");
// Install a mock store that has focusInventory true
const { useGameStoreMock } = (0, mockUseGameStore_1.mockUseGameStore)({
    ui: { currentScreen: 'social', focusInventory: true },
    world: { currentWorldType: 'mortal' }
});
// Import the component after installing the mock
const SocialInterface_1 = require("@/components/game/SocialInterface");
describe('SocialInterface inventory focus', () => {
    it('scrolls inventory into view when focusInventory is set', async () => {
        // Ensure scrollIntoView exists in this test environment, then spy on it
        if (!Element.prototype.scrollIntoView) {
            Element.prototype.scrollIntoView = function () { };
        }
        const scrollSpy = jest.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => undefined);
        (0, react_1.render)((0, jsx_runtime_1.jsx)(SocialInterface_1.SocialInterface, {}));
        // The Inventory card title(s) should be present (component renders nested cards)
        expect(react_1.screen.queryAllByText(/🎒 Inventory/).length).toBeGreaterThanOrEqual(1);
        // Wait for the scrollIntoView call (the UI uses smooth scroll and timers)
        await (0, react_2.waitFor)(() => expect(scrollSpy).toHaveBeenCalled());
        // If an input exists inside the inventory, it should be focused (our UX enhancement)
        const input = react_1.screen.queryByPlaceholderText('Search items...');
        if (input) {
            await (0, react_2.waitFor)(() => expect(document.activeElement).toBe(input));
        }
        scrollSpy.mockRestore();
    });
});
