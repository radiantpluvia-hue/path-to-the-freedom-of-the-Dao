"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
const EventLog_1 = __importDefault(require("@/components/EventLog"));
const useGameStore_1 = require("@/store/useGameStore");
describe('EventLog component unit', () => {
    beforeEach(() => {
        // ensure a clean eventLog
        const s = useGameStore_1.useGameStore.getState();
        useGameStore_1.useGameStore.setState({ eventLog: [], addEventLog: s.addEventLog });
    });
    it('writes scrollTop equal to scrollHeight on ref when events append', () => {
        const mockRef = { current: null };
        // initial render with empty log
        (0, react_1.render)((0, jsx_runtime_1.jsx)(EventLog_1.default, { forwardedRef: mockRef }));
        const el = mockRef.current;
        expect(el).toBeTruthy();
        // mock sizes on the real DOM element (JSDOM doesn't compute layout)
        Object.defineProperty(el, 'scrollHeight', { value: 500, configurable: true });
        Object.defineProperty(el, 'clientHeight', { value: 100, configurable: true });
        // ensure initial state
        el.scrollTop = 0;
        const s = useGameStore_1.useGameStore.getState();
        (0, react_1.act)(() => {
            // simulate adding events which should trigger the auto-scroll effect
            s.addEventLog('one');
            s.addEventLog('two');
            // update scrollHeight to simulate more content
            Object.defineProperty(el, 'scrollHeight', { value: 800, configurable: true });
        });
        // After the store update and effect, scrollTop should be set to scrollHeight
        expect(el.scrollTop).toBe(el.scrollHeight);
    });
});
