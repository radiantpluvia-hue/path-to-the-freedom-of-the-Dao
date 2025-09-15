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
