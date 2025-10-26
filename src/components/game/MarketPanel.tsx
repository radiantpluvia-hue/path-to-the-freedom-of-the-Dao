import React, { useEffect, useMemo, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { safeImport } from '@/utils/safeImport';
import { Card } from '../core/Card';
import { Button } from '../core/Button';
import { logger } from '../../utils/logger';
// displayRarity removed: not used in this panel
import SmallChip from '../ui/SmallChip';
import TierBadge from '@/components/ui/TierBadge';
// confirmRegistry import removed: MarketPanel uses the centralized showConfirm helper

interface MarketPanelProps {
  injectedRelicRegistry?: any;
}

// Minimal market panel: browse markets/items, buy, auctions (bid/buyout), sell and list
export const MarketPanel: React.FC<MarketPanelProps> = ({ injectedRelicRegistry }) => {
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
    showToast,
  } = useGameStore();

  const [selectedMarket, setSelectedMarket] = useState<string>('');
  const [markets, setMarkets] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [auctions, setAuctions] = useState<any[]>([]);
  const [resolvedRelicRegistry, setResolvedRelicRegistry] = useState<any>(injectedRelicRegistry || null);
  const [sellQuantities, setSellQuantities] = useState<Record<string, number>>({});
  const [listParams, setListParams] = useState<Record<string, { start: number; buyout?: number }>>({});

  const playerMarketInv = listPlayerMarketInventory?.() || {};

  // Load markets on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      // Ensure the large market data is available before asking the store for markets
      try {
        const ms = await safeImport(() => import('../../systems/MarketSystem'));
        const msAny = ms as any;
        if (msAny && msAny.loadMarketData) {
          // prefer to await loadMarketData when available
          await msAny.loadMarketData();
        }
      } catch (e) {
        // non-fatal; fall back to store-provided markets
      }

      if (!mounted) return;
      const m = listMarkets?.() || [];
      setMarkets(m);
      if (m.length && !selectedMarket) setSelectedMarket(m[0].id);
    })();
    return () => { mounted = false; };
  }, [listMarkets, selectedMarket]);

  // Resolve relic registry asynchronously when not injected
  useEffect(() => {
    if (injectedRelicRegistry) return; // already provided
    let mounted = true;
    (async () => {
      const mod = await safeImport(() => import('../../systems/relicRegistry'));
      if (mounted && mod) setResolvedRelicRegistry(mod);
    })();
    return () => { mounted = false; };
  }, [injectedRelicRegistry]);

  // Load items whenever market changes
  useEffect(() => {
    if (!selectedMarket) return;
    const its = listMarketItems?.(selectedMarket) || [];
    setItems(its);
  }, [selectedMarket, listMarketItems]);

  // Refresh auctions periodically. Rely on the store's synchronous fallback
  // for `listActiveAuctions` so components receive an array even while the
  // heavy MarketSystem loads asynchronously. Keep a render-time guard when
  // mapping to avoid unexpected runtime errors.
  useEffect(() => {
    const loadAuctions = () => {
      try {
        const res = listActiveAuctions?.();
        setAuctions(Array.isArray(res) ? res : []);
      } catch (e) {
        logger.warn('MarketPanel: failed to load auctions', e);
        setAuctions([]);
      }
    };
    loadAuctions();
    const t = setInterval(loadAuctions, 2000);
    return () => clearInterval(t);
  }, [listActiveAuctions]);

  const handleBuy = async (itemId: string) => {
    if (!selectedMarket) return;
    const item = items.find(i => i.id === itemId);
    // If this is a relic purchase and there's a mythic equip conflict, open confirm
    const isRelicWrapper = typeof item?.id === 'string' && String(item.id).startsWith('relic_');
    if (isRelicWrapper) {
      try {
        const relicReg = injectedRelicRegistry || (await safeImport(() => import('../../systems/relicRegistry')));
        const relicId = String(item.id).replace(/^relic_/, '');
        const relic = relicReg && relicReg.findRelic ? relicReg.findRelic(relicId) : null;
        if (relic && relic.rarity === 'Mythic') {
          // Check if player already has a different mythic equipped
          const player = useGameStore.getState().player;
          const allRelics = relicReg.listRelics ? relicReg.listRelics() : [];
          const mythicIds = new Set(allRelics.filter((r: any) => r.rarity === 'Mythic').map((r: any) => r.id));
          const equippedRelicIds = Object.values(player.equipment || {}).map((it: any) => it && it.id).filter((id: any) => mythicIds.has(id));
          if (equippedRelicIds.length && !equippedRelicIds.includes(relicId)) {
            // ask user with promise-based confirm helper
            try {
              const showConfirmModule = await safeImport(() => import('../../store/showConfirm'));
              const showConfirm = showConfirmModule ? (showConfirmModule as any).showConfirm : null;
              if (showConfirm) {
                showConfirm({
                  title: 'Replace existing Mythic?',
                  message: `You already have a Mythic relic equipped. Purchasing this Mythic will replace your current one. Proceed?`,
                  confirmLabel: 'Replace',
                  cancelLabel: 'Cancel',
                }).then(async (ok: boolean) => {
                if (!ok) return;
                const bought = purchaseFromMarket?.(selectedMarket, itemId);
                if (bought) {
                  try {
                    const relicReg2 = injectedRelicRegistry || (await safeImport(() => import('../../systems/relicRegistry')));
                    const player2 = useGameStore.getState().player;
                    const updated = relicReg2.forceEquipRelicReplacingMythic ? relicReg2.forceEquipRelicReplacingMythic(player2, relicId) : player2;
                    if (updated) useGameStore.setState({ player: updated });
                  } catch (e) { /* non-fatal */ }
                  const its = listMarketItems?.(selectedMarket) || [];
                  setItems(its);
                }
                });
              }
            } catch (e) {
              // fallback: no confirm helper available
            }
            return;
          }
        }
      } catch { /* non-fatal */ }
    }

    const ok = purchaseFromMarket?.(selectedMarket, itemId);
    if (ok) {
      try { showToast?.(`Purchased ${item?.name || itemId}`, 2500, 'success'); } catch { /* ignore */ }
      // If we bought a relic and it's mythic, attempt auto-equip if possible
      try {
        if (isRelicWrapper) {
          const relicReg = injectedRelicRegistry || (await safeImport(() => import('../../systems/relicRegistry')));
          const relicId = String(item.id).replace(/^relic_/, '');
          const relic = relicReg && relicReg.findRelic ? relicReg.findRelic(relicId) : null;
          if (relic && relic.rarity === 'Mythic') {
            // If player has a mythic already, do nothing (purchase path without confirm won't replace)
            const player = useGameStore.getState().player;
            const allRelics = relicReg.listRelics ? relicReg.listRelics() : [];
            const mythicIds = new Set(allRelics.filter((r: any) => r.rarity === 'Mythic').map((r: any) => r.id));
            const equippedRelicIds = Object.values(player.equipment || {}).map((it: any) => it && it.id).filter((id: any) => mythicIds.has(id));
            if (!equippedRelicIds.length) {
              const updated = relicReg.forceEquipRelicReplacingMythic ? relicReg.forceEquipRelicReplacingMythic(player, relicId) : player;
              if (updated) useGameStore.setState({ player: updated });
            }
          }
        }
      } catch { /* non-fatal */ }

      // Refresh items after purchase
      const its = listMarketItems?.(selectedMarket) || [];
      setItems(its);
    } else {
      try { showToast?.(`Purchase failed: ${item?.name || itemId}`, 2500, 'error'); } catch { /* ignore */ }
    }
  };

  // no local confirm state; using centralized GlobalConfirm

  const handleBid = (auctionId: string, currentBid: number) => {
    const amount = currentBid + 1; // minimal increment
    const ok = placeBidOnAuction?.(auctionId, amount);
    try { showToast?.(ok ? `Bid placed: +1 on ${auctionId}` : `Bid failed on ${auctionId}`, 2000, ok ? 'success' : 'error'); } catch { /* ignore */ }
  };

  const handleBuyout = (auctionId: string) => {
    const ok = buyoutAuctionItem?.(auctionId);
    try { showToast?.(ok ? `Auction bought out: ${auctionId}` : `Buyout failed: ${auctionId}`, 2500, ok ? 'success' : 'error'); } catch { /* ignore */ }
  };

  const handleSell = (itemId: string) => {
    const qty = Math.max(1, sellQuantities[itemId] || 1);
    if (!selectedMarket) return;
    const ok = sellToMarket?.(selectedMarket, itemId, qty);
    if (ok) {
      setSellQuantities(s => ({ ...s, [itemId]: 1 }));
      try { showToast?.(`Sold ${qty}x ${itemId}`, 2500, 'success'); } catch { /* ignore */ }
    } else {
      try { showToast?.(`Sell failed: ${itemId}`, 2500, 'error'); } catch { /* ignore */ }
    }
  };

  const handleListAuction = (itemId: string) => {
    const params = listParams[itemId] || { start: 1 };
    if (params.start <= 0) return;
    const ok = listItemForAuction?.(itemId, Math.floor(params.start), params.buyout ? Math.floor(params.buyout) : undefined);
    try { showToast?.(ok ? `Listed ${itemId} for auction` : `Listing failed: ${itemId}`, 2500, ok ? 'success' : 'error'); } catch { /* ignore */ }
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
            ) : items.map(item => {
              const isRelicWrapper = typeof item.id === 'string' && String(item.id).startsWith('relic_');
              let claimed = false;
              let rarityLabel: string | null = null;
              try {
                if (isRelicWrapper) {
                  const relicReg = injectedRelicRegistry || resolvedRelicRegistry || null;
                  const baseId = String(item.id).replace(/^relic_/, '');
                  claimed = relicReg && relicReg.isRelicClaimed ? relicReg.isRelicClaimed(baseId) : false;
                  const relic = relicReg && relicReg.findRelic ? relicReg.findRelic(baseId) : null;
                  rarityLabel = relic ? relic.rarity : (item.rarity || null);
                } else {
                  rarityLabel = item.rarity || null;
                }
              } catch { /* non-fatal */ }

              const rarityColors: Record<string,string> = {
                common: '#ccc', uncommon: '#5fa85f', rare: '#3b82f6', epic: '#a855f7', legendary: '#f59e0b', mythical: '#ef4444', mythic: '#ef4444', transcendent: '#38bdf8'
              };
              const rarityKey = (rarityLabel || '').toLowerCase();
              const _color = rarityColors[rarityKey] || '#999';
              const buyDisabled = claimed || !(item.stock > 0);

              return (
                <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'center', opacity: buyDisabled ? 0.75 : 1 }}>
                  <div>
                    <div style={{ fontWeight: 600, display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ color: _color }}>{item.name}</span>
                      {rarityLabel && (
                        <span style={{ marginLeft: 4 }}><TierBadge tier={rarityLabel} small={true} /></span>
                      )}
                      {claimed && (
                        <SmallChip style={{ fontSize: 10, borderRadius: 4, background: '#444', color: '#fff', fontWeight: 700 }}>CLAIMED</SmallChip>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{item.description}</div>
                    <div style={{ fontSize: 12 }}>Price: {item.price?.yuan ? `${item.price.yuan}¥` : '—'} • Stock: {item.stock}</div>
                  </div>
                  <Button disabled={buyDisabled} aria-label={claimed ? `Claimed: ${item.name}. Cannot purchase.` : `Buy ${item.name}`} onClick={() => handleBuy(item.id)}>{claimed ? <SmallChip>Claimed</SmallChip> : <SmallChip>Buy</SmallChip>}</Button>
                </div>
              );
            })}
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
          {(!Array.isArray(auctions) || auctions.length === 0) ? (
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