"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FactionWarSummary;
const jsx_runtime_1 = require("react/jsx-runtime");
function FactionWarSummary({ result }) {
    if (!result)
        return null;
    return ((0, jsx_runtime_1.jsxs)("div", { style: { border: '1px solid rgba(255,255,255,0.06)', padding: 12, borderRadius: 6, background: 'var(--dark)' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 700 }, children: "Faction War Result" }), (0, jsx_runtime_1.jsxs)("div", { children: ["Victor: ", String(result.victor)] }), (0, jsx_runtime_1.jsxs)("div", { children: ["Attacker casualties: ", result.attackerCasualties] }), (0, jsx_runtime_1.jsxs)("div", { children: ["Defender casualties: ", result.defenderCasualties] }), (0, jsx_runtime_1.jsxs)("div", { children: ["Turns: ", result.turns] })] }));
}
