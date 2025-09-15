"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BloodlineInfoPanel = BloodlineInfoPanel;
const jsx_runtime_1 = require("react/jsx-runtime");
function BloodlineInfoPanel({ bloodline }) {
    return ((0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '0.9rem' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '10px' }, children: [(0, jsx_runtime_1.jsx)("strong", { style: { color: 'var(--primary)' }, children: bloodline.name }), (0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)', fontSize: '0.85rem' }, children: bloodline.description })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '10px' }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Effects:" }), (0, jsx_runtime_1.jsx)("ul", { style: { margin: '5px 0', paddingLeft: '15px' }, children: bloodline.effects.special?.map((effect, index) => ((0, jsx_runtime_1.jsx)("li", { style: { fontSize: '0.85rem' }, children: effect }, index))) })] })] }));
}
