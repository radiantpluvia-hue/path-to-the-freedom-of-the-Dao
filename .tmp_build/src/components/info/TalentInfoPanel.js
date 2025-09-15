"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TalentInfoPanel = TalentInfoPanel;
const jsx_runtime_1 = require("react/jsx-runtime");
const gameData_1 = require("../../../gameData");
function TalentInfoPanel({ talentId }) {
    // Find the talent by ID
    const talent = gameData_1.TALENT_DATA.find((t) => t.id === talentId);
    if (!talent) {
        return ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.9rem', color: 'var(--muted)' }, children: "Unknown Talent" }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '0.9rem' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '10px' }, children: [(0, jsx_runtime_1.jsx)("strong", { style: { color: 'var(--primary)' }, children: talent.name }), (0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)', fontSize: '0.85rem' }, children: talent.description })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '10px' }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Effects:" }), (0, jsx_runtime_1.jsxs)("ul", { style: { margin: '5px 0', paddingLeft: '15px' }, children: [(0, jsx_runtime_1.jsxs)("li", { style: { fontSize: '0.85rem' }, children: ["Cultivation Speed: ", talent.cultivationMultiplier, "x"] }), (0, jsx_runtime_1.jsxs)("li", { style: { fontSize: '0.85rem' }, children: ["Breakthrough Bonus: +", talent.breakthroughBonus * 100, "%"] })] })] }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '0.8rem', color: 'var(--accent)' }, children: ["Rarity: ", talent.rarity] })] }));
}
