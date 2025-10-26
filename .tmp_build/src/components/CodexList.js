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
const _FixedSizeList = null;
void _FixedSizeList;
// Defer loading react-window until requested to avoid making it a hard dependency for the main bundle.
// We'll perform a dynamic import at render-time when virtualization is requested.
const allEntries = Object.values(codexEntries_1.default);
const CodexList = ({ virtualize = false, height = 400 }) => {
    const [query, setQuery] = (0, react_1.useState)('');
    const [windowLoaded, setWindowLoaded] = (0, react_1.useState)(false);
    const [WindowComponent, setWindowComponent] = (0, react_1.useState)(null);
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
    if (virtualize) {
        // kick off dynamic import on-demand
        if (!windowLoaded) {
            // react-window is optional; attempt to load it and mark loaded regardless so UI doesn't hang
            Promise.resolve().then(() => __importStar(require('react-window'))).then((mod) => { setWindowComponent(mod.FixedSizeList || mod.FixedSizeList); setWindowLoaded(true); }).catch(() => { setWindowLoaded(true); });
            return (0, jsx_runtime_1.jsx)("div", { className: "codex-list", children: "Loading..." });
        }
        if (WindowComponent) {
            const Row = ({ index, style }) => {
                const entry = filtered[index];
                return ((0, jsx_runtime_1.jsx)("div", { style: style, children: renderEntry(entry) }));
            };
            return ((0, jsx_runtime_1.jsxs)("div", { className: "codex-list", children: [(0, jsx_runtime_1.jsx)("div", { className: "codex-search-row", children: (0, jsx_runtime_1.jsx)("input", { "aria-label": "Search codex", placeholder: "Search codex...", value: query, onChange: (e) => setQuery(e.target.value), className: "codex-search-input" }) }), (0, jsx_runtime_1.jsx)(WindowComponent, { height: height, itemCount: filtered.length, itemSize: 88, width: "100%", children: Row })] }));
        }
        return (0, jsx_runtime_1.jsx)("div", { className: "codex-list", children: "No virtualization available." });
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "codex-list", children: [(0, jsx_runtime_1.jsx)("div", { className: "codex-search-row", children: (0, jsx_runtime_1.jsx)("input", { "aria-label": "Search codex", placeholder: "Search codex...", value: query, onChange: (e) => setQuery(e.target.value), className: "codex-search-input" }) }), (0, jsx_runtime_1.jsx)("div", { className: "codex-grid", children: filtered.map((entry) => renderEntry(entry)) })] }));
};
exports.CodexList = CodexList;
exports.default = exports.CodexList;
