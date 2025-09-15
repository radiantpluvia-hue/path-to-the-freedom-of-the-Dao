"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RivalsPanel = RivalsPanel;
const jsx_runtime_1 = require("react/jsx-runtime");
const useGameStore_1 = require("@/store/useGameStore");
const Button_1 = require("@/components/core/Button");
function RivalsPanel() {
    const { startRivalEncounter, getRivalRelationship, setUIProperty } = (0, useGameStore_1.useGameStore)();
    const rivals = (0, useGameStore_1.useGameStore)(state => state.getRivals().slice(0, 5));
    const openRivalModal = (rivalId) => {
        setUIProperty('selectedRival', rivalId);
    };
    return ((0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: '10px' }, children: rivals.map((r) => ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '8px' }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { style: { fontWeight: 600, color: 'var(--primary)' }, children: [r.name, " ", (0, jsx_runtime_1.jsxs)("span", { style: { color: 'var(--muted)', fontWeight: 400 }, children: ["\u2022 ", r.title] })] }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '0.85rem', color: 'var(--muted)' }, children: ["Lvl ", r.level, " \u2022 ", r.realm.replace(/_/g, ' ')] })] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: '8px' }, children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => openRivalModal(r.id), size: "small", variant: "secondary", children: "View" }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => startRivalEncounter(r.id), size: "small", children: "Encounter" }), (0, jsx_runtime_1.jsxs)("span", { style: { alignSelf: 'center', fontSize: '0.85rem', color: 'var(--accent)' }, children: ["Rel: ", getRivalRelationship(r.id)] })] })] }, r.id))) }));
}
exports.default = RivalsPanel;
