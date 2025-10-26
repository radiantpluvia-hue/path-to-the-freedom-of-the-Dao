"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InterpersonalPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const InterpersonalTab_1 = require("@/components/InterpersonalTab");
const useGameStore_1 = require("@/store/useGameStore");
const react_1 = require("react");
const relationships_1 = require("@/store/relationships");
function InterpersonalPage() {
    const { setUIProperty } = (0, useGameStore_1.useGameStore)();
    // Optional rival syncing on entry, guarded by includeRival toggle
    (0, react_1.useEffect)(() => {
        try {
            const relStore = relationships_1.useRelationshipsStore.getState();
            if (!relStore.includeRival)
                return;
            const rivals = useGameStore_1.useGameStore.getState().rivalSystem.getAllRivals();
            relStore.syncRivals(rivals);
        }
        catch {
            // no-op if rival system not initialized or in non-browser env
        }
    }, []);
    return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: 20 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { marginBottom: 12 }, children: (0, jsx_runtime_1.jsx)("button", { style: { padding: '8px 12px' }, onClick: () => setUIProperty('currentScreen', 'social'), children: "\u2190 Back to Social" }) }), (0, jsx_runtime_1.jsx)("h1", { style: { color: 'var(--primary)', marginBottom: 12 }, children: "Interpersonal Relationships" }), (0, jsx_runtime_1.jsx)("p", { style: { color: 'var(--muted)', marginBottom: 16 }, children: "Add, edit, and organize your connections. Rival entries can be included automatically when enabled." }), (0, jsx_runtime_1.jsx)(InterpersonalTab_1.InterpersonalTab, {})] }));
}
