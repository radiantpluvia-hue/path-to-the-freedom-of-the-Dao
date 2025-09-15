"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FactionPanel = FactionPanel;
const jsx_runtime_1 = require("react/jsx-runtime");
const useGameStore_1 = require("@/store/useGameStore");
const SectSystem_1 = require("@/systems/SectSystem");
function FactionPanel() {
    const { player } = (0, useGameStore_1.useGameStore)();
    const factionStandings = player.factionStandings || {};
    return ((0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '0.9rem' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { color: 'var(--primary)', marginBottom: '10px' }, children: "\uD83C\uDFDB\uFE0F Faction Relations" }), SectSystem_1.MAJOR_FACTIONS.map(faction => {
                const standing = factionStandings[faction.id] || 0;
                const standingColor = standing >= 50 ? 'var(--success)' :
                    standing >= 0 ? 'var(--accent)' :
                        standing >= -50 ? 'var(--warning)' : 'var(--danger)';
                return ((0, jsx_runtime_1.jsxs)("div", { style: {
                        marginBottom: '8px',
                        padding: '8px',
                        border: '1px solid rgba(212, 175, 55, 0.2)',
                        borderRadius: '4px'
                    }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { style: { color: 'var(--primary)' }, children: faction.name }), (0, jsx_runtime_1.jsxs)("div", { style: { color: 'var(--muted)', fontSize: '0.85rem' }, children: [faction.type, " \u2022 ", faction.description] })] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                                        color: standingColor,
                                        fontWeight: 'bold',
                                        fontSize: '0.9rem'
                                    }, children: [standing > 0 ? '+' : '', standing] })] }), faction.conflicts.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: '5px', fontSize: '0.8rem', color: 'var(--muted)' }, children: ["Conflicts: ", faction.conflicts.join(', ')] }))] }, faction.id));
            }), Object.keys(factionStandings).length === 0 && ((0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)', textAlign: 'center', padding: '20px' }, children: "No faction relationships yet. Explore the world to encounter factions!" }))] }));
}
