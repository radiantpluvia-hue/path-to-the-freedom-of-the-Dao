"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModalCloseButton = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const ModalCloseButton = ({ onClick, ariaLabel = 'Close', title = 'Close', size = 18 }) => {
    return ((0, jsx_runtime_1.jsx)("button", { type: "button", onClick: onClick, "aria-label": ariaLabel, title: title, style: {
            float: 'right',
            background: 'rgba(255,255,255,0.06)',
            border: 'none',
            color: 'var(--text)',
            padding: 8,
            marginRight: -8,
            cursor: 'pointer',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 120ms ease, transform 120ms ease'
        }, onMouseOver: (e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(-1px)'; }, onMouseOut: (e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.transform = 'none'; }, children: (0, jsx_runtime_1.jsxs)("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", style: { width: size, height: size, display: 'block' }, "aria-hidden": "true", focusable: "false", shapeRendering: "crispEdges", children: [(0, jsx_runtime_1.jsx)("line", { x1: "18", y1: "6", x2: "6", y2: "18", strokeWidth: 2 }), (0, jsx_runtime_1.jsx)("line", { x1: "6", y1: "6", x2: "18", y2: "18", strokeWidth: 2 })] }) }));
};
exports.ModalCloseButton = ModalCloseButton;
exports.default = exports.ModalCloseButton;
