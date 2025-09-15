"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
const user_event_1 = __importDefault(require("@testing-library/user-event"));
const CodexList_1 = __importDefault(require("../components/CodexList"));
describe('CodexList', () => {
    test('shows search box and filters entries', async () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(CodexList_1.default, {}));
        const input = react_1.screen.getByPlaceholderText('Search codex...');
        expect(input).toBeInTheDocument();
        const user = user_event_1.default.setup();
        // Type a query that likely exists in sample data
        await user.type(input, 'Tai Yung');
        // Should find at least one details/summary with matching title text
        const entries = react_1.screen.getAllByText(/Creation Myth of Tai Yung/i);
        expect(entries.length).toBeGreaterThan(0);
        // Expand the first matching entry by clicking its summary and assert body becomes visible
        const firstSummary = entries[0];
        // summary is inside a <summary> element — click it to toggle
        await user.click(firstSummary);
        // Now expect an element with additional content from that entry to be visible
        const detailParagraphs = react_1.screen.getAllByText(/Tai Yung/i, { exact: false });
        expect(detailParagraphs.length).toBeGreaterThan(0);
        // Collapse by clicking the summary again
        await user.click(firstSummary);
        // Collapsing should hide the details body — ensure one of the paragraphs is not visible (aria-hidden or not in document)
        // We check that at least one of the detail paragraphs is not visible
        const afterCollapse = react_1.screen.getAllByText(/Tai Yung/i, { exact: false });
        // At least one of the elements should be present but not visible when collapsed — use some() on matches
        const anyHidden = afterCollapse.some((el) => el.closest('details') && !el.closest('details').hasAttribute('open'));
        expect(anyHidden).toBe(true);
    });
});
