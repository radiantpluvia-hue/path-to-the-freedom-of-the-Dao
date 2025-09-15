// tribulationResolver24.ts
import { GameState } from './types';
import { createRealmShard, createDomain } from './domainSystem';
import { runtimeRng } from '../src/utils/seededRng';

function sigmoid(x: number) { return 1 / (1 + Math.exp(-x)); }
function clamp(v: number, a: number, b: number) { return Math.max(a, Math.min(b, v)); }

function seededRandom(seed: number) {
  let x = seed >>> 0 || 1;
  return () => {
    x ^= x << 13; x = x >>> 0;
    x ^= x >>> 17; x = x >>> 0;
    x ^= x << 5; x = x >>> 0;
    return (x >>> 0) / 4294967296;
  };
}

export function computePlayerPower24(player: any) {
  const levelPart = (player.level || 0) * 160; // heavier weight
  const qiPart = clamp((player.qi || 0) / 4, 0, 3000);
  const daoPart = (player.daoHeart || 0) * 8;
  const compPart = (player.comprehension || 0) * 20;
  const domainBonus = (player.councilSeats || 0) * 80;
  return levelPart + qiPart + daoPart + compPart + domainBonus;
}

export type Trib24Result = {
  success: boolean;
  chance: number;
  roll: number;
  log: string[];
  effects: {
    hpDelta: number;
    qiDelta: number;
    daoHeartDelta: number;
    domainLost?: string | null;
    heirLost?: boolean;
    rewards: string[];
    flagsSet: string[];
  };
};

export function resolveTribulation24(gs: GameState, opts?: { seed?: number | null }) : Trib24Result {
  const log: string[] = [];
  const player = gs.player;
  const rng = (opts && typeof opts.seed === 'number') ? seededRandom(opts.seed) : runtimeRng;
  const P = computePlayerPower24(player);
  const D = 1.6; // harder baseline

  // modifiers
  const m_council = (player.councilSeats || 0) * 0.03 + ((player as any).councilSupport || 0) * 0.015;
  const hasArtifact = gs.world.flags && (gs.world.flags['artifact_ascendant'] || (player.inventory || []).some(item => item.name === 'enchanted_artifact'));
  const m_artifact = hasArtifact ? 0.20 : 0;
  const pillarBonus = (player.bloodline && (player.bloodline as any).pillarState === 'pillar') ? 0.12 : 0;
  const legendaryChanceBoost = (player.bloodline && (player.bloodline as any).pillarState === 'legendary') ? 0.30 : 0;
  const m_boost = gs.world.flags && gs.world.flags['tribulation24_boost'] ? 0.14 : 0;
  const m_mentor = clamp(((player.relationships && player.relationships.mentor) || 0) / 180, 0, 0.14);
  const domainPresence = ((gs.world as any).domains && (gs.world as any).domains.some((d:any)=>d.ownerPlayer)) ? 0.08 : 0;
  const M = m_council + m_artifact + pillarBonus + m_boost + m_mentor + domainPresence;

  const baseFactor = sigmoid((P / (D * 3000)) - 0.5);
  const successChance = clamp(baseFactor + M, 0.02, 0.92);

  log.push(`P=${Math.round(P)}, base=${baseFactor.toFixed(3)}, M=${M.toFixed(3)}, chance=${(successChance*100).toFixed(1)}%`);
  const roll = rng();
  const success = roll < successChance;
  log.push(`roll=${(roll*100).toFixed(2)} -> ${success ? 'SUCCESS' : 'FAILURE'}`);

  const effects = { hpDelta: 0, qiDelta: 0, daoHeartDelta: 0, domainLost: null as string|null, heirLost: false, rewards: [] as string[], flagsSet: [] as string[] };

  if (success) {
    // cost
    const hpLoss = Math.round((0.12 + (1 - successChance) * 0.25) * (player.maxHp || 1));
    effects.hpDelta = -hpLoss;
    effects.qiDelta = -Math.min(player.qi || 0, 400);
    effects.daoHeartDelta = 0;
    gs.world.flags = gs.world.flags || {};
    gs.world.flags['tribulation24_success'] = true;
    effects.flagsSet.push('tribulation24_success');

    // rewards: chance to awaken to legendary if pillar present, create realm-shard, skill node
    effects.rewards.push('unlock_legend_skill_node');
  if (player.bloodline && (player.bloodline as any).pillarState === 'pillar' && rng() < 0.35 + legendaryChanceBoost) {
      (player.bloodline as any).pillarState = 'legendary';
      effects.rewards.push('bloodline_legendary_activated');
      gs.world.flags['bloodline_legendary_'+((player.bloodline as any).id||'x')] = true;
    }

    // small domain buff if player owns domain(s)
  const playerDomain = ((gs.world as any).domains||[]).find((d:any)=>d.ownerPlayer);
    if (playerDomain) {
      playerDomain.modifiers = playerDomain.modifiers || {};
      playerDomain.modifiers['legendary_protection'] = true;
      effects.rewards.push('domain_legendary_protection');
    } else {
      // create a small realm-shard as legacy
      const shard = createRealmShard(gs, { source: 'tribulation24_reward', effect: { qi_boost: 0.12 } });
      effects.rewards.push('realm_shard_created_'+shard.id);
      effects.flagsSet.push(shard.id);
    }

    log.push(`Success effects: hp -${hpLoss}, qi spent, rewards: ${effects.rewards.join(',')}`);
  } else {
    // failure is devastating
  const hpLoss = Math.round((0.45 + rng()*0.25) * (player.maxHp || 1)); // 45%-70%
    effects.hpDelta = -hpLoss;
    effects.qiDelta = -(player.qi || 0);
    effects.daoHeartDelta = -24;
    gs.world.flags = gs.world.flags || {};
    gs.world.flags['tribulation24_failed'] = true;
    effects.flagsSet.push('tribulation24_failed');

    // domain loss chance if player owns domain(s)
  const playerDomains = ((gs.world as any).domains || []).filter((d:any)=>d.ownerPlayer);
    if (playerDomains.length) {
      const pick = playerDomains[Math.floor(rng()*playerDomains.length)];
      // 55% chance to lose a domain on failure
      if (rng() < 0.55) {
        effects.domainLost = pick.id;
        // wipes ownerPlayer => ownerFaction null
        pick.ownerPlayer = false;
        pick.ownerFaction = null;
        gs.world.flags!['domain_lost_'+pick.id] = true;
      }
    }

    // heir loss: 30% chance to lose named heir on severe failure
    if (gs.world.flags && gs.world.flags['heir_named'] && rng() < 0.30) {
      effects.heirLost = true;
      gs.world.flags['heir_removed'] = true;
      // domain of heir handling is left to integration logic
    }

    // political & standing penalties
    player.factionStanding = player.factionStanding || {};
    player.factionStanding.sect = Math.max(0, (player.factionStanding.sect||0) - 50);
    log.push(`Failure effects: hp -${hpLoss}, daoHeart -24, domainLost=${effects.domainLost}, heirLost=${effects.heirLost}`);
  }

  // apply deltas
  player.hp = Math.max(0, (player.hp || 0) + effects.hpDelta);
  player.qi = Math.max(0, (player.qi || 0) + effects.qiDelta);
  player.daoHeart = Math.max(0, (player.daoHeart || 0) + effects.daoHeartDelta);

  return { success, chance: successChance, roll, log, effects };
}
