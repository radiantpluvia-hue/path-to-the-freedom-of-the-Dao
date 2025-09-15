// meetsPrereqs.ts
// Utility for event prerequisites (Act 5+)
import { InventoryItem, Manual } from './types';
export type GameState = {
  player: {
    realm?: number;
    level?: number;
    hp?: number;
    maxHp?: number;
    qi?: number;
    daoHeart?: number;
    inventory?: InventoryItem[];
    manuals?: Manual[];
    relationships?: { [k: string]: number };
    factionStanding?: { [k: string]: number };
    councilSeats?: number;
    councilSupport?: number;
    shadowStanding?: number;
    sectRank?: string;
    bloodline?: { seed?: boolean; latentLevel?: number; active?: boolean; id?: string };
    player_faction_formed?: boolean;
  };
  world: {
    flags?: { [k: string]: any };
  };
};

type PrereqObject = { [k: string]: any };

const SECT_RANK_ORDER: Record<string, number> = {
  'outer': 1,
  'inner': 2,
  'elder': 3
};

export function meetsPrereqs(gs: GameState, prereq: PrereqObject | null | undefined): { ok: boolean; reasons?: string[] } {
  const reasons: string[] = [];
  if (!prereq || Object.keys(prereq).length === 0) return { ok: true, reasons };
  const p = prereq;

  function check(obj: PrereqObject): boolean {
    if (obj.or && Array.isArray(obj.or)) {
      for (const child of obj.or) if (check(child)) return true;
      reasons.push('Failed OR group');
      return false;
    }
    if (obj.and && Array.isArray(obj.and)) {
      for (const child of obj.and) if (!check(child)) return false;
      return true;
    }
    if (typeof obj.minRealm === 'number') {
      // Prefer numeric realmId when present; fall back to legacy realm property
  // Use a safe cast to allow legacy GameState shapes that may not declare realmId in the local type
  const haveRealm = Number((gs.player as any).realmId ?? gs.player.realm ?? 0) || 0;
      if (haveRealm < obj.minRealm) { reasons.push(`minRealm ${obj.minRealm}`); return false; }
    }
    if (typeof obj.playerLevelMin === 'number') {
      if ((gs.player.level || 0) < obj.playerLevelMin) { reasons.push(`playerLevelMin ${obj.playerLevelMin}`); return false; }
    }
    if (typeof obj.playerDaoHeartMin === 'number') {
      if ((gs.player.daoHeart || 0) < obj.playerDaoHeartMin) { reasons.push(`playerDaoHeartMin ${obj.playerDaoHeartMin}`); return false; }
    }
    if (typeof obj.playerLevelMax === 'number') {
      if ((gs.player.level || 0) > obj.playerLevelMax) { reasons.push(`playerLevelMax ${obj.playerLevelMax}`); return false; }
    }
    if (obj.playerFactionFormed === true) {
      if (!gs.player['player_faction_formed']) { reasons.push('playerFactionFormed'); return false; }
    }
    if (obj.playerBloodlineSeed === true) {
      if (!(gs.player.bloodline && gs.player.bloodline.seed)) { reasons.push('playerBloodlineSeed'); return false; }
    }
    if (obj.inventoryContains) {
      const want = Array.isArray(obj.inventoryContains) ? obj.inventoryContains : [obj.inventoryContains];
      const has = (gs.player.inventory || []);
  const ok = want.every((w: string) => has.some(item => item.id === w));
      if (!ok) { reasons.push(`missing inventory ${want.join(',')}`); return false; }
    }
    if (obj.manualsRequired) {
      const want = obj.manualsRequired;
      const has = (gs.player.manuals || []);
  for (const m of want) if (!has.some(manual => manual.id === m)) { reasons.push(`missing manual ${m}`); return false; }
    }
    if (obj.flagRequired) {
      const want = Array.isArray(obj.flagRequired) ? obj.flagRequired : [obj.flagRequired];
      for (const f of want) if (!gs.world.flags || !gs.world.flags[f]) { reasons.push(`flagRequired ${f}`); return false; }
    }
    if (obj.flagAny) {
      const want = Array.isArray(obj.flagAny) ? obj.flagAny : [obj.flagAny];
      const ok = want.some((f: string) => gs.world.flags && gs.world.flags[f]);
      if (!ok) { reasons.push(`flagAny ${want.join(',')}`); return false; }
    }
    if (obj.relationshipMin) {
      for (const k of Object.keys(obj.relationshipMin)) {
        const need = obj.relationshipMin[k];
        if ((gs.player.relationships?.[k] || 0) < need) { reasons.push(`relationshipMin ${k} >= ${need}`); return false; }
      }
    }
    if (obj.relationshipMax) {
      for (const k of Object.keys(obj.relationshipMax)) {
        const limit = obj.relationshipMax[k];
        if ((gs.player.relationships?.[k] || 0) > limit) { reasons.push(`relationshipMax ${k} <= ${limit}`); return false; }
      }
    }
    if (obj.sectRankMin) {
      const haveRank = gs.player.sectRank || 'outer';
      const reqRank = obj.sectRankMin;
      const haveV = SECT_RANK_ORDER[haveRank] || 0;
      const reqV = SECT_RANK_ORDER[reqRank] || 0;
      if (haveV < reqV) { reasons.push(`sectRankMin ${reqRank}`); return false; }
    }
    if (typeof obj.councilSeatsMin === 'number') {
      if ((gs.player.councilSeats || 0) < obj.councilSeatsMin) { reasons.push(`councilSeatsMin ${obj.councilSeatsMin}`); return false; }
    }
    if (typeof obj.shadowStandingMin === 'number') {
      if ((gs.player.shadowStanding || 0) < obj.shadowStandingMin) { reasons.push(`shadowStandingMin ${obj.shadowStandingMin}`); return false; }
    }
    if (obj.hpLessThanMax === true) {
      if (!((gs.player.hp || 0) < (gs.player.maxHp || 0))) { reasons.push('hpLessThanMax'); return false; }
    }
    if (typeof obj.factionStandingMin === 'object') {
      for (const f of Object.keys(obj.factionStandingMin)) {
        const need = obj.factionStandingMin[f];
        if (((gs.player.factionStanding?.[f]) || 0) < need) { reasons.push(`factionStandingMin ${f} >= ${need}`); return false; }
      }
    }
    return true;
  }
  const ok = check(p);
  return { ok, reasons: ok ? [] : reasons };
}
