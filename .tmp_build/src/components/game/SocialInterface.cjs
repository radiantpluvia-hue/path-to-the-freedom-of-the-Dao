"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialInterface = SocialInterface;
const jsx_runtime_1 = require("react/jsx-runtime");
const useGameStore_1 = require("../../store/useGameStore");
const Card_1 = require("../core/Card");
const ChoiceModal_1 = require("../../../ChoiceModal");
const Codex_1 = require("../Codex");
const RivalInfoPanel_1 = require("@/components/info/RivalInfoPanel");
const FactionStandingPanel_1 = require("@/components/info/FactionStandingPanel");
const FactionPanel_1 = require("../../../FactionPanel");
const RivalsPanel_1 = require("../../../RivalsPanel");
const ManualsPanel_1 = require("./ManualsPanel");
const InventoryPanel_1 = __importDefault(require("./InventoryPanel"));
const react_1 = require("react");
function SocialInterface() {
    // Select only what we need to reduce render churn
    const ui = (0, useGameStore_1.useGameStore)(s => s.ui);
    const world = (0, useGameStore_1.useGameStore)(s => s.world);
    const setUIProperty = (0, useGameStore_1.useGameStore)(s => s.setUIProperty);
    const focusInventory = (0, useGameStore_1.useGameStore)(s => s.ui.focusInventory ?? false);
    const [announce, setAnnounce] = (0, react_1.useState)('');
    const inventoryRef = (0, react_1.useRef)(null);
    const [inventoryVisibleClass, setInventoryVisibleClass] = (0, react_1.useState)('');
    (0, react_1.useEffect)(() => {
        if (focusInventory) {
            setAnnounce('Inventory opened and focused');
            setInventoryVisibleClass('inventory-reveal');
            // remove class after animation ends to keep DOM clean
            const t = setTimeout(() => setInventoryVisibleClass(''), 700);
            return () => clearTimeout(t);
        }
    }, [focusInventory]);
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
                        }, children: "Social" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setUIProperty('currentScreen', 'relationships'), style: {
                            padding: '8px 12px',
                            borderRadius: 6,
                            border: '1px solid rgba(212,175,55,0.25)',
                            background: ui.currentScreen === 'relationships' ? 'rgba(212,175,55,0.15)' : 'transparent',
                            color: 'var(--primary)',
                            cursor: 'pointer'
                        }, children: "Relationships" })] }), (0, jsx_runtime_1.jsxs)("div", { style: { padding: 20 }, children: [ui.selectedRival && ((0, jsx_runtime_1.jsx)("div", { style: {
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
                        }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gap: 20 }, children: [(world.currentWorldType && world.currentWorldType !== 'mortal') && ((0, jsx_runtime_1.jsx)(Card_1.Card, { title: "\uD83C\uDFDB\uFE0F Relations", children: (0, jsx_runtime_1.jsx)(FactionStandingPanel_1.FactionStandingPanel, {}) })), (world.currentWorldType && world.currentWorldType !== 'mortal') && (0, jsx_runtime_1.jsx)(FactionPanel_1.FactionPanel, {})] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gap: 20 }, children: [(0, jsx_runtime_1.jsx)(Card_1.Card, { title: "\u2694\uFE0F Rivals", children: (0, jsx_runtime_1.jsx)(RivalsPanel_1.RivalsPanel, {}) }), (0, jsx_runtime_1.jsxs)(Card_1.Card, { title: "\uD83C\uDF92 Inventory", children: [(0, jsx_runtime_1.jsx)("div", { "aria-live": "polite", style: { position: 'absolute', left: -9999, top: 'auto', width: 1, height: 1, overflow: 'hidden' }, children: announce }), (0, jsx_runtime_1.jsx)("div", { ref: (el) => {
                                                    inventoryRef.current = el;
                                                    // If the store indicated focus, scroll this card into view once
                                                    if (el && focusInventory) {
                                                        try {
                                                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                            // Try to focus the search input inside InventoryPanel for keyboard users
                                                            try {
                                                                const input = el.querySelector('input');
                                                                if (input && input.focus) {
                                                                    // small timeout so that smooth scrolling won't clash with focusing in some browsers
                                                                    setTimeout(() => { try {
                                                                        input.focus();
                                                                    }
                                                                    catch (e) {
                                                                        void e;
                                                                    } }, 120);
                                                                }
                                                            }
                                                            catch (e) { /* ignore */ }
                                                        }
                                                        catch (e) {
                                                            void e;
                                                        }
                                                        // clear the flag so we don't re-scroll on every render
                                                        setUIProperty('focusInventory', false);
                                                    }
                                                }, className: inventoryVisibleClass, style: { transition: 'transform 0.45s cubic-bezier(.2,.9,.2,1), opacity 0.45s', transformOrigin: 'center top' }, children: (0, jsx_runtime_1.jsx)(InventoryPanel_1.default, {}) }), (0, jsx_runtime_1.jsx)("style", { children: `
                .inventory-reveal { transform: translateY(-6px) scale(1.02); opacity: 0.98; box-shadow: 0 8px 24px rgba(0,0,0,0.35); }
              ` })] }), (0, jsx_runtime_1.jsx)(ManualsPanel_1.ManualsPanel, {})] })] })] })] }));
}
