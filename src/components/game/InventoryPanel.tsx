import React, { useMemo, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { safeImport } from '@/utils/safeImport';
import TierBadge from '@/components/ui/TierBadge';
import { Card } from '../core/Card';
import { Button } from '../core/Button';
import RichTooltip from '@/components/ui/RichTooltip';
import ModalCloseButton from '@/components/ui/ModalCloseButton';
import SmallChip from '@/components/ui/SmallChip';

// Lightweight icon chooser: prefer explicit icon fields, fall back to rarity/slot glyphs
function pickIconForItem(it: any) {
  if (!it) return '📦';
  if (it.meta && it.meta.icon) return it.meta.icon;
  if (it.icon) return it.icon;
  const rarity = (it.rarity || it.meta?.rarity || '').toLowerCase();
  if (rarity === "D" || rarity === "B") return '💠';
  if (rarity === "E") return '🔮';
  if (rarity === "F") return '🪙';
  const slot = it.slot || it.meta?.slot;
  if (slot === 'weapon' || slot === 'mainHand') return '🗡️';
  if (slot === 'armor') return '🛡️';
  if (slot && slot.includes('accessory')) return '🔗';
  return '📦';
}

const PAGE_SIZE = 10;

interface InventoryPanelProps {
  injectedUseGameStore?: any;
  injectedRelicRegistry?: any;
}

export const InventoryPanel: React.FC<InventoryPanelProps> = ({ injectedUseGameStore, injectedRelicRegistry }) => {
  const storeHook: any = injectedUseGameStore || useGameStore;
  const player = storeHook((state: any) => state.player);
  const useItem = storeHook((state: any) => state.useItem);
  const removeInventoryAt = storeHook((state: any) => state.removeInventoryAt);
  const removeFromInventoryById = storeHook((state: any) => state.removeFromInventoryById);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Helper to remove item by index
  const handleDropByIndex = (index: number) => {
    try {
      // mark interaction
      const gs = storeHook.getState();
      storeHook.setState({ ui: { ...gs.ui, _inInventoryInteraction: true } });
      if (typeof removeInventoryAt === 'function') removeInventoryAt(index);
      else {
        const cur = storeHook.getState();
        const inv = Array.isArray(cur.player.inventory) ? [...cur.player.inventory] : [];
        if (index < 0 || index >= inv.length) return;
        inv.splice(index, 1);
        storeHook.setState({ player: { ...cur.player, inventory: inv } });
      }
    } finally {
      const gs2 = storeHook.getState();
      storeHook.setState({ ui: { ...gs2.ui, _inInventoryInteraction: false } });
    }
  };

  // Equip / unequip helpers
  const equipFromInventory = async (itemObj: any) => {
    try {
      // Prefer to resolve slot synchronously when possible so equipping regular
      // equipment that already lists a slot will call the store.equipItem
      // immediately (tests assert sync behavior).
      let slot = itemObj.slot || itemObj.meta?.slot;
      let relicReg: any = injectedRelicRegistry || null;
      // If slot is not provided, attempt to resolve via relic registry (async)
      if (!slot) {
        relicReg = injectedRelicRegistry || (await safeImport(() => import('../../systems/relicRegistry')));
        // If item is a relic id, try to find it
        const maybeRelicId = String(itemObj.id || '').replace(/^relic_/, '');
        const relic = relicReg && relicReg.findRelic ? relicReg.findRelic(maybeRelicId) : null;
        if (relic) slot = relic.slot === 'weapon' ? 'mainHand' : relic.slot === 'armor' ? 'armor' : 'accessory1';
      }
      if (!slot) return; // not equippable

      // If item already appears suitable for Equipment helper, call it; else, if relic, use relicRegistry.equipRelicOnPlayer
      if (itemObj.stats || itemObj.passives) {
        // Use runtime store helper. Prefer any equipItem attached to the injected hook
        // (synchronous) so tests that mock it observe the call immediately.
        const equipFn = (storeHook as any).equipItem as any;
        if (typeof equipFn === 'function') {
          equipFn(slot, itemObj);
          return;
        }
      }

      // Fallback for relics: use equipRelicOnPlayer
      if (String(itemObj.id || '').length) {
        const relicId = String(itemObj.id || '').replace(/^relic_/, '');
        if (!relicReg) relicReg = injectedRelicRegistry || (await safeImport(() => import('../../systems/relicRegistry')));
        if (relicReg && typeof relicReg.equipRelicOnPlayer === 'function') {
          const gs = storeHook.getState();
          const updated = relicReg.equipRelicOnPlayer ? relicReg.equipRelicOnPlayer(gs.player, relicId) : gs.player;
          if (updated) storeHook.setState({ player: updated });
        }
      }
    } catch (e) {
      // non-fatal
    }
  };

  const unequipSlot = (slot: string) => {
    try {
      const unequipFn = (storeHook as any).unequipItem as any;
      if (typeof unequipFn === 'function') {
        unequipFn(slot);
      } else {
        // fallback: directly clear (cast to any to satisfy TS index signature)
        const gs = storeHook.getState();
        const eq: any = { ...(gs.player.equipment || {}) };
        if (eq[slot]) delete eq[slot];
        storeHook.setState({ player: { ...gs.player, equipment: eq as any } });
      }
    } catch (e) { void e; }
  };

  // Normalize inventory into array of item objects
  const normalizedInventory = Array.isArray(player.inventory) ? player.inventory.map((it: any) => (typeof it === 'string' ? { id: it, name: it } : it)) : [];

  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({});

  // Group stacks by id (merge quantities)
  const grouped = useMemo(() => {
    const map = new Map<string, any>();
    normalizedInventory.forEach((it: any) => {
      const id = it.id || (it.name || 'unknown');
      const existing = map.get(id);
      if (!existing) map.set(id, { ...it, quantity: it.quantity || 1, count: 1 });
      else { existing.quantity = (existing.quantity || 1) + (it.quantity || 1); existing.count = (existing.count || 1) + 1; }
    });
    return Array.from(map.values());
  }, [player.inventory]);

  // Apply query filter
  const filtered = grouped.filter(it => {
    if (!query) return true;
    const q = query.toLowerCase();
    return String(it.name || it.id || '').toLowerCase().includes(q) || String(it.description || '').toLowerCase().includes(q) || String(it.id || '').toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <Card title="🎒 Inventory">
      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input placeholder="Search items..." value={query} onChange={e => { setQuery(e.target.value); setPage(0); }} style={{ padding: '6px 8px', flex: 1 }} />
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{filtered.length} items</div>
        </div>

        {pageItems.length === 0 ? (
          <div style={{ color: 'var(--muted)' }}>No items in inventory.</div>
        ) : (
          pageItems.map((it: any, idx: number) => {
            const idKey = String(it.id || it.name || idx);
            const expanded = !!expandedGroups[idKey];
            const isManual = (it && (it.type === 'manual' || it.category === 'manual' || it.meta?.type === 'manual'));

            const tooltipContent = isManual ? (
              <div style={{ display: 'grid', gap: 6, maxWidth: 320 }}>
                <div style={{ fontWeight: 700 }}>{it.name || it.id}</div>
                {it.description ? <div style={{ color: 'var(--muted)', fontSize: 13 }}>{it.description}</div> : null}
                {it.effects && typeof it.effects === 'object' ? (
                  <div style={{ fontSize: 13 }}>
                    <div style={{ fontWeight: 600, marginTop: 6 }}>Effects</div>
                    <div style={{ display: 'grid', gap: 4 }}>
                      {Object.entries(it.effects).map(([k, v]) => (
                        <div key={k} style={{ color: 'var(--muted)', fontSize: 13 }}>{k}: {String(v)}</div>
                      ))}
                    </div>
                  </div>
                ) : null}
                {it.passiveId ? <div style={{ fontSize: 13, color: 'var(--muted)' }}>Passive: {it.passiveId}</div> : null}
              </div>
            ) : null;

            const row = (
              <div key={idKey} style={{ display: 'grid', gap: 6 }}>
                <div
                  className="inventory-row"
                  role="button"
                  aria-expanded={expanded}
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setExpandedGroups(s => ({ ...s, [idKey]: !s[idKey] })); }}
                  onClick={() => setExpandedGroups(s => ({ ...s, [idKey]: !s[idKey] }))}
                  style={{ display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: 8, alignItems: 'center', padding: 6, borderRadius: 6 }}
                >
                <div style={{ fontSize: 22 }}>{pickIconForItem(it)}</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{it.name || it.id}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Qty: {it.quantity || 1} • Stacks: {it.count || 1}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {/* actions below */}
                  <Button onClick={() => { try { const gs = storeHook.getState(); storeHook.setState({ ui: { ...gs.ui, _inInventoryInteraction: true } }); const idx = normalizedInventory.findIndex((x:any) => (x.id||x.name)=== (it.id||it.name)); useItem(idx); } finally { const gs2 = storeHook.getState(); storeHook.setState({ ui: { ...gs2.ui, _inInventoryInteraction: false } }); } }} size="small"><SmallChip>Use</SmallChip></Button>
                  <Button onClick={() => { (async () => { try { const gs = storeHook.getState(); storeHook.setState({ ui: { ...gs.ui, _inInventoryInteraction: true } }); await equipFromInventory(it); } finally { const gs2 = storeHook.getState(); storeHook.setState({ ui: { ...gs2.ui, _inInventoryInteraction: false } }); } })(); }} size="small"><SmallChip>Equip</SmallChip></Button>
                  <Button variant="secondary" onClick={() => { setSelectedItem(it); }} size="small"><SmallChip>Details</SmallChip></Button>
                </div>
                </div>
                {expanded && (
                  <div style={{ paddingLeft: 46, display: 'grid', gap: 6 }}>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>Individual stacks (most recent first):</div>
                    {normalizedInventory.filter((x:any) => (x.id||x.name) === (it.id||it.name)).slice().reverse().map((entry:any, i:number) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ fontSize: 13 }}>{entry.name || entry.id} {entry.quantity ? `x${entry.quantity}` : ''}</div>
                        <div style={{ display: 'flex', gap: 6 }}>
                  <Button size="small" onClick={() => { try { const gs = storeHook.getState(); storeHook.setState({ ui: { ...gs.ui, _inInventoryInteraction: true } }); const idx = normalizedInventory.findIndex((x:any) => x === entry); useItem(idx); } finally { const gs2 = storeHook.getState(); storeHook.setState({ ui: { ...gs2.ui, _inInventoryInteraction: false } }); } }}><SmallChip>Use</SmallChip></Button>
                  <Button size="small" variant="secondary" onClick={() => { const idx = normalizedInventory.findIndex((x:any) => x === entry); handleDropByIndex(idx); }}><SmallChip>Drop</SmallChip></Button>
                        </div>
                      </div>
                    ))}
                    {it.rarity ? <div style={{ fontSize: 12, color: 'var(--muted)' }}><TierBadge tier={it.rarity} small={true} /></div> : null}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button size="small" onClick={() => { if (typeof removeFromInventoryById === 'function') removeFromInventoryById(it.id || it.name, it.quantity || 1); else alert('Remove not supported'); }}><SmallChip>Remove All</SmallChip></Button>
                      <Button size="small" variant="secondary" onClick={() => setExpandedGroups(s => ({ ...s, [idKey]: false }))}><SmallChip>Close</SmallChip></Button>
                    </div>
                  </div>
                )}
              </div>
            );

            return isManual ? (
              <RichTooltip content={tooltipContent} key={idKey}>
                {row}
              </RichTooltip>
            ) : row;
          })
        )}

        {/* Pagination */}
        {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            <Button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}><SmallChip>Prev</SmallChip></Button>
            <div style={{ alignSelf: 'center' }}>Page {page + 1} / {totalPages}</div>
            <Button disabled={page >= totalPages - 1} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}><SmallChip>Next</SmallChip></Button>
          </div>
        )}

        {/* Equipped */}
        <div style={{ borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: 8, marginTop: 6 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Equipped</div>
          {player.equipment && Object.keys(player.equipment).length ? (
            Object.entries(player.equipment).map(([slot, obj]) => (
              <div key={slot} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, alignItems: 'center' }}>
                <span style={{ color: 'var(--muted)' }}>{slot}</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span>{(obj as any)?.name || (obj as any)?.id || '—'}</span>
                  {(obj as any) && <Button variant="secondary" size="small" onClick={() => unequipSlot(slot)}>Unequip</Button>}
                </div>
              </div>
            ))
          ) : (
            <div style={{ color: 'var(--muted)' }}>No equipment equipped.</div>
          )}
        </div>

        {/* Item detail modal (simple) */}
        {selectedItem && (
          <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', zIndex: 3000 }} onClick={() => setSelectedItem(null)}>
            <div style={{ background: 'var(--dark)', padding: 16, borderRadius: 8, minWidth: 320, position: 'relative' }} onClick={e => e.stopPropagation()}>
              <h4 style={{ marginTop: 0 }}>{selectedItem.name || selectedItem.id}</h4>
              {selectedItem.meta?.icon || selectedItem.icon ? <div style={{ fontSize: 34 }}>{pickIconForItem(selectedItem)}</div> : null}
              <div style={{ color: 'var(--muted)', margin: '8px 0' }}>{selectedItem.description}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>ID: {selectedItem.id}</div>
              <div style={{ position: 'absolute', right: 8, top: 8 }}>
                <ModalCloseButton onClick={() => setSelectedItem(null)} ariaLabel="Close item details" title="Close" size={16} />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <Button onClick={() => { equipFromInventory(selectedItem); setSelectedItem(null); }}>Equip</Button>
                <Button variant="secondary" onClick={() => setSelectedItem(null)}>Close</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default InventoryPanel;

