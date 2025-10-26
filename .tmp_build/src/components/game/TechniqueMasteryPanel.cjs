"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TechniqueMasteryPanel;
const jsx_runtime_1 = require("react/jsx-runtime");
const Card_1 = require("../core/Card");
const Button_1 = require("../core/Button");
const useGameStore_1 = require("../../store/useGameStore");
function TechniqueMasteryPanel({ open, onClose }) {
    const store = (0, useGameStore_1.useGameStore)();
    if (!open)
        return null;
    const list = store.getTechniqueMasteryProgress();
    const playerQi = store.player.currentQi || 0;
    const playerFatigue = store.player.fatigue || 0;
    const inlineMessage = store.ui.lastPracticeMessage;
    return ((0, jsx_runtime_1.jsx)("div", { style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2100 }, children: (0, jsx_runtime_1.jsx)(Card_1.Card, { title: "Technique Mastery", children: (0, jsx_runtime_1.jsxs)("div", { style: { minWidth: 420, maxHeight: '70vh', overflow: 'auto' }, children: [inlineMessage ? (0, jsx_runtime_1.jsx)("div", { style: { marginBottom: 8, color: inlineMessage.startsWith('+') ? 'var(--accent)' : 'var(--danger)' }, children: inlineMessage }) : null, list.length === 0 ? (0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)' }, children: "You have no techniques yet." }) : ((0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: 8 }, children: list.map((t) => ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 600 }, children: t.name }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '0.85rem', color: 'var(--muted)' }, children: ["Rank: ", t.masteryRank ?? 0, " \u2022 XP: ", t.masteryXp ?? 0] })] }), (0, jsx_runtime_1.jsxs)("div", { style: { width: 160 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { background: 'rgba(0,0,0,0.06)', height: 10, borderRadius: 6, overflow: 'hidden' }, children: (0, jsx_runtime_1.jsx)("div", { style: { width: `${Math.min(100, ((t.masteryXp || 0) / 5) * 100)}%`, height: '100%', background: 'var(--accent)' } }) }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '0.8rem', color: 'var(--muted)', alignSelf: 'center' }, children: ["Qi: ", playerQi, " \u2022 Fatigue: ", playerFatigue] }), (0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "primary", onClick: () => store.practiceTechnique(t.id), children: "Practice" })] })] })] }, t.id))) })), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', justifyContent: 'flex-end', marginTop: 12 }, children: (0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "secondary", onClick: onClose, children: "Close" }) })] }) }) }));
}
