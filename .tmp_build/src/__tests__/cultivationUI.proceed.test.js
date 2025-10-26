"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
require("@testing-library/jest-dom");
jest.mock('@/store/useGameStore', () => {
    const challenge = { id: 'mortal_mental', name: 'Dao Heart Refinement', description: 'Test', difficulty: 1, requirements: {}, rewards: {}, risks: [] };
    const mockState = {
        player: { manuals: [{ id: 'm1' }], daoHeart: 10, cultivationStartTick: 100, minorStage: 9, currentQi: 0, realmId: 1, realm: 'mortal', skills: {} },
        ui: { isCultivating: false, cultivationProgress: 0 },
        world: { tick: 100 },
        breakthroughSystem: { getAvailableChallenges: () => [challenge] },
        addEventLog: jest.fn()
    };
    return { useGameStore: jest.fn(() => mockState) };
});
const helpers = __importStar(require("@/utils/attemptHelpers"));
const CultivationUI_1 = require("@/components/CultivationUI");
test('Proceed calls performBreakthroughAttempt with selected challengeId', () => {
    const spy = jest.spyOn(helpers, 'performBreakthroughAttempt').mockImplementation(() => true);
    (0, react_1.render)((0, jsx_runtime_1.jsx)(CultivationUI_1.CultivationUI, { onClose: () => { } }));
    const breakthroughBtn = react_1.screen.getByRole('button', { name: /Breakthrough to|Advance to Stage/i });
    react_1.fireEvent.click(breakthroughBtn);
    const attemptButton = react_1.screen.getByRole('button', { name: /Attempt/i });
    expect(attemptButton).toBeInTheDocument();
    react_1.fireEvent.click(attemptButton);
    const proceedBtn = react_1.screen.getByRole('button', { name: /Proceed/i });
    expect(proceedBtn).toBeInTheDocument();
    react_1.fireEvent.click(proceedBtn);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('mortal_mental');
    spy.mockRestore();
});
