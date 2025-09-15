"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodexList = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const codexEntries_1 = __importDefault(require("../data/codexEntries"));
require("../styles/codex.css");
// Optional virtualization via react-window. It's a soft dependency used only when the
// `virtualize` prop is true. This keeps the default bundle small for small codex sizes.
let FixedSizeList = null;
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    FixedSizeList = require('react-window').FixedSizeList;
}
catch (e) {
    FixedSizeList = null;
}
const allEntries = Object.values(codexEntries_1.default);
const CodexList = ({ virtualize = false, height = 400 }) => {
    const [query, setQuery] = (0, react_1.useState)('');
    const filtered = (0, react_1.useMemo)(() => {
        const q = query.trim().toLowerCase();
        if (!q)
            return allEntries;
        return allEntries.filter((e) => (e.title.toLowerCase().includes(q) ||
            (e.summary || '').toLowerCase().includes(q) ||
            e.content.join(' ').toLowerCase().includes(q) ||
            (e.tags || []).join(' ').toLowerCase().includes(q)));
    }, [query]);
    const renderEntry = (entry) => ((0, jsx_runtime_1.jsxs)("details", { className: "codex-entry", "data-testid": `codex-entry-${entry.id}`, children: [(0, jsx_runtime_1.jsx)("summary", { className: "codex-entry-summary", children: entry.title }), (0, jsx_runtime_1.jsxs)("div", { className: "codex-entry-body", children: [entry.summary && (0, jsx_runtime_1.jsx)("p", { className: "codex-entry-summary-text", children: (0, jsx_runtime_1.jsx)("em", { children: entry.summary }) }), entry.content.map((p, i) => (0, jsx_runtime_1.jsx)("p", { className: "codex-entry-paragraph", children: p }, i))] })] }, entry.id));
    if (virtualize && FixedSizeList) {
        const Row = ({ index, style }) => {
            const entry = filtered[index];
            return ((0, jsx_runtime_1.jsx)("div", { style: style, children: renderEntry(entry) }));
        };
        return ((0, jsx_runtime_1.jsxs)("div", { className: "codex-list", children: [(0, jsx_runtime_1.jsx)("div", { className: "codex-search-row", children: (0, jsx_runtime_1.jsx)("input", { "aria-label": "Search codex", placeholder: "Search codex...", value: query, onChange: (e) => setQuery(e.target.value), className: "codex-search-input" }) }), (0, jsx_runtime_1.jsx)(FixedSizeList, { height: height, itemCount: filtered.length, itemSize: 88, width: "100%", children: Row })] }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "codex-list", children: [(0, jsx_runtime_1.jsx)("div", { className: "codex-search-row", children: (0, jsx_runtime_1.jsx)("input", { "aria-label": "Search codex", placeholder: "Search codex...", value: query, onChange: (e) => setQuery(e.target.value), className: "codex-search-input" }) }), (0, jsx_runtime_1.jsx)("div", { className: "codex-grid", children: filtered.map((entry) => renderEntry(entry)) })] }));
};
exports.CodexList = CodexList;
exports.default = exports.CodexList;
