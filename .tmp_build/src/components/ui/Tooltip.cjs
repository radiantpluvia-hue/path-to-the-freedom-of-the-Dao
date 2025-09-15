"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Tooltip;
const jsx_runtime_1 = require("react/jsx-runtime");
// Minimal accessible tooltip: shows content on hover/focus using CSS.
function Tooltip({ children, content }) {
    return ((0, jsx_runtime_1.jsxs)("span", { style: { position: 'relative', display: 'inline-block' }, children: [(0, jsx_runtime_1.jsx)("span", { tabIndex: 0, style: { cursor: 'help' }, children: children }), (0, jsx_runtime_1.jsx)("span", { role: "tooltip", "aria-hidden": true, style: {
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bottom: '125%',
                    whiteSpace: 'nowrap',
                    background: 'rgba(0,0,0,0.85)',
                    color: '#fff',
                    padding: '6px 8px',
                    borderRadius: 4,
                    fontSize: 12,
                    zIndex: 2000,
                    display: 'none'
                }, className: "copilot-tooltip", children: content }), (0, jsx_runtime_1.jsx)("style", { children: `
        .copilot-tooltip-visible { display: inline-block !important }
        span[tabindex]:hover + .copilot-tooltip, span[tabindex]:focus + .copilot-tooltip { display: inline-block }
      ` })] }));
}
