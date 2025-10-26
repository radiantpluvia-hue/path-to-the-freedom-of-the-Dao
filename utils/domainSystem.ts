// domainSystem.ts
import { GameState } from './types';

export type Domain = {
  id: string;
  name?: string;
  ownerPlayer?: boolean;
  ownerFaction?: string | null;
  level: number;
  stability: number; // 0-100
  resources: number; // numerical pool for upkeep
  modifiers?: Record<string, any>;
};

export type RealmShard = {
  id: string;
  source?: string;
  effect?: any;
  boundDomainId?: string | null;
};

function ensureWorld(gs: GameState) {
  gs.world = gs.world || ({} as any);
  (gs.world as any).domains = (gs.world as any).domains || [];
  (gs.world as any).realmShards = (gs.world as any).realmShards || [];
  gs.world.flags = gs.world.flags || {};
}

export function createDomain(gs: GameState, opts: Partial<Domain> = {}): Domain {
  ensureWorld(gs);
  const id = `domain_${Date.now()}_${Math.floor(Math.random()*10000)}`;
  const domain: Domain = {
    id,
    name: opts.name || `New Domain ${id}`,
    ownerPlayer: opts.ownerPlayer || true,
    ownerFaction: opts.ownerFaction || null,
    level: opts.level || 1,
    stability: typeof opts.stability === 'number' ? opts.stability : 60,
    resources: typeof opts.resources === 'number' ? opts.resources : 100,
    modifiers: opts.modifiers || {}
  };
  (gs.world as any).domains.push(domain);
  gs.world.flags!['domain_founded'] = true;
  gs.world.flags!['domain_'+id] = true;
  return domain;
}

export function getDomainById(gs: GameState, id: string): Domain | undefined {
  ensureWorld(gs);
  return ((gs.world as any).domains || []).find((d: Domain) => d.id === id);
}

export function adjustDomainStability(gs: GameState, domainId: string, delta: number) {
  const d = getDomainById(gs, domainId);
  if (!d) return;
  d.stability = Math.max(0, Math.min(100, d.stability + delta));
  // set a flag for low stability
  if (d.stability <= 25) gs.world.flags!['domain_'+domainId+'_low_stability'] = true;
}

export function transferDomainOwnership(gs: GameState, domainId: string, newOwnerFaction?: string) {
  const d = getDomainById(gs, domainId);
  if (!d) return false;
  d.ownerFaction = newOwnerFaction || null;
  d.ownerPlayer = !newOwnerFaction;
  return true;
}

export function createRealmShard(gs: GameState, opts: Partial<RealmShard> = {}): RealmShard {
  ensureWorld(gs);
  const id = `realm_shard_${Date.now()}_${Math.floor(Math.random()*10000)}`;
  const shard: RealmShard = {
    id,
    source: typeof opts.source === 'undefined' ? undefined : opts.source,
    effect: typeof opts.effect === 'undefined' ? undefined : opts.effect,
    boundDomainId: typeof opts.boundDomainId === 'undefined' ? undefined : opts.boundDomainId
  };
  (gs.world as any).realmShards.push(shard);
  gs.world.flags![shard.id] = true;
  return shard;
}

export function bindShardToDomain(gs: GameState, shardId: string, domainId: string) {
  ensureWorld(gs);
  const shard = ((gs.world as any).realmShards || []).find((s: RealmShard) => s.id === shardId);
  const domain = getDomainById(gs, domainId);
  if (!shard || !domain) return false;
  shard.boundDomainId = domainId;
  gs.world.flags!['realm_shard_'+shardId+'_bound'] = true;
  // apply a simple buff on domain
  domain.modifiers = domain.modifiers || {};
  domain.modifiers['qi_regen'] = (domain.modifiers['qi_regen'] || 0) + 0.10; // +10% Qi regen
  return true;
}

export function hasRealmShard(gs: GameState): boolean {
  ensureWorld(gs);
  return Array.isArray((gs.world as any).realmShards) && (gs.world as any).realmShards.length > 0;
}

// Simple deterministic capture transaction helpers used by tests when the full runtime
// domain system isn't loaded. These mirror the behavior expected by unit tests.
export function buildCaptureTransaction(gs: any, territoryId: string, threshold = 0.6, funding: string = 'normal', forceParams: any = null) {
  ensureWorld(gs);
  const territories: any = (gs.world as any).territories || {};
  const territory = territories[territoryId];
  if (!territory) return null;
  const influence = territory.influence || {};
  const entries = Object.entries(influence).map(([k, v]) => [k, Number(v || 0)] as [string, number]);
  if (entries.length === 0) return null;
  let total = entries.reduce((s, e) => s + e[1], 0);
  if (total <= 0) total = 1;
  entries.sort((a, b) => b[1] - a[1]);
  let attacker = entries[0][0];
  if (entries.length > 1 && Math.abs(entries[0][1] - entries[1][1]) < 1e-9) {
    if (typeof territory.ownerFactionId === 'string' && territory.ownerFactionId) attacker = territory.ownerFactionId;
  }
  const attackerVal = entries.find(e => e[0] === attacker)![1];
  const share = attackerVal / total;
  const defense = territory.garrison && typeof territory.garrison.troops === 'number' ? territory.garrison.troops : 0;
  const requiredUpkeep = Math.max(0, Math.ceil(defense * 0.1));
  const ledger: any = {
    factionBefore: (gs.world && gs.world.factions && gs.world.factions[attacker] && gs.world.factions[attacker].treasury && typeof gs.world.factions[attacker].treasury.gold === 'number') ? gs.world.factions[attacker].treasury.gold : 0,
    playerBefore: (gs.player && typeof gs.player.yuan === 'number') ? gs.player.yuan : 0,
    garrisonBefore: defense
  };
  return {
    territoryId,
    attackerFactionId: attacker,
    prevOwner: territory.ownerFactionId || null,
    share,
    defense,
    requiredUpkeep,
    funding,
    ledger,
    forceParams
  } as any;
}

export function applyCaptureTransaction(gs: any, tx: any) {
  if (!tx || !tx.territoryId) return { success: false, reason: 'invalid_tx' };
  const territories: any = (gs.world as any).territories || {};
  const territory = territories[tx.territoryId];
  if (!territory) return { success: false, reason: 'territory_missing' };
  const attacker = tx.attackerFactionId || null;
  const required = typeof tx.requiredUpkeep === 'number' ? tx.requiredUpkeep : 0;
  let upkeepPaid = false;
  const prevOwner = territory.ownerFactionId || null;
  const defenseBefore = territory.garrison && typeof territory.garrison.troops === 'number' ? territory.garrison.troops : 0;
  if (tx.funding === 'normal' || !tx.funding) {
    if (attacker && gs.world && gs.world.factions && gs.world.factions[attacker] && gs.world.factions[attacker].treasury) {
      const f = gs.world.factions[attacker];
      const avail = typeof f.treasury.gold === 'number' ? f.treasury.gold : 0;
      const paid = Math.min(avail, required);
      f.treasury.gold = Math.max(0, avail - paid);
  upkeepPaid = paid >= required && required > 0;
    }
  } else if (tx.funding === 'drain_player') {
    if (attacker && gs.world && gs.world.factions && gs.world.factions[attacker] && gs.world.factions[attacker].treasury) {
      const f = gs.world.factions[attacker];
      let paid = Math.min(typeof f.treasury.gold === 'number' ? f.treasury.gold : 0, required);
      f.treasury.gold = Math.max(0, (f.treasury.gold || 0) - paid);
      const remaining = required - paid;
      if (remaining > 0 && gs.player && typeof gs.player.yuan === 'number') {
        const take = Math.min(gs.player.yuan, remaining);
        gs.player.yuan = Math.max(0, gs.player.yuan - take);
      }
    } else if (gs.player && typeof gs.player.yuan === 'number') {
      const take = Math.min(gs.player.yuan, required);
      gs.player.yuan = Math.max(0, gs.player.yuan - take);
  upkeepPaid = take >= required && required > 0;
    }
  } else if (tx.funding === 'force_capture') {
    const mult = (tx.forceParams && typeof tx.forceParams.attritionMultiplier === 'number') ? tx.forceParams.attritionMultiplier : 1.0;
    if (territory.garrison && typeof territory.garrison.troops === 'number') {
      const before = territory.garrison.troops;
      const loss = Math.max(1, Math.floor(before * 0.3 * mult));
      territory.garrison.troops = Math.max(0, before - loss);
    }
    if (gs.player && gs.player.reputation && typeof gs.player.reputation.world === 'number' && tx.forceParams && typeof tx.forceParams.reputationPenalty === 'number') {
      gs.player.reputation.world = Math.max(0, gs.player.reputation.world - tx.forceParams.reputationPenalty);
    }
  }
  // apply general casualties based on share (applies to normal/drain_player cases)
  try {
    const share = typeof tx.share === 'number' ? tx.share : 0;
    const casualties = Math.round(defenseBefore * Math.min(0.9, share || 0));
    if (territory.garrison && typeof territory.garrison.troops === 'number') {
      territory.garrison.troops = Math.max(0, (territory.garrison.troops || 0) - casualties);
    }
  } catch (e) { /* ignore */ }

  territory.ownerFactionId = attacker;
  // snapshot garrisonAfter
  const garrisonAfter = territory.garrison ? JSON.parse(JSON.stringify(territory.garrison)) : null;
  return {
    success: true,
    previousOwner: prevOwner,
    newOwner: attacker,
    share: tx.share,
    requiredUpkeep: required,
    upkeepPaid: !!upkeepPaid,
    garrisonAfter
  };
}

// Compatibility helpers used by older tests
export function applyTerritoryInfluence(gs: any, territoryId: string, factionId: string, amount: number) {
  const territories: any = (gs.world as any).territories || {};
  const territory = territories[territoryId];
  if (!territory) return;
  territory.influence = territory.influence || {};
  const prev = Number(territory.influence[factionId] || 0);
  territory.influence[factionId] = prev + Number(amount || 0);
}

// Adapter for event resolution to maintain backwards compatibility with code that
// expects a Domain.resolveEvent function. This will call the centralized
// eventResolver.resolveEvent which uses the ChoiceHandler registry.
import { resolveEvent as _resolveEvent } from '../eventResolver';

export function resolveEvent(gs: any, eventId: string, choice?: any) {
  try {
    const newState = _resolveEvent(gs as any, eventId as string, choice as any);
    // If a new state object was returned, copy its top-level properties into the
    // provided mutable `gs` so older code that expects mutation continues to work.
    if (newState && newState !== gs) {
      Object.keys(newState as any).forEach(k => { (gs as any)[k] = (newState as any)[k]; });
    }
    return gs;
  } catch (e) {
    return gs;
  }
}

export function decayInfluence(gs: any, territoryId: string, factor = 0.98) {
  const territories: any = (gs.world as any).territories || {};
  const territory = territories[territoryId];
  if (!territory) return;
  territory.influence = territory.influence || {};
  for (const k of Object.keys(territory.influence)) {
    territory.influence[k] = Math.max(0, (Number(territory.influence[k] || 0)) * factor);
  }
}

export function attemptTerritoryCapture(gs: any, territoryId: string, threshold = 0.6, commit = false, funding: string = 'normal', forceParams: any = null) {
  const tx = buildCaptureTransaction(gs, territoryId, threshold, funding, forceParams);
  if (!tx) return null;
  if (commit) {
    const res = applyCaptureTransaction(gs, tx as any);
    return res;
  }
  // Return a non-mutating preview object matching expected shape
  return {
    previousOwner: tx.prevOwner ?? null,
    newOwner: tx.attackerFactionId ?? null,
    share: tx.share,
    requiredUpkeep: tx.requiredUpkeep,
    upkeepPaid: false,
    garrisonAfter: tx.ledger && tx.ledger.garrisonBefore ? { troops: tx.ledger.garrisonBefore } : null
  } as any;
}
