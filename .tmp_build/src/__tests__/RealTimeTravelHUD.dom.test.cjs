"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
const RealTimeTravelHUD_1 = __importDefault(require("@/components/game/RealTimeTravelHUD"));
const useGameStore_1 = require("@/store/useGameStore");
describe('RealTimeTravelHUD DOM', () => {
    afterEach(() => {
        // clear active travel
        const s = useGameStore_1.useGameStore.getState();
        useGameStore_1.useGameStore.setState({ player: { ...s.player, activeTravel: null } });
    });
    test('does not render when no active travel', async () => {
        const s = useGameStore_1.useGameStore.getState();
        useGameStore_1.useGameStore.setState({ player: { ...s.player, activeTravel: null } });
        await (0, react_1.act)(async () => (0, react_1.render)((0, jsx_runtime_1.jsx)(RealTimeTravelHUD_1.default, {})));
        expect(document.body.textContent || '').not.toMatch(/Travelling to/i);
    });
    test('renders HUD when active travel present', async () => {
        const s = useGameStore_1.useGameStore.getState();
        const travel = { toNodeId: 'village_1', meta: { realTime: true, realTimeDurationSeconds: 10, arrivalEpochMs: Date.now() + 5000 } };
        useGameStore_1.useGameStore.setState({ player: { ...s.player, activeTravel: travel } });
        await (0, react_1.act)(async () => (0, react_1.render)((0, jsx_runtime_1.jsx)(RealTimeTravelHUD_1.default, {})));
        expect(document.body.textContent || '').toMatch(/Travelling to village 1/i);
    });
});
