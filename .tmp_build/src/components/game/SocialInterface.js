"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialInterface = SocialInterface;
const jsx_runtime_1 = require("react/jsx-runtime");
const useGameStore_1 = require("../../store/useGameStore");
const Card_1 = require("../core/Card");
const Progress_1 = require("../core/Progress");
const ChoiceModal_1 = require("../../../ChoiceModal");
const Codex_1 = require("../Codex");
const RivalInfoPanel_1 = require("@/components/info/RivalInfoPanel");
const FactionStandingPanel_1 = require("@/components/info/FactionStandingPanel");
const FactionPanel_1 = require("../../../FactionPanel");
const RivalsPanel_1 = require("../../../RivalsPanel");
const ManualsPanel_1 = require("./ManualsPanel");
function SocialInterface() {
    // Button import removed (unused)
    const { ui, setUIProperty, player } = (0, useGameStore_1.useGameStore)();
    return ((0, jsx_runtime_1.jsxs)("div", { style: { minHeight: '100vh' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                    display: 'flex',
                    gap: 8,
                    padding: '10px 20px',
                    position: 'sticky',
                    top: 0,
                    background: 'linear-gradient(135deg, var(--dark), var(--darker))',
                    zIndex: 5,
                    borderBottom: '1px solid rgba(212, 175, 55, 0.2)'
                }, children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setUIProperty('currentScreen', 'game'), style: {
                            padding: '8px 12px',
                            borderRadius: 6,
                            border: '1px solid rgba(212,175,55,0.25)',
                            background: ui.currentScreen === 'game' ? 'rgba(212,175,55,0.15)' : 'transparent',
                            color: 'var(--primary)',
                            cursor: 'pointer'
                        }, children: "Core" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setUIProperty('currentScreen', 'social'), style: {
                            padding: '8px 12px',
                            borderRadius: 6,
                            border: '1px solid rgba(212,175,55,0.25)',
                            background: ui.currentScreen === 'social' ? 'rgba(212,175,55,0.15)' : 'transparent',
                            color: 'var(--primary)',
                            cursor: 'pointer'
                        }, children: "Social" })] }), (0, jsx_runtime_1.jsxs)("div", { style: { padding: 20 }, children: [ui.selectedRival && ((0, jsx_runtime_1.jsx)("div", { style: {
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1500
                        }, children: (0, jsx_runtime_1.jsx)("div", { style: { backgroundColor: 'var(--dark)', padding: 20, borderRadius: 8, maxWidth: 800, width: '90%', maxHeight: '80vh', overflow: 'auto' }, children: (0, jsx_runtime_1.jsx)(RivalInfoPanel_1.RivalInfoPanel, { rivalId: ui.selectedRival, onClose: () => setUIProperty('selectedRival', null), onChallenge: (rid) => {
                                    useGameStore_1.useGameStore.getState().startRivalEncounter(rid);
                                    setUIProperty('selectedRival', null);
                                } }) }) })), (0, jsx_runtime_1.jsx)(ChoiceModal_1.ChoiceModal, {}), (0, jsx_runtime_1.jsx)(Codex_1.CodexModal, { open: ui.showCodex, onClose: () => setUIProperty('showCodex', false) }), (0, jsx_runtime_1.jsxs)("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 20,
                            alignItems: 'start'
                        }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gap: 20 }, children: [(0, jsx_runtime_1.jsx)(Card_1.Card, { title: "\uD83C\uDFDB\uFE0F Relations", children: (0, jsx_runtime_1.jsx)(FactionStandingPanel_1.FactionStandingPanel, {}) }), (0, jsx_runtime_1.jsx)(FactionPanel_1.FactionPanel, {})] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gap: 20 }, children: [(0, jsx_runtime_1.jsx)(Card_1.Card, { title: "\u2694\uFE0F Rivals", children: (0, jsx_runtime_1.jsx)(RivalsPanel_1.RivalsPanel, {}) }), (0, jsx_runtime_1.jsx)(Card_1.Card, { title: "\uD83D\uDCCA Skills", children: (0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: '10px' }, children: Object.entries(player.skills).map(([skillId, skill]) => ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }, children: [(0, jsx_runtime_1.jsx)("span", { style: { textTransform: 'capitalize' }, children: skillId.replace(/([A-Z])/g, ' $1') }), (0, jsx_runtime_1.jsxs)("span", { style: { color: 'var(--primary)' }, children: ["Level ", skill.level] })] }), (0, jsx_runtime_1.jsx)(Progress_1.Progress, { value: skill.exp, max: skill.expToNext })] }, skillId))) }) }), (0, jsx_runtime_1.jsx)(Card_1.Card, { title: "Inventory", children: (0, jsx_runtime_1.jsx)("div", { style: { maxHeight: '260px', overflowY: 'auto' }, children: player.inventory.length === 0 ? ((0, jsx_runtime_1.jsx)("p", { style: { color: 'var(--muted)', textAlign: 'center', padding: '20px' }, children: "Empty" })) : (player.inventory.map((item, index) => ((0, jsx_runtime_1.jsxs)("div", { style: { padding: '8px', borderBottom: '1px solid rgba(212, 175, 55, 0.2)' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [(0, jsx_runtime_1.jsx)("strong", { style: { color: 'var(--primary)' }, children: item.name }), item.quantity && item.quantity > 1 && (0, jsx_runtime_1.jsxs)("span", { style: { color: 'var(--accent)' }, children: ["x", item.quantity] })] }), (0, jsx_runtime_1.jsx)("p", { style: { color: 'var(--muted)', fontSize: '0.8rem', margin: '4px 0 0' }, children: item.description })] }, index)))) }) }), (0, jsx_runtime_1.jsx)(ManualsPanel_1.ManualsPanel, {})] })] })] })] }));
}
