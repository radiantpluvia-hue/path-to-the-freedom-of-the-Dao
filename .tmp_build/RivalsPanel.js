"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RivalsPanel = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const useGameStore_1 = require("@/store/useGameStore");
const Button_1 = require("@/components/core/Button");
function RivalsPanelImpl() {
    const startRivalEncounter = (0, useGameStore_1.useGameStore)(s => s.startRivalEncounter);
    const getRivalRelationship = (0, useGameStore_1.useGameStore)(s => s.getRivalRelationship);
    const setUIProperty = (0, useGameStore_1.useGameStore)(s => s.setUIProperty);
    const [rivals, setRivals] = (0, react_1.useState)(() => {
        try {
            return (useGameStore_1.useGameStore.getState().getRivals?.() || []).slice(0, 5);
        }
        catch {
            return [];
        }
    });
    // Snapshot rivals on mount and when rival system signals updates via a cheap tick (day change)
    const day = (0, useGameStore_1.useGameStore)(s => s.world.day);
    (0, react_1.useEffect)(() => {
        try {
            const list = (useGameStore_1.useGameStore.getState().getRivals?.() || []).slice(0, 5);
            setRivals(list);
        }
        catch { /* ignore */ }
    }, [day]);
    const openRivalModal = (rivalId) => {
        setUIProperty('selectedRival', rivalId);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gap: '10px' }, children: [rivals.map((r) => ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '8px' }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { style: { fontWeight: 600, color: 'var(--primary)' }, children: [r.name, " ", (0, jsx_runtime_1.jsxs)("span", { style: { color: 'var(--muted)', fontWeight: 400 }, children: ["\u2022 ", r.title] })] }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '0.85rem', color: 'var(--muted)' }, children: ["Lvl ", r.level, " \u2022 ", r.realm.replace(/_/g, ' ')] })] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: '8px' }, children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => openRivalModal(r.id), size: "small", variant: "secondary", children: "View" }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => startRivalEncounter(r.id), size: "small", children: "Encounter" }), (0, jsx_runtime_1.jsxs)("span", { style: { alignSelf: 'center', fontSize: '0.85rem', color: 'var(--accent)' }, children: ["Rel: ", getRivalRelationship(r.id)] })] })] }, r.id))), rivals.length === 0 && ((0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)', fontSize: '0.9rem' }, children: "No rivals available yet." })), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', justifyContent: 'flex-end' }, children: (0, jsx_runtime_1.jsx)(Button_1.Button, { size: "small", variant: "secondary", onClick: () => {
                        try {
                            setRivals((useGameStore_1.useGameStore.getState().getRivals?.() || []).slice(0, 5));
                        }
                        catch { /* ignore */ }
                    }, children: "Refresh" }) })] }));
}
exports.RivalsPanel = (0, react_1.memo)(RivalsPanelImpl);
exports.default = exports.RivalsPanel;
