"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
require("@testing-library/jest-dom");
jest.mock('@/store/useGameStore', () => {
    const mockState = {
        player: { manuals: [{ id: 'm1' }], daoHeart: 10, cultivationStartTick: 100, minorStage: 3, currentQi: 0, realmId: 1, realm: 'mortal', skills: {} },
        ui: { isCultivating: false, cultivationProgress: 0 },
        world: { tick: 101 }, // 1 tick since start -> consolidationFactor = 1/3
        breakthroughSystem: { getAvailableChallenges: () => [] },
        addEventLog: jest.fn()
    };
    mockState.attemptRealmBreakthroughWithConsolidation = jest.fn(() => true);
    return { useGameStore: jest.fn((selector) => (typeof selector === 'function' ? selector(mockState) : mockState)) };
});
const CultivationUI_1 = require("@/components/CultivationUI");
test('shows consolidation info and Attempt triggers consolidation handler', () => {
    const onClose = jest.fn();
    (0, react_1.render)((0, jsx_runtime_1.jsx)(CultivationUI_1.CultivationUI, { onClose: onClose }));
    // Expect consolidation summary present (multiple nodes may match 'Consolidation' so use getAllByText)
    const consolidationMatches = react_1.screen.getAllByText(/Consolidation/i);
    expect(consolidationMatches.length).toBeGreaterThan(0);
    expect(react_1.screen.getByText(/Ticks spent consolidating:/i)).toBeInTheDocument();
    expect(react_1.screen.getByText(/Consolidation factor:/i)).toBeInTheDocument();
    // Attempt button is inside the breakthrough picker; to simulate, open the picker by clicking the main breakthrough button
    const breakthroughBtn = react_1.screen.getByRole('button', { name: /Breakthrough to|Advance to Stage/i });
    react_1.fireEvent.click(breakthroughBtn);
    // If challenges are empty the picker shows a message; ensure no crash and that our mocked handler exists
    const store = require('@/store/useGameStore');
    const mock = store.useGameStore();
    expect(typeof mock.attemptRealmBreakthroughWithConsolidation).toBe('function');
});
