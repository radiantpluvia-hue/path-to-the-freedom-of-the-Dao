#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');

function tryRequireBuild(relative) {
  const buildPath = path.join(repoRoot, '.tmp_build', 'src', relative + '.cjs');
  if (fs.existsSync(buildPath)) return require(buildPath);
  const jsPath = path.join(repoRoot, 'src', relative + '.js');
  if (fs.existsSync(jsPath)) return require(jsPath);
  return require(path.join(repoRoot, 'src', relative));
}

const generated = require(path.join(repoRoot, 'src', 'data', 'generated', 'passives.generated.json'));
const bloodlinesModule = tryRequireBuild('data/bloodlines_fixed');
const manualsModule = tryRequireBuild('data/manuals');
const weaponsModule = tryRequireBuild('data/weapons');
const accessoriesModule = tryRequireBuild('data/generated/accessories.generated');
const abilitiesModule = tryRequireBuild('data/generated/activeAbilities.generated');
const physiquesModule = tryRequireBuild('data/physiques');

const ALL_BLOODLINES = bloodlinesModule.ALL_BLOODLINES || bloodlinesModule.default || [];
const ALL_MANUALS = manualsModule.ALL_MANUALS || manualsModule.default || [];
const WEAPONS = weaponsModule.WEAPONS || weaponsModule.default || [];
const GENERATED_ACCESSORIES = accessoriesModule.default || accessoriesModule;
const GENERATED_ACTIVE_ABILITIES = abilitiesModule.default || abilitiesModule;
const PHYSIQUES = physiquesModule.PHYSIQUES || physiquesModule.default || [];

function buildIndex() {
  const idx = {};
  for (const p of generated) {
    const o = (p.origin && p.origin.type) || 'unknown';
    const id = (p.origin && p.origin.id) || p.id;
    idx[o] = idx[o] || {};
    idx[o][id] = idx[o][id] || [];
    idx[o][id].push(p.id);
  }
  return idx;
}

function findMissing(catalog, typeName, idField = 'id', rarityField = 'rarity') {
  const missing = [];
  const rareMissing = [];
  for (const item of catalog) {
    const id = item[idField];
    const has = (index[typeName] && index[typeName][id]);
    if (!has) missing.push(id);
    const rarity = (item[rarityField] || item.rank || item.tier || '').toString();
    const isRare = /rare/i.test(rarity);
    if (isRare && !has) rareMissing.push({ id, rarity });
  }
  return { missing, rareMissing };
}

const index = buildIndex();

const report = [];

report.push({ origin: 'bloodline', totalCatalog: ALL_BLOODLINES.length, generatedCount: Object.keys(index.bloodline||{}).length });
report.push({ origin: 'manual', totalCatalog: ALL_MANUALS.length, generatedCount: Object.keys(index.manual||{}).length });
report.push({ origin: 'weapon', totalCatalog: WEAPONS.length, generatedCount: Object.keys(index.weapon||{}).length });
report.push({ origin: 'weapon_family', totalCatalog: Object.keys(index.weapon_family||{}).length, generatedCount: Object.keys(index.weapon_family||{}).length });
report.push({ origin: 'accessory', totalCatalog: GENERATED_ACCESSORIES.length, generatedCount: Object.keys(index.accessory||{}).length });
report.push({ origin: 'ability', totalCatalog: GENERATED_ACTIVE_ABILITIES.length, generatedCount: Object.keys(index.ability||{}).length });
report.push({ origin: 'physique', totalCatalog: PHYSIQUES.length, generatedCount: Object.keys(index.physique||{}).length });

console.log('Generated passives total:', generated.length);
for (const r of report) console.log(`${r.origin}: catalog=${r.totalCatalog} | genIndex=${r.generatedCount}`);

// Find missing rare items specifically
const bloodlineMissing = findMissing(ALL_BLOODLINES, 'bloodline');
const manualsMissing = findMissing(ALL_MANUALS, 'manual');
const weaponsMissing = findMissing(WEAPONS, 'weapon');
const abilitiesMissing = findMissing(GENERATED_ACTIVE_ABILITIES, 'ability');
const accessoriesMissing = findMissing(GENERATED_ACCESSORIES, 'accessory');
const physiquesMissing = findMissing(PHYSIQUES, 'physique');

console.log('\nSummary of rare items missing a generated passive:');
console.log('bloodlines rare missing:', bloodlineMissing.rareMissing.length);
console.log('manuals rare missing:', manualsMissing.rareMissing.length);
console.log('weapons rare missing:', weaponsMissing.rareMissing.length);
console.log('abilities rare missing:', abilitiesMissing.rareMissing.length);
console.log('accessories rare missing:', accessoriesMissing.rareMissing.length);
console.log('physiques rare missing:', physiquesMissing.rareMissing.length);

// Print examples (up to 10) of any rare missing entries
function printExamples(list, label) {
  if (!list || list.length === 0) return;
  console.log(`\nExamples of ${label} (up to 10):`);
  for (const it of list.slice(0,10)) console.log(' -', it.id, it.rarity || '');
}

printExamples(bloodlineMissing.rareMissing, 'bloodline rare missing');
printExamples(manualsMissing.rareMissing, 'manual rare missing');
printExamples(weaponsMissing.rareMissing, 'weapon rare missing');
printExamples(abilitiesMissing.rareMissing, 'ability rare missing');
printExamples(accessoriesMissing.rareMissing, 'accessory rare missing');
printExamples(physiquesMissing.rareMissing, 'physique rare missing');

console.log('\nIf you want a CSV of missing items or a full list, re-run with the script modified to write a file.');
