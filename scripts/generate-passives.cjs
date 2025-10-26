#!/usr/bin/env node
// Build-time passives generator. Runs under node (CJS) and writes a JSON file.
const fs = require('fs');
const path = require('path');

// Resolve the repo root and target output
const repoRoot = path.resolve(__dirname, '..');
const outPath = path.join(repoRoot, 'src', 'data', 'generated', 'passives.generated.json');

// Load catalogs (require the JS/CJS builds when available; fall back to TS via ts-node isn't necessary because
// the data modules are plain JS-friendly. We import relative TS/JS sources using require pathing that matches the
// untranspiled source tree — those files export plain objects and are consumable under Node for this script.
// Prefer the compiled CJS variants in .tmp_build if present (these are created by the build step)
function tryRequireBuild(relative) {
  const buildPath = path.join(repoRoot, '.tmp_build', 'src', relative + '.cjs');
  if (fs.existsSync(buildPath)) return require(buildPath);
  const srcPath = path.join(repoRoot, 'src', relative + '.js');
  if (fs.existsSync(srcPath)) return require(srcPath);
  // fallback to TypeScript source (may throw if ts not transpiled)
  return require(path.join(repoRoot, 'src', relative));
}

const ALL_BLOODLINES = tryRequireBuild('data/bloodlines_fixed').ALL_BLOODLINES || tryRequireBuild('data/bloodlines').ALL_BLOODLINES;
const ALL_MANUALS = tryRequireBuild('data/manuals').ALL_MANUALS || tryRequireBuild('data/manuals_updated').ALL_MANUALS;
const WEAPONS = tryRequireBuild('data/weapons').WEAPONS;
const GENERATED_ACTIVE_ABILITIES = tryRequireBuild('data/generated/activeAbilities.generated').default || tryRequireBuild('data/generated/activeAbilities.generated');
const GENERATED_ACCESSORIES = tryRequireBuild('data/generated/accessories.generated').default || tryRequireBuild('data/generated/accessories.generated');
const PHYSIQUES = (() => {
  try { return tryRequireBuild('data/physiques').PHYSIQUES || tryRequireBuild('data/physiques').default || []; } catch (e) { return []; }
})();
// Prefer the project's rarity multiplier function if available
let getRarityMultiplier = null;
try {
  const scaling = tryRequireBuild('data/scalingSystem');
  getRarityMultiplier = scaling.getRarityMultiplier || scaling.default && scaling.default.getRarityMultiplier;
} catch (e) {
  getRarityMultiplier = null;
}

function generate() {
  const out = [];
  let idx = 1;
  const makeId = (i) => `gen_passive_${String(i).padStart(3, '0')}`;

  function rarityScore(item) {
    const raw = ((item && (item.rarity || item.rank || item.tier)) || '') .toString();
    const norm = raw.trim().toLowerCase();
    // If project's getRarityMultiplier exists, use it to derive a multiplier
    if (getRarityMultiplier) {
      const mul = getRarityMultiplier(norm);
      // Map generic rarity to Xianxia realm terminology
      const rarityToRealm = {
        common: 'mortal',
        uncommon: 'qi_refinement',
        rare: 'foundation_establishment',
        epic: 'core_formation',
        legendary: 'golden_immortal',
        mythical: 'daluo_golden_immortal',
        transcendent: 'chaos_saint'
      };
      const derived = (mul >= 6 ? 'transcendent' : mul >= 4.5 ? 'mythical' : mul >= 3 ? 'legendary' : mul >= 2 ? 'epic' : mul >= 1.6 ? 'rare' : norm || 'common');
      const realmLabel = rarityToRealm[norm] || rarityToRealm[derived] || 'mortal';
      return { key: norm || 'common', mul: mul || 1, tier: realmLabel };
    }
    // Fallback: simple mapping but still prefer the item's literal label
    if (norm) {
      const rarityToRealm = {
        legendary: 'golden_immortal',
        unique: 'golden_immortal',
        transcendent: 'chaos_saint',
        mythic: 'daluo_golden_immortal',
        mythical: 'daluo_golden_immortal',
        epic: 'core_formation',
        rare: 'foundation_establishment',
        uncommon: 'qi_refinement',
        common: 'mortal'
      };
      if (/legendary|unique|transcendent|mythic|mythical/i.test(norm)) return { key: norm, mul: 5, tier: rarityToRealm[norm] || 'golden_immortal' };
      if (/epic/i.test(norm)) return { key: norm, mul: 4, tier: rarityToRealm[norm] || 'core_formation' };
      if (/rare/i.test(norm)) return { key: norm, mul: 3, tier: rarityToRealm[norm] || 'foundation_establishment' };
      if (/uncommon/i.test(norm)) return { key: norm, mul: 1.3, tier: rarityToRealm[norm] || 'qi_refinement' };
      return { key: norm, mul: 1, tier: rarityToRealm[norm] || 'mortal' };
    }
    return { key: 'common', mul: 1, tier: 'Common' };
  }

  const rareBloodlines = ALL_BLOODLINES.filter(b => /rare|epic|legendary|celestial/i.test((b.rarity||b.rank||'').toString()));
  const otherBloodlines = ALL_BLOODLINES.filter(b => !rareBloodlines.includes(b));
  for (const b of rareBloodlines.concat(otherBloodlines)) {
    if (idx > 400) break;
    const id = makeId(idx++);
    const sourceTier = (b.rarity || 'common').toString();
    const stats = (b.effects && b.effects.stats) || {};
    const r = rarityScore(b);
    out.push({
      id,
      name: `${b.name} Lineage Echo`,
      origin: { type: 'bloodline', id: b.id },
      tier: r.tier || (sourceTier[0]?.toUpperCase() || 'C'),
      description: `A residual passive born of the ${b.name} bloodline. [src:b:${b.id}]`,
      tags: ['bloodline', ...((b.effects && b.effects.special) || [])],
      stats: {
        atk: Math.max(0, Math.floor((stats.atk || 0) / 5 * r.mul)) || undefined,
        def: Math.max(0, Math.floor((stats.def || 0) / 5 * r.mul)) || undefined,
        hp: Math.max(0, Math.floor((stats.qi || 0) / 8 * r.mul)) || undefined
      }
    });
  }

  const rareManuals = ALL_MANUALS.filter(m => /rare|epic|legendary|celestial/i.test((m.rank||m.rarity||'').toString()));
  const otherManuals = ALL_MANUALS.filter(m => !rareManuals.includes(m));
  for (const m of rareManuals.concat(otherManuals)) {
    if (idx > 400) break;
    const id = makeId(idx++);
    const rank = (m.rank || m.rarity || 'common').toString();
    const effects = m.effects || {};
    const r = rarityScore(m);
    out.push({
      id,
      name: `${m.name} Residue`,
      origin: { type: 'manual', id: m.id },
      tier: r.tier || (rank[0]?.toUpperCase() || 'C'),
      description: `Lingering benefit from studying ${m.name}. [src:manual:${m.id}]`,
      tags: ['manual', ...(effects.special || [])],
      stats: {
        atk: Math.max(0, Math.floor((effects.atk || effects.martialMastery || 0) / 6 * r.mul)) || undefined,
        def: Math.max(0, Math.floor((effects.hp || 0) / 20 * r.mul)) || undefined,
        hp: Math.max(0, Math.floor((effects.hp || 0) / 10 * r.mul)) || undefined,
        atkPct: (effects.martialMastery ? Math.min(6 * r.mul, Math.round((effects.martialMastery || 0) / 2)) : undefined)
      }
    });
  }

  const rareAbilities = GENERATED_ACTIVE_ABILITIES.filter(a => /rare|epic|legendary|celestial/i.test((a.rarity||a.tier||'').toString()));
  const otherAbilities = GENERATED_ACTIVE_ABILITIES.filter(a => !rareAbilities.includes(a));
  for (const a of rareAbilities.concat(otherAbilities)) {
    if (idx > 1200) break;
    const id = makeId(idx++);
    const mainEffect = (a.effects && a.effects[0] && a.effects[0].type) || 'misc';
    const r = rarityScore(a);
    out.push({
      id,
      name: `${a.name} Technique Echo`,
      origin: { type: 'ability', id: a.id },
      tier: r.tier || (a.type === 'support' ? 'B' : a.type === 'defense' ? 'B' : 'C'),
      description: `A passive echo of the ${a.name} technique. [src:ability:${a.id}]`,
      tags: ['technique', mainEffect],
      stats: {
        atk: a.effects && a.effects.some(e => e.type === 'damage') ? Math.max(1, Math.floor((a.effects[0].value || 5) / 6 * r.mul)) : undefined,
        def: a.effects && a.effects.some(e => e.type === 'shield' || e.type === 'debuff') ? Math.max(1, Math.floor(1 * r.mul)) : undefined
      }
    });
  }

  const rareAcc = GENERATED_ACCESSORIES.filter(a => /rare|epic|legendary|celestial/i.test((a.tier||a.rarity||'').toString()));
  const otherAcc = GENERATED_ACCESSORIES.filter(a => !rareAcc.includes(a));
  for (const acc of rareAcc.concat(otherAcc)) {
    if (idx > 1200) break;
    const id = makeId(idx++);
    const r = rarityScore(acc);
    out.push({
      id,
      name: `${acc.name} Charm`,
      origin: { type: 'accessory', id: acc.id },
      tier: r.tier || acc.tier || 'C',
      description: (acc.description || `${acc.name} carries a subtle aura.`) + ` [src:accessory:${acc.id}]`,
      tags: ['accessory', ...(acc.passives || [])],
      stats: {
        atk: (acc.stats && Math.floor((acc.stats.atk || 0) * r.mul)) || undefined,
        def: (acc.stats && Math.floor((acc.stats.def || 0) * r.mul)) || undefined,
        hp: (acc.stats && Math.floor((acc.stats.hp || 0) * r.mul)) || undefined
      }
    });
  }

  const rareWeapons = WEAPONS.filter(w => /rare|epic|legendary|celestial/i.test((w.rarity||w.tier||'').toString()));
  const otherWeapons = WEAPONS.filter(w => !rareWeapons.includes(w));
  const familyAgg = {};
  for (const w of rareWeapons.concat(otherWeapons)) {
    if (idx > 1200) break;
    const id = makeId(idx++);
    const wstats = (w.stats || {});
    const atk = (wstats.atk || wstats.attack) || 0;
    const r = rarityScore(w);
    out.push({
      id,
      name: `${w.name} Blessing`,
      origin: { type: 'weapon', id: w.id },
      tier: r.tier || ((w.rarity || 'Common')[0] || 'C'),
      description: `A passive trace left by the weapon ${w.name}. [src:weapon:${w.id}]`,
      tags: ['weapon', w.category && w.category.toLowerCase()],
      stats: {
        atk: atk ? Math.max(1, Math.floor((atk * 0.5) * r.mul)) : undefined,
        def: wstats.def ? Math.floor(wstats.def * r.mul) : undefined,
        hp: wstats.hp ? Math.floor(wstats.hp * r.mul) : undefined
      }
    });

    if (w.category) {
      const key = w.category;
      if (!familyAgg[key]) familyAgg[key] = { count: 0, totalAtk: 0 };
      familyAgg[key].count++;
      familyAgg[key].totalAtk += atk || 0;
    }
  }

  for (const cat of Object.keys(familyAgg)) {
    if (idx > 1200) break;
    const famId = makeId(idx++);
    const agg = familyAgg[cat];
    const avgAtk = agg.count ? Math.floor(agg.totalAtk / Math.max(1, agg.count)) : 5;
    out.push({
      id: famId,
      name: `${cat} Mastery`,
      origin: { type: 'weapon_family', id: cat },
      tier: 'C',
      description: `A passive tied to the ${cat} weapon family. [src:weapon_family:${cat}]`,
      tags: ['weapon_family', cat && cat.toLowerCase()],
      stats: { atk: Math.max(1, Math.floor(avgAtk * 0.15)) }
    });
  }

  // Physiques: ensure each physique, especially rare ones, gets a generated passive
  for (const ph of PHYSIQUES || []) {
    if (idx > 1600) break;
    const id = makeId(idx++);
    const r = rarityScore(ph);
    out.push({
      id,
      name: `${ph.name || ph.id} Form Echo`,
      origin: { type: 'physique', id: ph.id },
      tier: r.tier || 'C',
      description: `A passive echo of the ${ph.name || ph.id} physique. [src:physique:${ph.id}]`,
      tags: ['physique', ...(ph.tags || [])],
      stats: {
        atk: ph.stats && ph.stats.atk ? Math.max(1, Math.floor(ph.stats.atk * r.mul)) : undefined,
        def: ph.stats && ph.stats.def ? Math.max(1, Math.floor(ph.stats.def * r.mul)) : undefined,
        hp: ph.stats && ph.stats.hp ? Math.max(1, Math.floor(ph.stats.hp * r.mul)) : undefined
      }
    });
  }

  // Trim undefined
  for (const p of out) {
    if (p.stats) Object.keys(p.stats).forEach(k => { if (p.stats[k] === undefined) delete p.stats[k]; });
  }

  return out;
}

const generated = generate();
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(generated, null, 2), 'utf8');
console.log(`Wrote ${generated.length} generated passives to ${outPath}`);
