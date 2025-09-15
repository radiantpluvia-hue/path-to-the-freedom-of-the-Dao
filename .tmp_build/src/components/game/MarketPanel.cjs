"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketPanel = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const useGameStore_1 = require("../../store/useGameStore");
const Card_1 = require("../core/Card");
const Button_1 = require("../core/Button");
// Minimal market panel: browse markets/items, buy, auctions (bid/buyout), sell and list
const MarketPanel = () => {
    const { listMarkets, listMarketItems, purchaseFromMarket, listActiveAuctions, placeBidOnAuction, buyoutAuctionItem, listPlayerMarketInventory, sellToMarket, listItemForAuction, } = (0, useGameStore_1.useGameStore)();
    const [selectedMarket, setSelectedMarket] = (0, react_1.useState)('');
    const [markets, setMarkets] = (0, react_1.useState)([]);
    const [items, setItems] = (0, react_1.useState)([]);
    const [auctions, setAuctions] = (0, react_1.useState)([]);
    const [sellQuantities, setSellQuantities] = (0, react_1.useState)({});
    const [listParams, setListParams] = (0, react_1.useState)({});
    const playerMarketInv = listPlayerMarketInventory?.() || {};
    // Load markets on mount
    (0, react_1.useEffect)(() => {
        const m = listMarkets?.() || [];
        setMarkets(m);
        if (m.length && !selectedMarket)
            setSelectedMarket(m[0].id);
    }, [listMarkets, selectedMarket]);
    // Load items whenever market changes
    (0, react_1.useEffect)(() => {
        if (!selectedMarket)
            return;
        const its = listMarketItems?.(selectedMarket) || [];
        setItems(its);
    }, [selectedMarket, listMarketItems]);
    // Refresh auctions periodically
    (0, react_1.useEffect)(() => {
        const loadAuctions = () => setAuctions(listActiveAuctions?.() || []);
        loadAuctions();
        const t = setInterval(loadAuctions, 2000);
        return () => clearInterval(t);
    }, [listActiveAuctions]);
    const handleBuy = (itemId) => {
        if (!selectedMarket)
            return;
        const ok = purchaseFromMarket?.(selectedMarket, itemId);
        if (ok) {
            // Refresh items after purchase
            const its = listMarketItems?.(selectedMarket) || [];
            setItems(its);
        }
    };
    const handleBid = (auctionId, currentBid) => {
        const amount = currentBid + 1; // minimal increment
        placeBidOnAuction?.(auctionId, amount);
    };
    const handleBuyout = (auctionId) => {
        buyoutAuctionItem?.(auctionId);
    };
    const handleSell = (itemId) => {
        const qty = Math.max(1, sellQuantities[itemId] || 1);
        if (!selectedMarket)
            return;
        const ok = sellToMarket?.(selectedMarket, itemId, qty);
        if (ok) {
            setSellQuantities(s => ({ ...s, [itemId]: 1 }));
        }
    };
    const handleListAuction = (itemId) => {
        const params = listParams[itemId] || { start: 1 };
        if (params.start <= 0)
            return;
        listItemForAuction?.(itemId, Math.floor(params.start), params.buyout ? Math.floor(params.buyout) : undefined);
    };
    const marketOptions = (0, react_1.useMemo)(() => (markets.map(m => ((0, jsx_runtime_1.jsx)("option", { value: m.id, children: m.name }, m.id)))), [markets]);
    return ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gap: 16 }, children: [(0, jsx_runtime_1.jsx)(Card_1.Card, { title: "\uD83C\uDFEA Market", children: (0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gap: 12 }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 8, alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Select Market:" }), (0, jsx_runtime_1.jsx)("select", { value: selectedMarket, onChange: e => setSelectedMarket(e.target.value), style: { padding: '6px 8px' }, children: marketOptions })] }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: 8 }, children: items.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)' }, children: "No items available." })) : items.map(item => ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, alignItems: 'center' }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 600 }, children: item.name }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 12, color: 'var(--muted)' }, children: item.description }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 12 }, children: ["Price: ", item.price?.yuan ? `${item.price.yuan}¥` : '—', item.price?.spiritStones && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [' ', "\u2022 Stones: ", item.price.spiritStones.low || 0, "L/", item.price.spiritStones.mid || 0, "M/", item.price.spiritStones.high || 0, "H"] })), ' ', "\u2022 Stock: ", item.stock] })] }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => handleBuy(item.id), children: "Buy" })] }, item.id))) })] }) }), (0, jsx_runtime_1.jsx)(Card_1.Card, { title: "\uD83C\uDFF7\uFE0F Player Inventory (Market Items)", children: (0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: 8 }, children: Object.keys(playerMarketInv).length === 0 ? ((0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)' }, children: "No market-tracked items owned." })) : (Object.entries(playerMarketInv).map(([itemId, qty]) => ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 8, alignItems: 'center' }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 600 }, children: itemId }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 12, color: 'var(--muted)' }, children: ["Qty: ", qty] })] }), (0, jsx_runtime_1.jsx)("input", { type: "number", min: 1, value: sellQuantities[itemId] ?? 1, onChange: e => setSellQuantities(s => ({ ...s, [itemId]: Number(e.target.value) })), style: { width: 70, padding: '6px 8px' } }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => handleSell(itemId), children: "Sell" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 6, alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)("input", { type: "number", min: 1, placeholder: "Start", value: listParams[itemId]?.start ?? '', onChange: e => setListParams(p => ({ ...p, [itemId]: { ...(p[itemId] || {}), start: Number(e.target.value) } })), style: { width: 80, padding: '6px 8px' } }), (0, jsx_runtime_1.jsx)("input", { type: "number", min: 1, placeholder: "Buyout", value: listParams[itemId]?.buyout ?? '', onChange: e => setListParams(p => ({ ...p, [itemId]: { ...(p[itemId] || {}), buyout: Number(e.target.value) } })), style: { width: 90, padding: '6px 8px' } }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => handleListAuction(itemId), children: "List" })] })] }, itemId)))) }) }), (0, jsx_runtime_1.jsx)(Card_1.Card, { title: "\uD83C\uDFC6 Auctions", children: (0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: 8 }, children: auctions.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)' }, children: "No active auctions." })) : auctions.map(a => ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, alignItems: 'center' }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 600 }, children: a.item?.name || a.id }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 12, color: 'var(--muted)' }, children: ["Seller: ", a.sellerName, " \u2022 Time left: ", a.timeRemaining?.toFixed ? a.timeRemaining.toFixed(1) : a.timeRemaining, "h"] }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 12 }, children: ["Current bid: ", a.currentBid, "\u00A5 ", a.buyoutPrice ? `• Buyout: ${a.buyoutPrice}¥` : ''] })] }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => handleBid(a.id, a.currentBid), children: "Bid +1" }), a.buyoutPrice && (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => handleBuyout(a.id), children: "Buyout" })] }, a.id))) }) })] }));
};
exports.MarketPanel = MarketPanel;
exports.default = exports.MarketPanel;
