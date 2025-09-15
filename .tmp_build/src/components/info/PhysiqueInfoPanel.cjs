"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhysiqueInfoPanel = PhysiqueInfoPanel;
const jsx_runtime_1 = require("react/jsx-runtime");
function PhysiqueInfoPanel({ physique }) {
    return ((0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '0.9rem' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '10px' }, children: [(0, jsx_runtime_1.jsx)("strong", { style: { color: 'var(--primary)' }, children: physique.name }), (0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)', fontSize: '0.85rem' }, children: physique.description })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '10px' }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Effects:" }), (0, jsx_runtime_1.jsx)("ul", { style: { margin: '5px 0', paddingLeft: '15px' }, children: physique.effects.special?.map((effect, index) => ((0, jsx_runtime_1.jsx)("li", { style: { fontSize: '0.85rem' }, children: effect }, index))) })] }), physique.evolutionTargetId && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Potential Evolutions:" }), (0, jsx_runtime_1.jsx)("ul", { style: { margin: '5px 0', paddingLeft: '15px' }, children: physique.evolutionRequirements && ((0, jsx_runtime_1.jsx)("li", { style: { fontSize: '0.85rem' }, children: physique.evolutionTargetId })) })] }))] }));
}
