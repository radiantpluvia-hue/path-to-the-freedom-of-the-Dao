"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodexModal = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
require("./src/styles/codex.css");
const CodexList_1 = __importDefault(require("./src/components/CodexList"));
const CodexModal = ({ open, onClose, children }) => {
    const overlayRef = (0, react_1.useRef)(null);
    const previouslyFocused = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        if (!open)
            return;
        // Save focus and move to modal
        previouslyFocused.current = document.activeElement;
        const firstFocusable = overlayRef.current?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        firstFocusable?.focus();
        const onKey = (e) => {
            if (e.key === 'Escape')
                onClose();
        };
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('keydown', onKey);
            previouslyFocused.current?.focus();
        };
    }, [open, onClose]);
    if (!open)
        return null;
    return ((0, jsx_runtime_1.jsx)("div", { className: "codex-modal-overlay", role: "dialog", "aria-modal": "true", "aria-label": "Codex", ref: overlayRef, onClick: (e) => {
            // close when clicking on the overlay (but not when clicking inside modal)
            if (e.target === overlayRef.current)
                onClose();
        }, children: (0, jsx_runtime_1.jsxs)("div", { className: "codex-modal", role: "document", children: [(0, jsx_runtime_1.jsx)("button", { "aria-label": "Close codex", className: "codex-close", onClick: onClose, children: "\u00D7" }), (0, jsx_runtime_1.jsx)("h2", { className: "codex-title", children: "Codex" }), (0, jsx_runtime_1.jsx)("div", { className: "codex-content", children: children || (0, jsx_runtime_1.jsx)(CodexList_1.default, {}) })] }) }));
};
exports.CodexModal = CodexModal;
exports.default = exports.CodexModal;
