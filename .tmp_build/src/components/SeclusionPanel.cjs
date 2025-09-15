"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeclusionPanel = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const useGameStore_1 = require("../store/useGameStore");
const SeclusionPanel = () => {
    const seclusionState = (0, useGameStore_1.useGameStore)(state => state.seclusionPath?.getState ? state.seclusionPath.getState() : null);
    const player = (0, useGameStore_1.useGameStore)(state => state.player);
    const enterSeclusion = (0, useGameStore_1.useGameStore)(state => state.enterSeclusion);
    const exitSeclusion = (0, useGameStore_1.useGameStore)(state => state.exitSeclusion);
    const performSeclusionStudy = (0, useGameStore_1.useGameStore)(state => state.performSeclusionStudy);
    // Unlock rules
    const canStudy = (player.manuals && player.manuals.length > 0) || (player.skills?.meditation?.level || 0) > 0;
    const isSecluded = seclusionState?.mode === 'secluded';
    return ((0, jsx_runtime_1.jsxs)("div", { className: "seclusion-panel", style: { padding: 8, border: '1px solid #666', borderRadius: 6, background: '#fafafa' }, children: [(0, jsx_runtime_1.jsx)("h3", { children: "Seclusion" }), (0, jsx_runtime_1.jsxs)("div", { children: ["Mode: ", seclusionState?.mode ?? 'idle'] }), (0, jsx_runtime_1.jsxs)("div", { children: ["Ticks in seclusion: ", seclusionState?.ticksSinceSeclusionStart ?? 0] }), (0, jsx_runtime_1.jsxs)("div", { children: ["Accumulated comprehension: ", seclusionState?.accumulatedComprehension ?? 0] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 8 }, children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => enterSeclusion(1, false), disabled: isSecluded, children: "Enter Seclusion (1yr)" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => exitSeclusion(), disabled: !isSecluded, style: { marginLeft: 8 }, children: "Exit Seclusion" })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 8 }, children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => performSeclusionStudy(1), disabled: !isSecluded || !canStudy, children: "Study (Intensity 1)" }), !canStudy && (0, jsx_runtime_1.jsx)("div", { style: { color: '#777', marginTop: 6 }, children: "Study unlock: acquire a manual or meditation level \u2265 1." })] })] }));
};
exports.SeclusionPanel = SeclusionPanel;
exports.default = exports.SeclusionPanel;
