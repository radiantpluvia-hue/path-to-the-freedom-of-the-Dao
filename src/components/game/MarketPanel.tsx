import React, { useEffect, useMemo, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Card } from '../core/Card';
import { Button } from '../core/Button';

// Minimal market panel: browse markets/items, buy, auctions (bid/buyout), sell and list
export const MarketPanel: React.FC = () => {
  const {
    listMarkets,
    listMarketItems,
    purchaseFromMarket,
    listActiveAuctions,
    placeBidOnAuction,
    buyoutAuctionItem,
    listPlayerMarketInventory,
    sellToMarket,
    listItemForAuction,
  } = useGameStore();

  const [selectedMarket, setSelectedMarket] = useState<string>('');
  const [markets, setMarkets] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [auctions, setAuctions] = useState<any[]>([]);
  const [sellQuantities, setSellQuantities] = useState<Record<string, number>>({});
  const [listParams, setListParams] = useState<Record<string, { start: number; buyout?: number }>>({});

  const playerMarketInv = listPlayerMarketInventory?.() || {};

  // Load markets on mount
  useEffect(() => {
    const m = listMarkets?.() || [];
    setMarkets(m);
    if (m.length && !selectedMarket) setSelectedMarket(m[0].id);
  }, [listMarkets, selectedMarket]);

  // Load items whenever market changes
  useEffect(() => {
    if (!selectedMarket) return;
    const its = listMarketItems?.(selectedMarket) || [];
    setItems(its);
  }, [selectedMarket, listMarketItems]);

  // Refresh auctions periodically
  useEffect(() => {
    const loadAuctions = () => setAuctions(listActiveAuctions?.() || []);
    loadAuctions();
    const t = setInterval(loadAuctions, 2000);
    return () => clearInterval(t);
  }, [listActiveAuctions]);

  const handleBuy = (itemId: string) => {
    if (!selectedMarket) return;
    const ok = purchaseFromMarket?.(selectedMarket, itemId);
    if (ok) {
      // Refresh items after purchase
      const its = listMarketItems?.(selectedMarket) || [];
      setItems(its);
    }
  };

  const handleBid = (auctionId: string, currentBid: number) => {
    const amount = currentBid + 1; // minimal increment
    placeBidOnAuction?.(auctionId, amount);
  };

  const handleBuyout = (auctionId: string) => {
    buyoutAuctionItem?.(auctionId);
  };

  const handleSell = (itemId: string) => {
    const qty = Math.max(1, sellQuantities[itemId] || 1);
    if (!selectedMarket) return;
    const ok = sellToMarket?.(selectedMarket, itemId, qty);
    if (ok) {
      setSellQuantities(s => ({ ...s, [itemId]: 1 }));
    }
  };

  const handleListAuction = (itemId: string) => {
    const params = listParams[itemId] || { start: 1 };
    if (params.start <= 0) return;
    listItemForAuction?.(itemId, Math.floor(params.start), params.buyout ? Math.floor(params.buyout) : undefined);
  };

  const marketOptions = useMemo(() => (
    markets.map(m => (
      <option key={m.id} value={m.id}>{m.name}</option>
    ))
  ), [markets]);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Card title="🏪 Market">
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <strong>Select Market:</strong>
            <select
              value={selectedMarket}
              onChange={e => setSelectedMarket(e.target.value)}
              style={{ padding: '6px 8px' }}
            >
              {marketOptions}
            </select>
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            {items.length === 0 ? (
              <div style={{ color: 'var(--muted)' }}>No items available.</div>
            ) : items.map(item => (
              <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{item.description}</div>
                  <div style={{ fontSize: 12 }}>
                    Price: {item.price?.yuan ? `${item.price.yuan}¥` : '—'}
                    {item.price?.spiritStones && (
                      <>
                        {' '}• Stones: {item.price.spiritStones.low||0}L/{item.price.spiritStones.mid||0}M/{item.price.spiritStones.high||0}H
                      </>
                    )}
                    {' '}• Stock: {item.stock}
                  </div>
                </div>
                <Button onClick={() => handleBuy(item.id)}>Buy</Button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card title="🏷️ Player Inventory (Market Items)">
        <div style={{ display: 'grid', gap: 8 }}>
          {Object.keys(playerMarketInv).length === 0 ? (
            <div style={{ color: 'var(--muted)' }}>No market-tracked items owned.</div>
          ) : (
            Object.entries(playerMarketInv).map(([itemId, qty]) => (
              <div key={itemId} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 8, alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{itemId}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Qty: {qty}</div>
                </div>
                <input
                  type="number"
                  min={1}
                  value={sellQuantities[itemId] ?? 1}
                  onChange={e => setSellQuantities(s => ({ ...s, [itemId]: Number(e.target.value) }))}
                  style={{ width: 70, padding: '6px 8px' }}
                />
                <Button onClick={() => handleSell(itemId)}>Sell</Button>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input
                    type="number"
                    min={1}
                    placeholder="Start"
                    value={listParams[itemId]?.start ?? ''}
                    onChange={e => setListParams(p => ({ ...p, [itemId]: { ...(p[itemId]||{}), start: Number(e.target.value) } }))}
                    style={{ width: 80, padding: '6px 8px' }}
                  />
                  <input
                    type="number"
                    min={1}
                    placeholder="Buyout"
                    value={listParams[itemId]?.buyout ?? ''}
                    onChange={e => setListParams(p => ({ ...p, [itemId]: { ...(p[itemId]||{}), buyout: Number(e.target.value) } }))}
                    style={{ width: 90, padding: '6px 8px' }}
                  />
                  <Button onClick={() => handleListAuction(itemId)}>List</Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card title="🏆 Auctions">
        <div style={{ display: 'grid', gap: 8 }}>
          {auctions.length === 0 ? (
            <div style={{ color: 'var(--muted)' }}>No active auctions.</div>
          ) : auctions.map(a => (
            <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{a.item?.name || a.id}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Seller: {a.sellerName} • Time left: {a.timeRemaining?.toFixed ? a.timeRemaining.toFixed(1) : a.timeRemaining}h</div>
                <div style={{ fontSize: 12 }}>
                  Current bid: {a.currentBid}¥ {a.buyoutPrice ? `• Buyout: ${a.buyoutPrice}¥` : ''}
                </div>
              </div>
              <Button onClick={() => handleBid(a.id, a.currentBid)}>Bid +1</Button>
              {a.buyoutPrice && <Button onClick={() => handleBuyout(a.id)}>Buyout</Button>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default MarketPanel;