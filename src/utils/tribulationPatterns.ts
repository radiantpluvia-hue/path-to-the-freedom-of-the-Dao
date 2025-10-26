// Pattern-based tribulation resolver
import patternsJson from '@/data/tribulationPatterns.json';
import { clamp } from './numberUtils';
import { getRng } from './rng';

// Normalize patterns JSON into an array of patterns with resolved curses and waves
function buildPatternList() {
  const raw: any = (patternsJson as any).patterns || {};
  const cursesMap: any = (patternsJson as any).curses || {};
  const entries = Array.isArray(raw) ? raw : Object.entries(raw || {});
  return entries.map(([k, v]: any, idx: number) => {
    const p: any = typeof v === 'object' ? { ...v } : {};
  // Avoid calling RNG at module init: if key is missing, derive a stable id from index
  p.id = typeof k === 'string' ? k : (p.id || `trib_${idx}`);
    // ensure realmMinDifficulty exists
    p.realmMinDifficulty = p.realmMinDifficulty ?? 0;
    // normalize waves: support legacy fields (damage -> intensity)
    p.waves = (p.waves || []).map((w: any) => ({
      element: w.type || w.element || 'generic',
      intensity: w.intensity ?? (w.damage ? (w.damage / 100) : 1),
      count: w.count ?? 1,
      damage: w.damage ?? 0
    }));
    // resolve curses: if pattern lists curse ids, map to curse objects from cursesMap
    p.curses = (p.curses || []).map((cId: any) => {
      if (typeof cId === 'string' && cursesMap[cId]) return { id: cId, ...(cursesMap[cId] as any) };
      if (typeof cId === 'object') return cId;
      return { id: String(cId) };
    });
    return p;
  });
}

const NORMALIZED_PATTERNS = buildPatternList();

export type TribulationWave = { element: string; intensity: number; count: number };
export type TribulationCurse = { id: string; name: string; chancePenalty?: number; hpMultiplier?: number; daoHeartPenalty?: number };
export type TribulationPattern = {
  id: string;
  name: string;
  realmMinDifficulty: number;
  waves: TribulationWave[];
  curses: TribulationCurse[];
};

export type TribulationResolution = {
  success: boolean;
  chance: number;
  roll: number;
  log: string[];
  damageTaken: number;
  daoHeartDelta: number;
  appliedPatternId: string;
  appliedCurses: string[];
};

export function pickPattern(realmDifficulty: number, seed?: number): TribulationPattern {
  const ps = NORMALIZED_PATTERNS as TribulationPattern[];
  const candidates = ps.filter(p => realmDifficulty >= (p.realmMinDifficulty ?? 0));
  const list = candidates.length ? candidates : ps; // fallback
  const idx = seededIndex(list.length, seed);
  return list[idx];
}

function seededIndex(n: number, seed?: number) {
  if (typeof seed !== 'number') return Math.floor(getRng()() * n);
  // xorshift32
  let x = seed >>> 0 || 1;
  x ^= x << 13; x >>>= 0; x ^= x >>> 17; x >>>= 0; x ^= x << 5; x >>>= 0;
  return (x >>> 0) % n;
}

export function resolvePatternTribulation(args: {
  realmDifficulty: number; // e.g., CULTIVATION_REALMS[realm].breakthroughDifficulty
  playerPower: number;     // composed power index
  playerMaxHp: number;
  playerDaoHeart: number;
  insightPoints?: number;
  seed?: number;
}): TribulationResolution {
  const { realmDifficulty, playerPower, playerMaxHp, playerDaoHeart, insightPoints = 0, seed } = args;
  const log: string[] = [];
  const pattern = pickPattern(realmDifficulty, seed);
  log.push(`pattern=${pattern.id}`);

  // Base chance from power vs difficulty
  const base = sigmoid((playerPower / Math.max(200, realmDifficulty * 60)) - 0.4);

  // Wave pressure reduces chance slightly based on intensity and counts
  const wavePressure = pattern.waves.reduce((acc, w) => acc + w.intensity * w.count, 0) * 0.02; // 2% per weighted unit

  // Curses apply discrete penalties
  const cursePenalty = (pattern.curses || []).reduce((acc, c) => acc + (c.chancePenalty || 0), 0);

  // Dao Heart buffers mental pressure
  const daoMitigation = clamp((playerDaoHeart || 0) * 0.003, 0, 0.2);

  // Insight points provide small safety net
  const insightBonus = clamp(insightPoints * 0.002, 0, 0.1);

  const chance = clamp(base - wavePressure - cursePenalty + daoMitigation + insightBonus, 0.03, 0.95);

  const roll = seededRand01(seed);
  const success = roll < chance;
  log.push(`base=${base.toFixed(3)} wavePen=${wavePressure.toFixed(3)} cursePen=${cursePenalty.toFixed(3)} daoMit=${daoMitigation.toFixed(3)} insight=${insightBonus.toFixed(3)} chance=${(chance*100).toFixed(1)}% roll=${(roll*100).toFixed(2)}`);

  // Damage scaling from waves and curses
  const hpMultiplier = (pattern.curses || []).reduce((m, c) => m * (c.hpMultiplier || 1), 1);
  const waveDamage = pattern.waves.reduce((acc, w) => acc + (w.intensity * w.count), 0) * 0.06; // 6% per unit
  const maxHp = Math.max(1, playerMaxHp);
  const damageFrac = clamp((success ? 0.15 : 0.5) + waveDamage, 0, 0.95);
  const damageTaken = Math.round(maxHp * damageFrac * hpMultiplier);

  // Dao heart shock on failure and karmic patterns
  const daoHeartShock = (pattern.curses || []).reduce((acc, c) => acc + (c.daoHeartPenalty || 0), 0) + (success ? 0 : Math.ceil(realmDifficulty * 0.25));

  return {
    success,
    chance,
    roll,
    log,
    damageTaken,
    daoHeartDelta: -daoHeartShock,
    appliedPatternId: pattern.id,
    appliedCurses: (pattern.curses || []).map(c => c.id)
  };
}

function sigmoid(x: number){ return 1/(1+Math.exp(-x)); }
function seededRand01(seed?: number){
  if (typeof seed !== 'number') return getRng()();
  let x = seed >>> 0 || 1; x ^= x << 13; x >>>= 0; x ^= x >>> 17; x >>>= 0; x ^= x << 5; x >>>= 0; return (x >>> 0) / 4294967296;
}