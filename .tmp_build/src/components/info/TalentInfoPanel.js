"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TalentInfoPanel = TalentInfoPanel;
const jsx_runtime_1 = require("react/jsx-runtime");
const gameData_1 = require("../../../gameData");
const TierBadge_1 = __importDefault(require("@/components/ui/TierBadge"));
function TalentInfoPanel({ talentId }) {
    // Normalize common legacy aliases (e.g., 'average' -> 'mortal') before lookup
    const aliasMap = {
        average: 'mortal',
        common: 'mortal'
    };
    const lookupId = (talentId && String(talentId)) ? (aliasMap[String(talentId)] || String(talentId)) : String(talentId);
    // Use centralized lookup helper when available
    const talent = typeof gameData_1.getTalentById === 'function' ? (0, gameData_1.getTalentById)(lookupId) : gameData_1.TALENT_DATA.find((t) => t.id === lookupId);
    if (!talent) {
        // Avoid spamming console during hot renders: warn once per missing id in dev
        if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
            const warned = globalThis.__WARNED_MISSING_TALENTS__ = globalThis.__WARNED_MISSING_TALENTS__ || new Set();
            if (!warned.has(lookupId)) {
                // eslint-disable-next-line no-console
                console.warn('TalentInfoPanel: missing talent data for id', lookupId);
                warned.add(lookupId);
            }
        }
        return ((0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '0.9rem', color: 'var(--muted)' }, children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("strong", { children: "Unknown Talent" }) }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '0.85rem', marginTop: 6 }, children: ["ID: ", (0, jsx_runtime_1.jsx)("code", { style: { color: 'var(--text)' }, children: String(lookupId) })] }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.8rem', color: 'var(--muted)', marginTop: 6 }, children: "Talent data not found \u2014 check your game data or save migration." })] }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '0.9rem' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '10px' }, children: [(0, jsx_runtime_1.jsx)("strong", { style: { color: 'var(--primary)' }, children: talent.name }), (0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)', fontSize: '0.85rem' }, children: talent.description })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '10px' }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Effects:" }), (0, jsx_runtime_1.jsxs)("ul", { style: { margin: '5px 0', paddingLeft: '15px' }, children: [(0, jsx_runtime_1.jsxs)("li", { style: { fontSize: '0.85rem' }, children: ["Cultivation Speed: ", talent.cultivationMultiplier, "x"] }), (0, jsx_runtime_1.jsxs)("li", { style: { fontSize: '0.85rem' }, children: ["Breakthrough Bonus: +", talent.breakthroughBonus * 100, "%"] })] })] }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '0.8rem', color: 'var(--accent)' }, children: ["Rarity: ", (0, jsx_runtime_1.jsx)("span", { style: { verticalAlign: 'middle' }, children: (0, jsx_runtime_1.jsx)(TierBadge_1.default, { tier: talent.rarity, small: true }) })] })] }));
}
