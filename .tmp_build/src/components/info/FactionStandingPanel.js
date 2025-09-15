"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FactionStandingPanel = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const useGameStore_1 = require("@/store/useGameStore");
const SectSystem_1 = require("@/systems/SectSystem");
const SectSystem_2 = require("@/systems/SectSystem");
const FactionStandingPanel = () => {
    const { player } = (0, useGameStore_1.useGameStore)();
    const sectName = player.sect ? (SectSystem_1.MAJOR_SECTS.find(s => s.id === player.sect)?.name || player.sect) : 'None';
    const sectRep = player.sect ? (player.sectReputations[player.sect] || 0) : 0;
    return ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gap: 12 }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [(0, jsx_runtime_1.jsx)("span", { style: { color: 'var(--accent)' }, children: "Sect" }), (0, jsx_runtime_1.jsx)("span", { style: { color: 'var(--primary)', fontWeight: 600 }, children: sectName })] }), player.sect && ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 4 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { height: 8, background: 'rgba(34,197,94,0.15)', borderRadius: 6, overflow: 'hidden' }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                                        height: '100%',
                                        width: `${(((sectRep) + 100) / 2)}%`,
                                        background: '#22c55e'
                                    } }) }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 4, fontSize: 12, color: 'var(--muted)' }, children: ["Reputation: ", sectRep > 0 ? '+' : '', sectRep] })] }))] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--accent)', marginBottom: 4 }, children: "Factions" }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: 6 }, children: SectSystem_2.MAJOR_FACTIONS.map(f => {
                            const v = player.factionStandings?.[f.id] || 0;
                            const bar = Math.max(0, Math.min(100, (v + 100) / 2));
                            const color = v >= 50 ? '#16a34a' : v >= 0 ? '#ca8a04' : v >= -50 ? '#ea580c' : '#dc2626';
                            return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', fontSize: 12 }, children: [(0, jsx_runtime_1.jsx)("span", { style: { color: 'var(--muted)' }, children: f.name }), (0, jsx_runtime_1.jsxs)("span", { style: { color }, children: [v > 0 ? '+' : '', v] })] }), (0, jsx_runtime_1.jsx)("div", { style: { height: 6, background: 'rgba(59,130,246,0.15)', borderRadius: 6, overflow: 'hidden' }, children: (0, jsx_runtime_1.jsx)("div", { style: { height: '100%', width: `${bar}%`, background: '#3b82f6' } }) })] }, f.id));
                        }) })] })] }));
};
exports.FactionStandingPanel = FactionStandingPanel;
exports.default = exports.FactionStandingPanel;
