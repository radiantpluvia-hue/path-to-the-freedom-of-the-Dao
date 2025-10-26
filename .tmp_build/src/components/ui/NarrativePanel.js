"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NarrativePanel;
const jsx_runtime_1 = require("react/jsx-runtime");
const useGameStore_1 = require("@/store/useGameStore");
const DestinyAffinityBadge_1 = __importDefault(require("./DestinyAffinityBadge"));
function NarrativePanel() {
    const narrativeEngine = (0, useGameStore_1.useGameStore)(state => state.narrativeEngine);
    const player = (0, useGameStore_1.useGameStore)(state => state.player);
    const destinyThreads = (narrativeEngine && Array.isArray(narrativeEngine.destinyThreads)) ? narrativeEngine.destinyThreads : [];
    const karmaHistory = (narrativeEngine && Array.isArray(narrativeEngine.karmaHistory)) ? narrativeEngine.karmaHistory : [];
    const karmicSeeds = Array.isArray(player.karmicSeeds) ? player.karmicSeeds : [];
    const destinyAffinity = (player && typeof player.destinyAffinity === 'number') ? player.destinyAffinity : 0;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "narrative-panel", style: { padding: 12, border: '1px solid #444', borderRadius: 6, background: '#111', color: '#ddd' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { marginTop: 0 }, children: "Destiny Threads" }), (0, jsx_runtime_1.jsx)(DestinyAffinityBadge_1.default, { value: destinyAffinity }), destinyThreads.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { style: { fontStyle: 'italic', opacity: 0.8 }, children: "No destiny threads detected." })) : ((0, jsx_runtime_1.jsx)("ul", { children: destinyThreads.map((t) => ((0, jsx_runtime_1.jsxs)("li", { style: { marginBottom: 6 }, children: [(0, jsx_runtime_1.jsx)("strong", { children: t.name || t.id }), " \u2014 Strength: ", t.strength ?? t.weight ?? 0, Array.isArray(t.connections) && t.connections.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 12, opacity: 0.9 }, children: ["Connections: ", t.connections.map((c) => c.target).join(', ')] }))] }, t.id))) })), (0, jsx_runtime_1.jsx)("h3", { children: "Karmic Seeds" }), karmicSeeds.length === 0 && karmaHistory.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { style: { fontStyle: 'italic', opacity: 0.8 }, children: "No karmic seeds or history." })) : ((0, jsx_runtime_1.jsxs)("div", { children: [karmicSeeds.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Active Seeds" }), (0, jsx_runtime_1.jsx)("ul", { children: karmicSeeds.map((s, idx) => ((0, jsx_runtime_1.jsxs)("li", { children: [s.name || s.id, " \u2014 ", s.description || ''] }, `seed_${idx}`))) })] })), karmaHistory.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Recent Karma Events" }), (0, jsx_runtime_1.jsx)("ul", { children: karmaHistory.slice(0, 10).map((k, i) => ((0, jsx_runtime_1.jsxs)("li", { children: [k.reason || k.type || 'karma', ": ", k.value ?? k.delta ?? 0] }, `k_${i}`))) })] }))] }))] }));
}
