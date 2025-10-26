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
exports.MarketPanel = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const useGameStore_1 = require("../../store/useGameStore");
const safeImport_1 = require("@/utils/safeImport");
const Card_1 = require("../core/Card");
const Button_1 = require("../core/Button");
const logger_1 = require("../../utils/logger");
// displayRarity removed: not used in this panel
const SmallChip_1 = __importDefault(require("../ui/SmallChip"));
const TierBadge_1 = __importDefault(require("@/components/ui/TierBadge"));
// Minimal market panel: browse markets/items, buy, auctions (bid/buyout), sell and list
const MarketPanel = ({ injectedRelicRegistry }) => {
    const { listMarkets, listMarketItems, purchaseFromMarket, listActiveAuctions, placeBidOnAuction, buyoutAuctionItem, listPlayerMarketInventory, sellToMarket, listItemForAuction, showToast, } = (0, useGameStore_1.useGameStore)();
    const [selectedMarket, setSelectedMarket] = (0, react_1.useState)('');
    const [markets, setMarkets] = (0, react_1.useState)([]);
    const [items, setItems] = (0, react_1.useState)([]);
    const [auctions, setAuctions] = (0, react_1.useState)([]);
    const [resolvedRelicRegistry, setResolvedRelicRegistry] = (0, react_1.useState)(injectedRelicRegistry || null);
    const [sellQuantities, setSellQuantities] = (0, react_1.useState)({});
    const [listParams, setListParams] = (0, react_1.useState)({});
    const playerMarketInv = listPlayerMarketInventory?.() || {};
    // Load markets on mount
    (0, react_1.useEffect)(() => {
        let mounted = true;
        (async () => {
            // Ensure the large market data is available before asking the store for markets
            try {
                const ms = await (0, safeImport_1.safeImport)(() => Promise.resolve().then(() => __importStar(require('../../systems/MarketSystem'))));
                const msAny = ms;
                if (msAny && msAny.loadMarketData) {
                    // prefer to await loadMarketData when available
                    await msAny.loadMarketData();
                }
            }
            catch (e) {
                // non-fatal; fall back to store-provided markets
            }
            if (!mounted)
                return;
            const m = listMarkets?.() || [];
            setMarkets(m);
            if (m.length && !selectedMarket)
                setSelectedMarket(m[0].id);
        })();
        return () => { mounted = false; };
    }, [listMarkets, selectedMarket]);
    // Resolve relic registry asynchronously when not injected
    (0, react_1.useEffect)(() => {
        if (injectedRelicRegistry)
            return; // already provided
        let mounted = true;
        (async () => {
            const mod = await (0, safeImport_1.safeImport)(() => Promise.resolve().then(() => __importStar(require('../../systems/relicRegistry'))));
            if (mounted && mod)
                setResolvedRelicRegistry(mod);
        })();
        return () => { mounted = false; };
    }, [injectedRelicRegistry]);
    // Load items whenever market changes
    (0, react_1.useEffect)(() => {
        if (!selectedMarket)
            return;
        const its = listMarketItems?.(selectedMarket) || [];
        setItems(its);
    }, [selectedMarket, listMarketItems]);
    // Refresh auctions periodically. Rely on the store's synchronous fallback
    // for `listActiveAuctions` so components receive an array even while the
    // heavy MarketSystem loads asynchronously. Keep a render-time guard when
    // mapping to avoid unexpected runtime errors.
    (0, react_1.useEffect)(() => {
        const loadAuctions = () => {
            try {
                const res = listActiveAuctions?.();
                setAuctions(Array.isArray(res) ? res : []);
            }
            catch (e) {
                logger_1.logger.warn('MarketPanel: failed to load auctions', e);
                setAuctions([]);
            }
        };
        loadAuctions();
        const t = setInterval(loadAuctions, 2000);
        return () => clearInterval(t);
    }, [listActiveAuctions]);
    const handleBuy = async (itemId) => {
        if (!selectedMarket)
            return;
        const item = items.find(i => i.id === itemId);
        // If this is a relic purchase and there's a mythic equip conflict, open confirm
        const isRelicWrapper = typeof item?.id === 'string' && String(item.id).startsWith('relic_');
        if (isRelicWrapper) {
            try {
                const relicReg = injectedRelicRegistry || (await (0, safeImport_1.safeImport)(() => Promise.resolve().then(() => __importStar(require('../../systems/relicRegistry')))));
                const relicId = String(item.id).replace(/^relic_/, '');
                const relic = relicReg && relicReg.findRelic ? relicReg.findRelic(relicId) : null;
                if (relic && relic.rarity === 'Mythic') {
                    // Check if player already has a different mythic equipped
                    const player = useGameStore_1.useGameStore.getState().player;
                    const allRelics = relicReg.listRelics ? relicReg.listRelics() : [];
                    const mythicIds = new Set(allRelics.filter((r) => r.rarity === 'Mythic').map((r) => r.id));
                    const equippedRelicIds = Object.values(player.equipment || {}).map((it) => it && it.id).filter((id) => mythicIds.has(id));
                    if (equippedRelicIds.length && !equippedRelicIds.includes(relicId)) {
                        // ask user with promise-based confirm helper
                        try {
                            const showConfirmModule = await (0, safeImport_1.safeImport)(() => Promise.resolve().then(() => __importStar(require('../../store/showConfirm'))));
                            const showConfirm = showConfirmModule ? showConfirmModule.showConfirm : null;
                            if (showConfirm) {
                                showConfirm({
                                    title: 'Replace existing Mythic?',
                                    message: `You already have a Mythic relic equipped. Purchasing this Mythic will replace your current one. Proceed?`,
                                    confirmLabel: 'Replace',
                                    cancelLabel: 'Cancel',
                                }).then(async (ok) => {
                                    if (!ok)
                                        return;
                                    const bought = purchaseFromMarket?.(selectedMarket, itemId);
                                    if (bought) {
                                        try {
                                            const relicReg2 = injectedRelicRegistry || (await (0, safeImport_1.safeImport)(() => Promise.resolve().then(() => __importStar(require('../../systems/relicRegistry')))));
                                            const player2 = useGameStore_1.useGameStore.getState().player;
                                            const updated = relicReg2.forceEquipRelicReplacingMythic ? relicReg2.forceEquipRelicReplacingMythic(player2, relicId) : player2;
                                            if (updated)
                                                useGameStore_1.useGameStore.setState({ player: updated });
                                        }
                                        catch (e) { /* non-fatal */ }
                                        const its = listMarketItems?.(selectedMarket) || [];
                                        setItems(its);
                                    }
                                });
                            }
                        }
                        catch (e) {
                            // fallback: no confirm helper available
                        }
                        return;
                    }
                }
            }
            catch { /* non-fatal */ }
        }
        const ok = purchaseFromMarket?.(selectedMarket, itemId);
        if (ok) {
            try {
                showToast?.(`Purchased ${item?.name || itemId}`, 2500, 'success');
            }
            catch { /* ignore */ }
            // If we bought a relic and it's mythic, attempt auto-equip if possible
            try {
                if (isRelicWrapper) {
                    const relicReg = injectedRelicRegistry || (await (0, safeImport_1.safeImport)(() => Promise.resolve().then(() => __importStar(require('../../systems/relicRegistry')))));
                    const relicId = String(item.id).replace(/^relic_/, '');
                    const relic = relicReg && relicReg.findRelic ? relicReg.findRelic(relicId) : null;
                    if (relic && relic.rarity === 'Mythic') {
                        // If player has a mythic already, do nothing (purchase path without confirm won't replace)
                        const player = useGameStore_1.useGameStore.getState().player;
                        const allRelics = relicReg.listRelics ? relicReg.listRelics() : [];
                        const mythicIds = new Set(allRelics.filter((r) => r.rarity === 'Mythic').map((r) => r.id));
                        const equippedRelicIds = Object.values(player.equipment || {}).map((it) => it && it.id).filter((id) => mythicIds.has(id));
                        if (!equippedRelicIds.length) {
                            const updated = relicReg.forceEquipRelicReplacingMythic ? relicReg.forceEquipRelicReplacingMythic(player, relicId) : player;
                            if (updated)
                                useGameStore_1.useGameStore.setState({ player: updated });
                        }
                    }
                }
            }
            catch { /* non-fatal */ }
            // Refresh items after purchase
            const its = listMarketItems?.(selectedMarket) || [];
            setItems(its);
        }
        else {
            try {
                showToast?.(`Purchase failed: ${item?.name || itemId}`, 2500, 'error');
            }
            catch { /* ignore */ }
        }
    };
    // no local confirm state; using centralized GlobalConfirm
    const handleBid = (auctionId, currentBid) => {
        const amount = currentBid + 1; // minimal increment
        const ok = placeBidOnAuction?.(auctionId, amount);
        try {
            showToast?.(ok ? `Bid placed: +1 on ${auctionId}` : `Bid failed on ${auctionId}`, 2000, ok ? 'success' : 'error');
        }
        catch { /* ignore */ }
    };
    const handleBuyout = (auctionId) => {
        const ok = buyoutAuctionItem?.(auctionId);
        try {
            showToast?.(ok ? `Auction bought out: ${auctionId}` : `Buyout failed: ${auctionId}`, 2500, ok ? 'success' : 'error');
        }
        catch { /* ignore */ }
    };
    const handleSell = (itemId) => {
        const qty = Math.max(1, sellQuantities[itemId] || 1);
        if (!selectedMarket)
            return;
        const ok = sellToMarket?.(selectedMarket, itemId, qty);
        if (ok) {
            setSellQuantities(s => ({ ...s, [itemId]: 1 }));
            try {
                showToast?.(`Sold ${qty}x ${itemId}`, 2500, 'success');
            }
            catch { /* ignore */ }
        }
        else {
            try {
                showToast?.(`Sell failed: ${itemId}`, 2500, 'error');
            }
            catch { /* ignore */ }
        }
    };
    const handleListAuction = (itemId) => {
        const params = listParams[itemId] || { start: 1 };
        if (params.start <= 0)
            return;
        const ok = listItemForAuction?.(itemId, Math.floor(params.start), params.buyout ? Math.floor(params.buyout) : undefined);
        try {
            showToast?.(ok ? `Listed ${itemId} for auction` : `Listing failed: ${itemId}`, 2500, ok ? 'success' : 'error');
        }
        catch { /* ignore */ }
    };
    const marketOptions = (0, react_1.useMemo)(() => (markets.map(m => ((0, jsx_runtime_1.jsx)("option", { value: m.id, children: m.name }, m.id)))), [markets]);
    return ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gap: 16 }, children: [(0, jsx_runtime_1.jsx)(Card_1.Card, { title: "\uD83C\uDFEA Market", children: (0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gap: 12 }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 8, alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Select Market:" }), (0, jsx_runtime_1.jsx)("select", { value: selectedMarket, onChange: e => setSelectedMarket(e.target.value), style: { padding: '6px 8px' }, children: marketOptions })] }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: 8 }, children: items.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)' }, children: "No items available." })) : items.map(item => {
                                const isRelicWrapper = typeof item.id === 'string' && String(item.id).startsWith('relic_');
                                let claimed = false;
                                let rarityLabel = null;
                                try {
                                    if (isRelicWrapper) {
                                        const relicReg = injectedRelicRegistry || resolvedRelicRegistry || null;
                                        const baseId = String(item.id).replace(/^relic_/, '');
                                        claimed = relicReg && relicReg.isRelicClaimed ? relicReg.isRelicClaimed(baseId) : false;
                                        const relic = relicReg && relicReg.findRelic ? relicReg.findRelic(baseId) : null;
                                        rarityLabel = relic ? relic.rarity : (item.rarity || null);
                                    }
                                    else {
                                        rarityLabel = item.rarity || null;
                                    }
                                }
                                catch { /* non-fatal */ }
                                const rarityColors = {
                                    common: '#ccc', uncommon: '#5fa85f', rare: '#3b82f6', epic: '#a855f7', legendary: '#f59e0b', mythical: '#ef4444', mythic: '#ef4444', transcendent: '#38bdf8'
                                };
                                const rarityKey = (rarityLabel || '').toLowerCase();
                                const _color = rarityColors[rarityKey] || '#999';
                                const buyDisabled = claimed || !(item.stock > 0);
                                return ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'center', opacity: buyDisabled ? 0.75 : 1 }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { style: { fontWeight: 600, display: 'flex', gap: 8, alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)("span", { style: { color: _color }, children: item.name }), rarityLabel && ((0, jsx_runtime_1.jsx)("span", { style: { marginLeft: 4 }, children: (0, jsx_runtime_1.jsx)(TierBadge_1.default, { tier: rarityLabel, small: true }) })), claimed && ((0, jsx_runtime_1.jsx)(SmallChip_1.default, { style: { fontSize: 10, borderRadius: 4, background: '#444', color: '#fff', fontWeight: 700 }, children: "CLAIMED" }))] }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 12, color: 'var(--muted)' }, children: item.description }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 12 }, children: ["Price: ", item.price?.yuan ? `${item.price.yuan}¥` : '—', " \u2022 Stock: ", item.stock] })] }), (0, jsx_runtime_1.jsx)(Button_1.Button, { disabled: buyDisabled, "aria-label": claimed ? `Claimed: ${item.name}. Cannot purchase.` : `Buy ${item.name}`, onClick: () => handleBuy(item.id), children: claimed ? (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: "Claimed" }) : (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: "Buy" }) })] }, item.id));
                            }) })] }) }), (0, jsx_runtime_1.jsx)(Card_1.Card, { title: "\uD83C\uDFF7\uFE0F Player Inventory (Market Items)", children: (0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: 8 }, children: Object.keys(playerMarketInv).length === 0 ? ((0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)' }, children: "No market-tracked items owned." })) : (Object.entries(playerMarketInv).map(([itemId, qty]) => ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 8, alignItems: 'center' }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 600 }, children: itemId }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 12, color: 'var(--muted)' }, children: ["Qty: ", qty] })] }), (0, jsx_runtime_1.jsx)("input", { type: "number", min: 1, value: sellQuantities[itemId] ?? 1, onChange: e => setSellQuantities(s => ({ ...s, [itemId]: Number(e.target.value) })), style: { width: 70, padding: '6px 8px' } }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => handleSell(itemId), children: "Sell" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 6, alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)("input", { type: "number", min: 1, placeholder: "Start", value: listParams[itemId]?.start ?? '', onChange: e => setListParams(p => ({ ...p, [itemId]: { ...(p[itemId] || {}), start: Number(e.target.value) } })), style: { width: 80, padding: '6px 8px' } }), (0, jsx_runtime_1.jsx)("input", { type: "number", min: 1, placeholder: "Buyout", value: listParams[itemId]?.buyout ?? '', onChange: e => setListParams(p => ({ ...p, [itemId]: { ...(p[itemId] || {}), buyout: Number(e.target.value) } })), style: { width: 90, padding: '6px 8px' } }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => handleListAuction(itemId), children: "List" })] })] }, itemId)))) }) }), (0, jsx_runtime_1.jsx)(Card_1.Card, { title: "\uD83C\uDFC6 Auctions", children: (0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: 8 }, children: (!Array.isArray(auctions) || auctions.length === 0) ? ((0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)' }, children: "No active auctions." })) : auctions.map(a => ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, alignItems: 'center' }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 600 }, children: a.item?.name || a.id }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 12, color: 'var(--muted)' }, children: ["Seller: ", a.sellerName, " \u2022 Time left: ", a.timeRemaining?.toFixed ? a.timeRemaining.toFixed(1) : a.timeRemaining, "h"] }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 12 }, children: ["Current bid: ", a.currentBid, "\u00A5 ", a.buyoutPrice ? `• Buyout: ${a.buyoutPrice}¥` : ''] })] }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => handleBid(a.id, a.currentBid), children: "Bid +1" }), a.buyoutPrice && (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => handleBuyout(a.id), children: "Buyout" })] }, a.id))) }) })] }));
};
exports.MarketPanel = MarketPanel;
exports.default = exports.MarketPanel;
