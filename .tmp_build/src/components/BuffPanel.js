"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuffPanel = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const useGameStore_1 = require("@/store/useGameStore");
require("../styles/buffPanel.css");
const stat_svg_1 = __importDefault(require("@/assets/icons/stat.svg"));
const default_svg_1 = __importDefault(require("@/assets/icons/default.svg"));
const Icon = ({ type }) => {
    const src = type === 'stat' ? stat_svg_1.default : default_svg_1.default;
    return (0, jsx_runtime_1.jsx)("img", { src: src, alt: "", width: 28, height: 28, "aria-hidden": true });
};
const BuffPanel = () => {
    const player = (0, useGameStore_1.useGameStore)(state => state.player);
    const removeBuff = (0, useGameStore_1.useGameStore)(state => state.removeBuff);
    const [tick, setTick] = (0, react_1.useState)(() => useGameStore_1.useGameStore.getState().world.tick || 0);
    (0, react_1.useEffect)(() => {
        // subscribe to store changes and detect tick changes (typings vary by zustand version)
        const unsub = useGameStore_1.useGameStore.subscribe((newState, oldState) => {
            const newTick = newState?.world?.tick || 0;
            const oldTick = oldState?.world?.tick || 0;
            if (newTick !== oldTick)
                setTick(newTick);
        });
        return () => unsub();
    }, []);
    if (!player.activeBuffs || player.activeBuffs.length === 0) {
        return null;
    }
    const onKey = (e, id) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            removeBuff(id);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("aside", { className: "buff-panel", "aria-label": "Active buffs", children: [(0, jsx_runtime_1.jsxs)("div", { className: "buff-panel__header", children: [(0, jsx_runtime_1.jsx)("h4", { style: { margin: 0, fontSize: '1rem' }, children: "Active Buffs" }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.85rem', color: 'var(--muted)' }, children: player.activeBuffs.length })] }), player.activeBuffs.map((b) => {
                // Detect percent-based stat effects for chart
                const percentStatKey = b.effects?.stats && Object.entries(b.effects.stats).find(([, v]) => typeof v === 'object' && v.percent);
                const percentValue = percentStatKey ? percentStatKey[1].percent : 0;
                const initial = b.initialDuration || b.duration || 0;
                const remaining = Math.max(0, b.duration || 0);
                const progress = initial > 0 ? Math.max(0, Math.min(1, remaining / initial)) : 0;
                const dir = document.documentElement.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr';
                return ((0, jsx_runtime_1.jsxs)("div", { role: "button", tabIndex: 0, "aria-pressed": false, onKeyDown: (e) => onKey(e, b.id), onClick: () => removeBuff(b.id), title: `${b.name}: ${b.description}`, className: `buff-card ${b.expiring ? 'expiring' : ''}`, dir: dir, children: [(0, jsx_runtime_1.jsx)("div", { className: "buff-card__icon", children: (0, jsx_runtime_1.jsx)(Icon, { type: b.category || 'default' }) }), (0, jsx_runtime_1.jsxs)("div", { className: "buff-card__meta", children: [(0, jsx_runtime_1.jsxs)("div", { className: "buff-card__title-row", children: [(0, jsx_runtime_1.jsx)("div", { className: "buff-card__name", children: b.name }), (0, jsx_runtime_1.jsx)("div", { className: "buff-card__duration", children: b.durationType === 'ticks' ? `Time: ${b.duration}` : `Uses: ${b.duration}` })] }), (0, jsx_runtime_1.jsx)("div", { className: "buff-card__desc", children: b.description }), (0, jsx_runtime_1.jsxs)("div", { className: "buff-tooltip", role: "tooltip", "aria-hidden": true, children: [(0, jsx_runtime_1.jsx)("strong", { children: b.name }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 6 }, children: b.description }), percentValue > 0 && ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: 8 }, children: (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '0.8rem', color: 'var(--muted)' }, children: ["Percent effect: ", (percentValue * 100).toFixed(0), "%"] }) }))] }), percentValue > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "buff-chart", "aria-hidden": true, children: (0, jsx_runtime_1.jsx)("div", { className: `buff-chart__bar animated`, style: { width: `${Math.min(100, percentValue * 100)}%` } }) })), initial > 0 && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { className: "buff-chart", "aria-hidden": true, children: (0, jsx_runtime_1.jsx)("div", { className: `buff-chart__bar animated`, style: { width: `${progress * 100}%` } }) }), (0, jsx_runtime_1.jsx)("div", { className: "buff-card__countdown", children: b.durationType === 'ticks' ? `Ticks left: ${remaining}` : `Uses left: ${remaining}` })] }))] }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("button", { className: "buff-card__remove", "aria-label": `Remove buff ${b.name}`, onClick: (e) => { e.stopPropagation(); removeBuff(b.id); }, onKeyDown: (e) => e.stopPropagation(), children: "Remove" }) })] }, b.id));
            })] }));
};
exports.BuffPanel = BuffPanel;
exports.default = exports.BuffPanel;
