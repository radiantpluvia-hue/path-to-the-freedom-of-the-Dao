"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryPanel = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const useGameStore_1 = require("../../store/useGameStore");
const safeImport_1 = require("@/utils/safeImport");
const TierBadge_1 = __importDefault(require("@/components/ui/TierBadge"));
const Card_1 = require("../core/Card");
const Button_1 = require("../core/Button");
const RichTooltip_1 = __importDefault(require("@/components/ui/RichTooltip"));
const ModalCloseButton_1 = __importDefault(require("@/components/ui/ModalCloseButton"));
const SmallChip_1 = __importDefault(require("@/components/ui/SmallChip"));
// Lightweight icon chooser: prefer explicit icon fields, fall back to rarity/slot glyphs
function pickIconForItem(it) {
    if (!it)
        return '📦';
    if (it.meta && it.meta.icon)
        return it.meta.icon;
    if (it.icon)
        return it.icon;
    const rarity = (it.rarity || it.meta?.rarity || '').toLowerCase();
    if (rarity === "D" || rarity === "B")
        return '💠';
    if (rarity === "E")
        return '🔮';
    if (rarity === "F")
        return '🪙';
    const slot = it.slot || it.meta?.slot;
    if (slot === 'weapon' || slot === 'mainHand')
        return '🗡️';
    if (slot === 'armor')
        return '🛡️';
    if (slot && slot.includes('accessory'))
        return '🔗';
    return '📦';
}
const PAGE_SIZE = 10;
const InventoryPanel = ({ injectedUseGameStore, injectedRelicRegistry }) => {
    const storeHook = injectedUseGameStore || useGameStore_1.useGameStore;
    const player = storeHook((state) => state.player);
    const useItem = storeHook((state) => state.useItem);
    const removeInventoryAt = storeHook((state) => state.removeInventoryAt);
    const removeFromInventoryById = storeHook((state) => state.removeFromInventoryById);
    const [query, setQuery] = (0, react_1.useState)('');
    const [page, setPage] = (0, react_1.useState)(0);
    const [selectedItem, setSelectedItem] = (0, react_1.useState)(null);
    // Helper to remove item by index
    const handleDropByIndex = (index) => {
        try {
            // mark interaction
            const gs = storeHook.getState();
            storeHook.setState({ ui: { ...gs.ui, _inInventoryInteraction: true } });
            if (typeof removeInventoryAt === 'function')
                removeInventoryAt(index);
            else {
                const cur = storeHook.getState();
                const inv = Array.isArray(cur.player.inventory) ? [...cur.player.inventory] : [];
                if (index < 0 || index >= inv.length)
                    return;
                inv.splice(index, 1);
                storeHook.setState({ player: { ...cur.player, inventory: inv } });
            }
        }
        finally {
            const gs2 = storeHook.getState();
            storeHook.setState({ ui: { ...gs2.ui, _inInventoryInteraction: false } });
        }
    };
    // Equip / unequip helpers
    const equipFromInventory = async (itemObj) => {
        try {
            // Prefer to resolve slot synchronously when possible so equipping regular
            // equipment that already lists a slot will call the store.equipItem
            // immediately (tests assert sync behavior).
            let slot = itemObj.slot || itemObj.meta?.slot;
            let relicReg = injectedRelicRegistry || null;
            // If slot is not provided, attempt to resolve via relic registry (async)
            if (!slot) {
                relicReg = injectedRelicRegistry || (await (0, safeImport_1.safeImport)(() => Promise.resolve().then(() => __importStar(require('../../systems/relicRegistry')))));
                // If item is a relic id, try to find it
                const maybeRelicId = String(itemObj.id || '').replace(/^relic_/, '');
                const relic = relicReg && relicReg.findRelic ? relicReg.findRelic(maybeRelicId) : null;
                if (relic)
                    slot = relic.slot === 'weapon' ? 'mainHand' : relic.slot === 'armor' ? 'armor' : 'accessory1';
            }
            if (!slot)
                return; // not equippable
            // If item already appears suitable for Equipment helper, call it; else, if relic, use relicRegistry.equipRelicOnPlayer
            if (itemObj.stats || itemObj.passives) {
                // Use runtime store helper. Prefer any equipItem attached to the injected hook
                // (synchronous) so tests that mock it observe the call immediately.
                const equipFn = storeHook.equipItem;
                if (typeof equipFn === 'function') {
                    equipFn(slot, itemObj);
                    return;
                }
            }
            // Fallback for relics: use equipRelicOnPlayer
            if (String(itemObj.id || '').length) {
                const relicId = String(itemObj.id || '').replace(/^relic_/, '');
                if (!relicReg)
                    relicReg = injectedRelicRegistry || (await (0, safeImport_1.safeImport)(() => Promise.resolve().then(() => __importStar(require('../../systems/relicRegistry')))));
                if (relicReg && typeof relicReg.equipRelicOnPlayer === 'function') {
                    const gs = storeHook.getState();
                    const updated = relicReg.equipRelicOnPlayer ? relicReg.equipRelicOnPlayer(gs.player, relicId) : gs.player;
                    if (updated)
                        storeHook.setState({ player: updated });
                }
            }
        }
        catch (e) {
            // non-fatal
        }
    };
    const unequipSlot = (slot) => {
        try {
            const unequipFn = storeHook.unequipItem;
            if (typeof unequipFn === 'function') {
                unequipFn(slot);
            }
            else {
                // fallback: directly clear (cast to any to satisfy TS index signature)
                const gs = storeHook.getState();
                const eq = { ...(gs.player.equipment || {}) };
                if (eq[slot])
                    delete eq[slot];
                storeHook.setState({ player: { ...gs.player, equipment: eq } });
            }
        }
        catch (e) {
            void e;
        }
    };
    // Normalize inventory into array of item objects
    const normalizedInventory = Array.isArray(player.inventory) ? player.inventory.map((it) => (typeof it === 'string' ? { id: it, name: it } : it)) : [];
    const [expandedGroups, setExpandedGroups] = react_1.default.useState({});
    // Group stacks by id (merge quantities)
    const grouped = (0, react_1.useMemo)(() => {
        const map = new Map();
        normalizedInventory.forEach((it) => {
            const id = it.id || (it.name || 'unknown');
            const existing = map.get(id);
            if (!existing)
                map.set(id, { ...it, quantity: it.quantity || 1, count: 1 });
            else {
                existing.quantity = (existing.quantity || 1) + (it.quantity || 1);
                existing.count = (existing.count || 1) + 1;
            }
        });
        return Array.from(map.values());
    }, [player.inventory]);
    // Apply query filter
    const filtered = grouped.filter(it => {
        if (!query)
            return true;
        const q = query.toLowerCase();
        return String(it.name || it.id || '').toLowerCase().includes(q) || String(it.description || '').toLowerCase().includes(q) || String(it.id || '').toLowerCase().includes(q);
    });
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    return ((0, jsx_runtime_1.jsx)(Card_1.Card, { title: "\uD83C\uDF92 Inventory", children: (0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gap: 8 }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 8, alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)("input", { placeholder: "Search items...", value: query, onChange: e => { setQuery(e.target.value); setPage(0); }, style: { padding: '6px 8px', flex: 1 } }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 12, color: 'var(--muted)' }, children: [filtered.length, " items"] })] }), pageItems.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)' }, children: "No items in inventory." })) : (pageItems.map((it, idx) => {
                    const idKey = String(it.id || it.name || idx);
                    const expanded = !!expandedGroups[idKey];
                    const isManual = (it && (it.type === 'manual' || it.category === 'manual' || it.meta?.type === 'manual'));
                    const tooltipContent = isManual ? ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gap: 6, maxWidth: 320 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 700 }, children: it.name || it.id }), it.description ? (0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)', fontSize: 13 }, children: it.description }) : null, it.effects && typeof it.effects === 'object' ? ((0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 13 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 600, marginTop: 6 }, children: "Effects" }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: 4 }, children: Object.entries(it.effects).map(([k, v]) => ((0, jsx_runtime_1.jsxs)("div", { style: { color: 'var(--muted)', fontSize: 13 }, children: [k, ": ", String(v)] }, k))) })] })) : null, it.passiveId ? (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 13, color: 'var(--muted)' }, children: ["Passive: ", it.passiveId] }) : null] })) : null;
                    const row = ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gap: 6 }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "inventory-row", role: "button", "aria-expanded": expanded, tabIndex: 0, onKeyDown: e => { if (e.key === 'Enter' || e.key === ' ')
                                    setExpandedGroups(s => ({ ...s, [idKey]: !s[idKey] })); }, onClick: () => setExpandedGroups(s => ({ ...s, [idKey]: !s[idKey] })), style: { display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: 8, alignItems: 'center', padding: 6, borderRadius: 6 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 22 }, children: pickIconForItem(it) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 700 }, children: it.name || it.id }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 12, color: 'var(--muted)' }, children: ["Qty: ", it.quantity || 1, " \u2022 Stacks: ", it.count || 1] })] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 6 }, children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => { try {
                                                    const gs = storeHook.getState();
                                                    storeHook.setState({ ui: { ...gs.ui, _inInventoryInteraction: true } });
                                                    const idx = normalizedInventory.findIndex((x) => (x.id || x.name) === (it.id || it.name));
                                                    useItem(idx);
                                                }
                                                finally {
                                                    const gs2 = storeHook.getState();
                                                    storeHook.setState({ ui: { ...gs2.ui, _inInventoryInteraction: false } });
                                                } }, size: "small", children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: "Use" }) }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => { (async () => { try {
                                                    const gs = storeHook.getState();
                                                    storeHook.setState({ ui: { ...gs.ui, _inInventoryInteraction: true } });
                                                    await equipFromInventory(it);
                                                }
                                                finally {
                                                    const gs2 = storeHook.getState();
                                                    storeHook.setState({ ui: { ...gs2.ui, _inInventoryInteraction: false } });
                                                } })(); }, size: "small", children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: "Equip" }) }), (0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "secondary", onClick: () => { setSelectedItem(it); }, size: "small", children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: "Details" }) })] })] }), expanded && ((0, jsx_runtime_1.jsxs)("div", { style: { paddingLeft: 46, display: 'grid', gap: 6 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 12, color: 'var(--muted)' }, children: "Individual stacks (most recent first):" }), normalizedInventory.filter((x) => (x.id || x.name) === (it.id || it.name)).slice().reverse().map((entry, i) => ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', gap: 8 }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 13 }, children: [entry.name || entry.id, " ", entry.quantity ? `x${entry.quantity}` : ''] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 6 }, children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { size: "small", onClick: () => { try {
                                                            const gs = storeHook.getState();
                                                            storeHook.setState({ ui: { ...gs.ui, _inInventoryInteraction: true } });
                                                            const idx = normalizedInventory.findIndex((x) => x === entry);
                                                            useItem(idx);
                                                        }
                                                        finally {
                                                            const gs2 = storeHook.getState();
                                                            storeHook.setState({ ui: { ...gs2.ui, _inInventoryInteraction: false } });
                                                        } }, children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: "Use" }) }), (0, jsx_runtime_1.jsx)(Button_1.Button, { size: "small", variant: "secondary", onClick: () => { const idx = normalizedInventory.findIndex((x) => x === entry); handleDropByIndex(idx); }, children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: "Drop" }) })] })] }, i))), it.rarity ? (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 12, color: 'var(--muted)' }, children: (0, jsx_runtime_1.jsx)(TierBadge_1.default, { tier: it.rarity, small: true }) }) : null, (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 8 }, children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { size: "small", onClick: () => { if (typeof removeFromInventoryById === 'function')
                                                    removeFromInventoryById(it.id || it.name, it.quantity || 1);
                                                else
                                                    alert('Remove not supported'); }, children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: "Remove All" }) }), (0, jsx_runtime_1.jsx)(Button_1.Button, { size: "small", variant: "secondary", onClick: () => setExpandedGroups(s => ({ ...s, [idKey]: false })), children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: "Close" }) })] })] }))] }, idKey));
                    return isManual ? ((0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: tooltipContent, children: row }, idKey)) : row;
                })), totalPages > 1 && ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'center', gap: 8 }, children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { disabled: page === 0, onClick: () => setPage(p => Math.max(0, p - 1)), children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: "Prev" }) }), (0, jsx_runtime_1.jsxs)("div", { style: { alignSelf: 'center' }, children: ["Page ", page + 1, " / ", totalPages] }), (0, jsx_runtime_1.jsx)(Button_1.Button, { disabled: page >= totalPages - 1, onClick: () => setPage(p => Math.min(totalPages - 1, p + 1)), children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: "Next" }) })] })), (0, jsx_runtime_1.jsxs)("div", { style: { borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: 8, marginTop: 6 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 12, color: 'var(--muted)', marginBottom: 6 }, children: "Equipped" }), player.equipment && Object.keys(player.equipment).length ? (Object.entries(player.equipment).map(([slot, obj]) => ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', fontSize: 13, alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)("span", { style: { color: 'var(--muted)' }, children: slot }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 8, alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)("span", { children: obj?.name || obj?.id || '—' }), obj && (0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "secondary", size: "small", onClick: () => unequipSlot(slot), children: "Unequip" })] })] }, slot)))) : ((0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)' }, children: "No equipment equipped." }))] }), selectedItem && ((0, jsx_runtime_1.jsx)("div", { style: { position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', zIndex: 3000 }, onClick: () => setSelectedItem(null), children: (0, jsx_runtime_1.jsxs)("div", { style: { background: 'var(--dark)', padding: 16, borderRadius: 8, minWidth: 320, position: 'relative' }, onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsx)("h4", { style: { marginTop: 0 }, children: selectedItem.name || selectedItem.id }), selectedItem.meta?.icon || selectedItem.icon ? (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 34 }, children: pickIconForItem(selectedItem) }) : null, (0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)', margin: '8px 0' }, children: selectedItem.description }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 13, color: 'var(--muted)' }, children: ["ID: ", selectedItem.id] }), (0, jsx_runtime_1.jsx)("div", { style: { position: 'absolute', right: 8, top: 8 }, children: (0, jsx_runtime_1.jsx)(ModalCloseButton_1.default, { onClick: () => setSelectedItem(null), ariaLabel: "Close item details", title: "Close", size: 16 }) }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 8, marginTop: 12 }, children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => { equipFromInventory(selectedItem); setSelectedItem(null); }, children: "Equip" }), (0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "secondary", onClick: () => setSelectedItem(null), children: "Close" })] })] }) }))] }) }));
};
exports.InventoryPanel = InventoryPanel;
exports.default = exports.InventoryPanel;
