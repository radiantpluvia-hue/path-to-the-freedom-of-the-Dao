import React from 'react';
import RichTooltip from '@/components/ui/RichTooltip';
import TierBadge from '@/components/ui/TierBadge';
import { useGameStore } from '@/store/useGameStore';
import eras from '../../../data/eras/default_eras.json';
import { migrateTier, revertTier } from '@/migrations/tierMigration';

export default function ReincarnationModal() {
  const { ui, world, player, setUIProperty, reincarnateSameEra, reincarnateNextEra, reincarnateRandomFuture } = useGameStore() as any;
  if (!(ui as any).showReincarnationModal) return null;
  const currentIndex = (world as any).currentEraIndex ?? 0;
  const available = (eras as any[]).filter(e => e.index >= currentIndex);
  const cur = available.find(e => e.index === currentIndex) || available[0];
  const next = available.find(e => e.index > currentIndex);
  const randomFuturePool = available.filter(e => e.index > currentIndex);

  // Carryover preview based on metaUnlocks and inventory
  const prevUnlocks = (player?.metaUnlocks) || {};
  const carryCount = Number((prevUnlocks.carryArtifactCount != null ? prevUnlocks.carryArtifactCount : (prevUnlocks.carryArtifact ? 1 : 0)) || 0);
  const inv = Array.isArray(player?.inventory) ? player.inventory : [];
  // Map canonical tier letters to priority (higher = rarer)
  const TIER_ORDER: Record<string, number> = { H: 1, G: 2, F: 3, E: 4, D: 5, B: 6 };

  const candidates = inv.filter((it: any) => {
    const t = String(it.type || '').toLowerCase();
    const rawR = it.rarity;
    const tier = migrateTier(rawR);
    // consider high-tier items or explicit artifacts or soulbound uniques
    const isHighTier = tier && (tier === 'D' || tier === 'B' || tier === 'E' || revertTier(tier) === 'legendary' || revertTier(tier) === 'transcendent');
    return t === 'artifact' || isHighTier || it.uniqueProperties?.soulbound === true;
  }).sort((a: any, b: any) => {
    const ta = migrateTier(a?.rarity || 'H');
    const tb = migrateTier(b?.rarity || 'H');
    return (TIER_ORDER[tb] || 0) - (TIER_ORDER[ta] || 0);
  });
  const previewCarry = carryCount > 0 ? candidates.slice(0, carryCount) : [];

  const top3Mods = (e: any) => {
    const m = e.modifiers || {};
    return [ ['qiDensity', m.qiDensity], ['artifactDensity', m.artifactDensity], ['sectCorruptionRate', m.sectCorruptionRate] ]
      .filter((x) => x[1] != null)
      .slice(0,3)
      .map(([k,v]) => `${k}: ${v}`)
      .join(', ');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#111', color: '#fff', border: '1px solid #444', borderRadius: 8, padding: 16, width: 560 }}>
        <h2>Reincarnate</h2>
        <p>Advancing the Era will move the world forward in time — past eras will remain unreachable. Proceed?</p>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <button type="button" onClick={() => { reincarnateSameEra(); setUIProperty('showReincarnationModal', false); }}>Same Era</button>
          <button type="button" disabled={!next} aria-label={!next ? 'No later era defined; stays at current' : undefined} onClick={() => { reincarnateNextEra(); setUIProperty('showReincarnationModal', false); }}>Next Era</button>
          <RichTooltip content={'Choose a later era at random. This will skip forward in history — you cannot go back.'}>
            <button type="button" disabled={randomFuturePool.length === 0} onClick={() => { reincarnateRandomFuture(); setUIProperty('showReincarnationModal', false); }}>Random Future Era</button>
          </RichTooltip>
          <div style={{ marginLeft: 'auto' }}>
            <button type="button" onClick={() => setUIProperty('showReincarnationModal', false)}>Cancel</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ border: '1px solid #333', padding: 8 }}>
            <strong>Current Era</strong>
            <div>{cur?.name} (#{cur?.index})</div>
            <div>Top modifiers: {cur ? top3Mods(cur) : '—'}</div>
            <div>Artifact density: {cur?.modifiers?.artifactDensity}</div>
            <div>Factions: {(cur?.startingFactions || []).slice(0,3).map((f:any)=>f.id).join(', ')}</div>
            <div style={{ opacity: 0.8 }}>{cur?.description?.slice(0,140)}...</div>
          </div>
          <div style={{ border: '1px solid #333', padding: 8 }}>
            <strong>Next Era</strong>
            {next ? (
              <>
                <div>{next.name} (#{next.index})</div>
                <div>Top modifiers: {top3Mods(next)}</div>
                <div>Artifact density: {next.modifiers?.artifactDensity}</div>
                <div>Factions: {(next.startingFactions || []).slice(0,3).map((f:any)=>f.id).join(', ')}</div>
                <div style={{ opacity: 0.8 }}>{next.description?.slice(0,140)}...</div>
              </>
            ) : <div>No later era defined.</div>}
          </div>
          <div style={{ gridColumn: '1 / span 2', border: '1px solid #333', padding: 8 }}>
            <strong>Carryover Preview</strong>
            <div style={{ color: '#aaa', marginTop: 4 }}>Unlocked slots: {carryCount}. {carryCount === 0 ? 'Earn meta-unlocks to carry artifacts forward.' : ''}</div>
            {previewCarry.length ? (
              <ul style={{ margin: '6px 0 0 16px' }}>
                {previewCarry.map((it: any, i: number) => (
                  <li key={i}>{it.name || it.id || it.itemId} {it.rarity ? <span style={{ marginLeft: 6 }}><TierBadge tier={it.rarity} small={true} /></span> : ''}</li>
                ))}
              </ul>
            ) : (
              <div style={{ color: '#888', marginTop: 4 }}>No qualifying items to carry.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
