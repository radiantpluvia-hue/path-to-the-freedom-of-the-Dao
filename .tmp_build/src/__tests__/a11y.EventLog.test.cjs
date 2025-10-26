"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
const jest_axe_1 = require("jest-axe");
const EventLog_1 = __importDefault(require("@/components/EventLog"));
const useGameStore_1 = require("@/store/useGameStore");
expect.extend(jest_axe_1.toHaveNoViolations);
describe('EventLog accessibility', () => {
    beforeEach(() => {
        const s = useGameStore_1.useGameStore.getState();
        // Use getState and mutate in test via cast - this is test-only and avoids typing issues
        s.eventLog = ['Welcome', 'You found a blade'];
    });
    it('has no basic a11y violations', async () => {
        const { container } = (0, react_1.render)((0, jsx_runtime_1.jsx)(EventLog_1.default, {}));
        const results = await (0, jest_axe_1.axe)(container);
        expect(results).toHaveNoViolations();
    });
});
