"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HelpOverlay;
const jsx_runtime_1 = require("react/jsx-runtime");
const ModalCloseButton_1 = __importDefault(require("@/components/ui/ModalCloseButton"));
function HelpOverlay({ open, onClose }) {
    if (!open)
        return null;
    return ((0, jsx_runtime_1.jsx)("div", { style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }, role: "dialog", "aria-modal": "true", "aria-label": "Help", children: (0, jsx_runtime_1.jsxs)("div", { style: { background: 'var(--card-bg)', padding: 20, borderRadius: 8, maxWidth: 800, width: '90%' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)("h2", { style: { margin: 0 }, children: "Keyboard Shortcuts" }), (0, jsx_runtime_1.jsx)(ModalCloseButton_1.default, { onClick: onClose, ariaLabel: "Close help", title: "Close" })] }), (0, jsx_runtime_1.jsxs)("ul", { style: { marginTop: 12 }, children: [(0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "?" }), " \u2014 Toggle this help overlay"] }), (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "C" }), " \u2014 Quick cultivate"] }), (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "E" }), " \u2014 Explore"] }), (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "S" }), " \u2014 Save game"] }), (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "L" }), " \u2014 Load game"] }), (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "X" }), " \u2014 Toggle Codex"] })] }), (0, jsx_runtime_1.jsx)("p", { style: { marginTop: 10, color: 'var(--muted)' }, children: "These shortcuts are active when the game UI has focus." })] }) }));
}
