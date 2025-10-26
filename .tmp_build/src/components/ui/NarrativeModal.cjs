"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NarrativeModal;
const jsx_runtime_1 = require("react/jsx-runtime");
const useGameStore_1 = require("@/store/useGameStore");
const ModalCloseButton_1 = __importDefault(require("@/components/ui/ModalCloseButton"));
function NarrativeModal() {
    const { ui, setUIProperty } = (0, useGameStore_1.useGameStore)();
    const narrativeEngine = (0, useGameStore_1.useGameStore)(state => state.narrativeEngine);
    const player = (0, useGameStore_1.useGameStore)(state => state.player);
    if (!ui.showNarrative)
        return null;
    const threads = (narrativeEngine && narrativeEngine.destinyThreads) ? narrativeEngine.destinyThreads : [];
    return ((0, jsx_runtime_1.jsx)("div", { role: "dialog", "aria-modal": "true", style: { position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }, children: (0, jsx_runtime_1.jsxs)("div", { style: { background: 'var(--dark)', padding: 20, borderRadius: 8, width: 640, maxHeight: '80vh', overflow: 'auto', color: '#ddd' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { margin: 0 }, children: "Narrative Threads" }), (0, jsx_runtime_1.jsx)(ModalCloseButton_1.default, { onClick: () => setUIProperty('showNarrative', false), ariaLabel: "Close", title: "Close" })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: 12 }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Player Affinity:" }), " ", player.destinyAffinity ?? 0] }), (0, jsx_runtime_1.jsx)("div", { children: threads.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)' }, children: "No threads detected." })) : ((0, jsx_runtime_1.jsx)("ul", { children: threads.map((t) => ((0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("strong", { children: t.name || t.id }), " \u2014 Strength: ", t.strength ?? 0] }, t.id))) })) })] }) }));
}
