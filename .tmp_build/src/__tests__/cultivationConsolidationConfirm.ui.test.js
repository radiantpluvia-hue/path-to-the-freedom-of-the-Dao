"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
require("@testing-library/jest-dom");
jest.mock('@/store/useGameStore', () => {
    const challenge = { id: 'mortal_mental', name: 'Dao Heart Refinement', description: 'Test', difficulty: 1, requirements: {}, rewards: {}, risks: [] };
    const mockState = {
        // Set minorStage to the realm's max (9) so the major realm breakthrough picker is shown
        player: { manuals: [{ id: 'm1' }], daoHeart: 10, cultivationStartTick: 100, minorStage: 9, currentQi: 0, realmId: 1, realm: 'mortal', skills: {} },
        ui: { isCultivating: false, cultivationProgress: 0 },
        world: { tick: 100 }, // 0 ticks -> consolidationFactor 0 -> penalty = daoHeart (10) catastrophic
        breakthroughSystem: { getAvailableChallenges: () => [challenge] },
        addEventLog: jest.fn()
    };
    mockState.attemptRealmBreakthroughWithConsolidation = jest.fn(() => true);
    return { useGameStore: jest.fn((selector) => (typeof selector === 'function' ? selector(mockState) : mockState)) };
});
const CultivationUI_1 = require("@/components/CultivationUI");
test('shows confirmation when penalty catastrophic and Proceed calls store handler', () => {
    (0, react_1.render)((0, jsx_runtime_1.jsx)(CultivationUI_1.CultivationUI, { onClose: () => { } }));
    // Open breakthrough picker by clicking the main breakthrough button
    const breakthroughBtn = react_1.screen.getByRole('button', { name: /Breakthrough to|Advance to Stage/i });
    react_1.fireEvent.click(breakthroughBtn);
    // The picker should render our single challenge and show an Attempt button
    const attemptButton = react_1.screen.getByRole('button', { name: /Attempt/i });
    expect(attemptButton).toBeInTheDocument();
    react_1.fireEvent.click(attemptButton);
    // Now the confirmation modal should be visible because penalty is catastrophic
    const proceedBtn = react_1.screen.getByRole('button', { name: /Proceed/i });
    expect(proceedBtn).toBeInTheDocument();
    react_1.fireEvent.click(proceedBtn);
    // For safety, assert our mocked handler exists and was called once after Proceed
    const store = require('@/store/useGameStore');
    const mock = store.useGameStore();
    expect(typeof mock.attemptRealmBreakthroughWithConsolidation).toBe('function');
    expect(mock.attemptRealmBreakthroughWithConsolidation).toHaveBeenCalledTimes(1);
});
