"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArcsList = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const useGameStore_1 = require("@/store/useGameStore");
const SmallChip_1 = __importDefault(require("./ui/SmallChip"));
const ArcsList = () => {
    const { storySystem } = (0, useGameStore_1.useGameStore)();
    const arcs = (0, react_1.useMemo)(() => {
        if (!storySystem || typeof storySystem.getActsForUI !== 'function')
            return [];
        try {
            const s = useGameStore_1.useGameStore.getState();
            const result = storySystem.getActsForUI?.({
                player: s.player,
                world: s.world,
                story: s.story,
                ui: s.ui,
                systems: s.systems
            });
            if (!Array.isArray(result))
                return [];
            return result.map((r) => ({ id: String(r.id), title: String(r.title || ''), description: String(r.description || ''), disabled: !!r.disabled }));
        }
        catch (e) {
            return [];
        }
    }, [storySystem]);
    const [expanded, setExpanded] = (0, react_1.useState)({});
    const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    const isCurrent = (id) => useGameStore_1.useGameStore.getState().story.currentAct === id;
    const renderDescription = (id, text) => {
        const long = text.length > 140;
        const open = expanded[id];
        if (!long)
            return (0, jsx_runtime_1.jsx)("span", { children: text });
        return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("span", { children: open ? text : `${text.slice(0, 140)}…` }), (0, jsx_runtime_1.jsx)("button", { onClick: () => toggle(id), style: { marginLeft: 8, fontSize: 12, border: 'none', background: 'transparent', cursor: 'pointer' }, children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { style: { marginLeft: 0, fontSize: 12, borderRadius: 4 }, children: open ? 'Less' : 'More' }) })] }));
    };
    if (!arcs.length) {
        return ((0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)', fontSize: 13 }, children: "No arcs available." }));
    }
    return ((0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: 10 }, children: arcs.map(arc => ((0, jsx_runtime_1.jsxs)("div", { style: {
                padding: 10,
                border: '1px solid var(--border)',
                borderRadius: 6,
                background: arc.disabled ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
                opacity: arc.disabled ? 0.6 : 1
            }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }, children: [(0, jsx_runtime_1.jsx)("strong", { style: { color: 'var(--primary)' }, children: arc.title }), isCurrent(arc.id) && ((0, jsx_runtime_1.jsx)(SmallChip_1.default, { style: { fontSize: 12, marginLeft: 6 }, variant: "accent", children: "(Current)" })), arc.disabled && ((0, jsx_runtime_1.jsx)(SmallChip_1.default, { style: { marginLeft: 'auto', fontSize: 12 }, variant: "neutral", children: "Coming soon" }))] }), (0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5 }, children: renderDescription(arc.id, arc.description) })] }, arc.id))) }));
};
exports.ArcsList = ArcsList;
exports.default = exports.ArcsList;
