"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestPanels = QuestPanels;
const jsx_runtime_1 = require("react/jsx-runtime");
/* eslint @typescript-eslint/no-non-null-assertion: "off" */
const react_1 = require("react");
const useGameStore_1 = require("@/store/useGameStore");
const storyEvents_1 = require("@/events/storyEvents");
const Card_1 = require("./core/Card");
const Progress_1 = require("./core/Progress");
const SmallChip_1 = __importDefault(require("./ui/SmallChip"));
function QuestItem({ quest }) {
    const store = (0, useGameStore_1.useGameStore)();
    const [open, setOpen] = (0, react_1.useState)(false);
    const gameState = (0, react_1.useMemo)(() => ({
        player: store.player,
        world: store.world,
        story: store.story,
        ui: store.ui,
        systems: store.systems
    }), [store.player, store.world, store.story, store.ui, store.systems]);
    const objectives = Array.isArray(quest?.objectives) ? quest.objectives : [];
    const { allCompleted: _allCompleted, results } = (0, react_1.useMemo)(() => (0, storyEvents_1.evaluateObjectives)(gameState, objectives), [gameState, objectives]);
    void _allCompleted;
    const progress = (0, react_1.useMemo)(() => {
        if (!objectives.length)
            return quest?.status === 'completed' ? 100 : 0;
        const completedCount = objectives.filter(o => results[o.id]?.isCompleted).length;
        return Math.floor((completedCount / objectives.length) * 100);
    }, [objectives, results, quest?.status]);
    const shortDesc = String(quest?.description || '');
    return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: 10, border: '1px solid var(--border)', borderRadius: 6, background: 'rgba(255,255,255,0.04)' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 10, alignItems: 'center' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 8, alignItems: 'baseline' }, children: [(0, jsx_runtime_1.jsx)("strong", { style: { color: 'var(--primary)' }, children: quest?.title }), quest?.status && ((0, jsx_runtime_1.jsx)(SmallChip_1.default, { style: { fontSize: 12, color: 'var(--muted)' }, children: quest.status }))] }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 13, color: 'var(--text-secondary)' }, children: shortDesc.length > 120 ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [open ? shortDesc : `${shortDesc.slice(0, 120)}…`, (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setOpen(!open), style: { marginLeft: 8, fontSize: 12, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }, children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: open ? 'Less' : 'More' }) })] })) : shortDesc })] }), (0, jsx_runtime_1.jsxs)("div", { style: { width: 120 }, children: [(0, jsx_runtime_1.jsx)(Progress_1.Progress, { value: progress, max: 100 }), (0, jsx_runtime_1.jsxs)("div", { style: { textAlign: 'right', fontSize: 12, color: 'var(--muted)' }, children: [progress, "%"] })] })] }), objectives.length > 0 && ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: 8, display: 'grid', gap: 6 }, children: objectives.map((obj) => {
                    const r = results[obj.id] || { progress: 0, isCompleted: false };
                    return ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 8, alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { flex: 1 }, children: (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 13, color: 'var(--text-secondary)' }, children: obj.description || obj.type }) }), (0, jsx_runtime_1.jsx)("div", { style: { width: 100 }, children: (0, jsx_runtime_1.jsx)(Progress_1.Progress, { value: Math.floor((r.progress || 0) * 100), max: 100 }) }), (0, jsx_runtime_1.jsx)("div", { style: { width: 70, textAlign: 'right', fontSize: 12, color: r.isCompleted ? 'var(--success)' : 'var(--muted)' }, children: r.isCompleted ? 'Done' : `${Math.floor((r.progress || 0) * 100)}%` })] }, obj.id));
                }) }))] }));
}
function QuestPanels() {
    const store = (0, useGameStore_1.useGameStore)();
    const gameState = (0, react_1.useMemo)(() => ({
        player: store.player,
        world: store.world,
        story: store.story,
        ui: store.ui,
        systems: store.systems
    }), [store.player, store.world, store.story, store.ui, store.systems]);
    const currentAct = (0, react_1.useMemo)(() => {
        try {
            if (store.storySystem && typeof store.storySystem.getCurrentAct === 'function') {
                return store.storySystem.getCurrentAct(gameState);
            }
        }
        catch (e) {
            // non-fatal: fall through
        }
        return null;
    }, [store.storySystem, gameState]);
    const mainQuests = (0, react_1.useMemo)(() => Array.isArray(currentAct?.mainQuests) ? currentAct.mainQuests : [], [currentAct]);
    const sideQuests = (0, react_1.useMemo)(() => Array.isArray(currentAct?.sideQuests) ? currentAct.sideQuests : [], [currentAct]);
    return ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gap: 12 }, children: [(0, jsx_runtime_1.jsx)(Card_1.Card, { title: "Main Quests", children: mainQuests.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)', fontSize: 13 }, children: "No main quests." })) : ((0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: 8 }, children: mainQuests.map((q) => ((0, jsx_runtime_1.jsx)(QuestItem, { quest: q }, q?.id))) })) }), (0, jsx_runtime_1.jsx)(Card_1.Card, { title: "Side Quests", children: sideQuests.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)', fontSize: 13 }, children: "No side quests." })) : ((0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: 8 }, children: sideQuests.map((q) => ((0, jsx_runtime_1.jsx)(QuestItem, { quest: q }, q?.id))) })) })] }));
}
exports.default = QuestPanels;
