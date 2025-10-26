"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
const useGameStore_1 = require("@/store/useGameStore");
const EventLog_1 = __importDefault(require("@/components/EventLog"));
// This test ensures the event log auto-scrolls so the newest message is visible
// when a new event is appended. We check the scrollTop equals scrollHeight on the
// event log container after pushing a new entry.
describe('Event Log auto-scroll', () => {
    beforeEach(() => {
        // Reset store eventLog and ensure addEventLog exists
        const s = useGameStore_1.useGameStore.getState();
        useGameStore_1.useGameStore.setState({ eventLog: [], addEventLog: s.addEventLog });
    });
    it('sets scrollTop to scrollHeight when a new event is added (mocked layout)', async () => {
        let container = null;
        // Prepare many events first (wrap in act to avoid React update warnings)
        const manyEvents = Array.from({ length: 30 }, (_, i) => `Initial ${i}`);
        await (0, react_1.act)(async () => {
            useGameStore_1.useGameStore.setState({ eventLog: manyEvents });
        });
        // Render EventLog directly (avoid mounting full GameInterface which brings in many
        // other components and can cause store snapshot loops in JSDOM test env).
        await (0, react_1.act)(async () => {
            (0, react_1.render)((0, jsx_runtime_1.jsx)(EventLog_1.default, {}));
        });
        // Query the EventLog container directly by test id
        container = react_1.screen.getByTestId('event-log-container');
        expect(container).not.toBeNull();
        // JSDOM doesn't compute layout sizes; mock sizes so we can assert scrollTop behavior
        Object.defineProperty(container, 'scrollHeight', { value: 1200, configurable: true });
        Object.defineProperty(container, 'clientHeight', { value: 200, configurable: true });
        // Ensure our mock applied
        expect(container.scrollHeight).toBeGreaterThan(container.clientHeight);
        // Now append a new event via the store's addEventLog (wrapped in act)
        const s = useGameStore_1.useGameStore.getState();
        if (typeof s.addEventLog === 'function') {
            await (0, react_1.act)(async () => {
                s.addEventLog('Newest event for auto-scroll test');
            });
        }
        else {
            await (0, react_1.act)(async () => {
                useGameStore_1.useGameStore.setState({ eventLog: [...manyEvents, 'Newest event for auto-scroll test'] });
            });
        }
        // Wait for render (no-op act)
        await (0, react_1.act)(async () => { });
        // After update the container should have scrolled so newest message is visible
        // With column-reverse, visual top maps to scrollTop == scrollHeight
        expect(container.scrollTop).toBe(container.scrollHeight);
    });
});
