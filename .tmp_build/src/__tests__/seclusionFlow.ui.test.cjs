"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
require("@testing-library/jest-dom");
jest.mock('@/store/useGameStore', () => {
    const mockState = {
        player: { cultivationDaysAllocated: 365, manuals: [], skills: {} },
        ui: { seclusionProgress: 100, seclusionReadyForBreakthrough: true },
    };
    mockState.enterSeclusion = jest.fn(() => { mockState.ui.isInSeclusion = true; });
    mockState.exitSeclusion = jest.fn(() => { mockState.ui.isInSeclusion = false; });
    mockState.performSeclusionStudy = jest.fn(() => { });
    mockState.attemptRealmBreakthroughWithConsolidation = jest.fn(() => { });
    mockState.addEventLog = jest.fn(() => { });
    return { useGameStore: jest.fn((selector) => (typeof selector === 'function' ? selector(mockState) : mockState)) };
});
const SeclusionPanel_1 = __importDefault(require("@/components/SeclusionPanel"));
test('SeclusionPanel shows progress and attempts breakthrough when ready', () => {
    const store = require('@/store/useGameStore');
    const mock = store.useGameStore();
    (0, react_1.render)((0, jsx_runtime_1.jsx)(SeclusionPanel_1.default, {}));
    expect(react_1.screen.getByText(/Seclusion Progress:/i)).toBeInTheDocument();
    const btn = react_1.screen.getByRole('button', { name: /Attempt Breakthrough/i });
    expect(btn).toBeEnabled();
    react_1.fireEvent.click(btn);
    expect(mock.attemptRealmBreakthroughWithConsolidation).toHaveBeenCalledWith('seclusion_auto');
});
