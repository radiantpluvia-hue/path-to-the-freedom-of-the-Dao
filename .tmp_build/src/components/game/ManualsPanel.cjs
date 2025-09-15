"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManualsPanel = ManualsPanel;
const jsx_runtime_1 = require("react/jsx-runtime");
const useGameStore_1 = require("../../store/useGameStore");
const Card_1 = require("../core/Card");
const Button_1 = require("../core/Button");
function ManualsPanel() {
    const { player, canEvolveManual, evolveManual } = (0, useGameStore_1.useGameStore)();
    if (!player.manuals || player.manuals.length === 0) {
        return ((0, jsx_runtime_1.jsx)(Card_1.Card, { title: "\uD83D\uDCDA Manuals", children: (0, jsx_runtime_1.jsx)("p", { style: { color: 'var(--muted)', textAlign: 'center', padding: '20px' }, children: "You have not learned any cultivation manuals yet." }) }));
    }
    return ((0, jsx_runtime_1.jsx)(Card_1.Card, { title: "\uD83D\uDCDA Manuals", children: (0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: '10px' }, children: player.manuals.map((m, idx) => {
                const status = canEvolveManual ? canEvolveManual(m.id) : { can: false, unmet: [] };
                return ((0, jsx_runtime_1.jsxs)("div", { style: { borderBottom: '1px solid rgba(212, 175, 55, 0.15)', paddingBottom: '8px' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { style: { color: 'var(--primary)' }, children: m.name }), (0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)', fontSize: '0.85rem' }, children: m.rank })] }), m.evolutionTargetId && ((0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => evolveManual && evolveManual(m.id), disabled: !status.can, size: "small", children: status.can ? 'Evolve' : 'Cannot Evolve' }))] }), !status.can && status.unmet?.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { style: { color: 'var(--muted)', fontSize: '0.8rem', marginTop: '4px' }, children: ["Unmet: ", status.unmet.join(', ')] }))] }, m.id || idx));
            }) }) }));
}
