const fs = require('fs');

function parseArrayFromFile(file, arrayName) {
  const s = fs.readFileSync(file, 'utf8');
  const re = new RegExp(`const ${arrayName} = \\[((?:[\\s\\S]*?)\\]);`, 'm');
  const m = s.match(re);
  if (!m) return [];
  const body = m[1];
  const items = body.match(/"(.*?)"/g) || [];
  return items.map(x => x.replace(/"/g, ''));
}

function countOriginalObjects(file, constName) {
  const s = fs.readFileSync(file, 'utf8');
  const re = new RegExp(`const ${constName}:[\\s\\S]*?= \\[((?:[\\s\\S]*?)\\]);`, 'm');
  const m = s.match(re);
  if (!m) return [];
  const body = m[1];
  const objs = body.match(/\{[\s\S]*?\}/g) || [];
  return objs.map(o => o);
}

function determineRarity(index, total) {
  const percent = (index / total) * 100;
  if (percent < 40) return 'H';
  if (percent < 60) return 'G';
  if (percent < 75) return 'F';
  if (percent < 85) return 'E';
  if (percent < 92) return 'D';
  if (percent < 97) return 'mythical';
  return 'B';
}

function tallyBloodlines() {
  const file = './src/data/bloodlines_fixed.ts';
  const names = parseArrayFromFile(file, 'BLOODLINE_NAMES');
  const totals = {};
  names.forEach((n, i) => {
    const r = determineRarity(i, names.length);
    totals[r] = (totals[r] || 0) + 1;
  });
  const originals = countOriginalObjects(file, 'ORIGINAL_MAIN_CHARACTER_BLOODLINES');
  // Originals in this file are explicitly given with rarity 'D'
  totals['D'] = (totals['D'] || 0) + originals.length;
  return { totals, generated: names.length, original: originals.length };
}

function tallyPhysiques() {
  const file = './src/data/physiques.ts';
  const names = parseArrayFromFile(file, 'PHYSIQUE_NAMES');
  const totals = {};
  names.forEach((n, i) => {
    const r = determineRarity(i, names.length);
    totals[r] = (totals[r] || 0) + 1;
  });
  const originals = countOriginalObjects(file, 'ORIGINAL_MAIN_CHARACTER_PHYSIQUES');
  // Originals in this file are explicitly given with rarity 'D'
  totals['D'] = (totals['D'] || 0) + originals.length;
  return { totals, generated: names.length, original: originals.length };
}

function print(objName, res) {
  console.log(objName);
  console.log('  generated:', res.generated, 'original:', res.original, 'total:', res.generated + res.original);
  const order = ['B', 'mythical', 'D', 'E', 'F', 'G', 'H'];
  order.forEach(k => {
    if (res.totals[k]) console.log('   ', k, ':', res.totals[k]);
  });
}

print('Bloodlines', tallyBloodlines());
print('Physiques', tallyPhysiques());

console.log('\nNote: originals are counted as rarity D per source files. Rarity buckets use determineRarity(index,total) with thresholds: <40% H, <60% G, <75% F, <85% E, <92% D, <97% mythical, else B.');
