const fs = require('fs');
function countBloodlines() {
  const file = './src/data/bloodlines_fixed.ts';
  const s = fs.readFileSync(file, 'utf8');
  const m = s.match(/const BLOODLINE_NAMES = \[([\s\S]*?)\];/m);
  const names = (m && (m[1].match(/\"(.*?)\"/g) || []).length) || 0;
  const om = s.match(/const ORIGINAL_MAIN_CHARACTER_BLOODLINES:[\s\S]*?= \[([\s\S]*?)\];/m);
  const orig = (om && (om[1].match(/id:\s*'[^']+'/g) || []).length) || 0;
  return { generated: names, original: orig, total: names + orig };
}

function countPhysiques() {
  const file = './src/data/physiques.ts';
  const s = fs.readFileSync(file, 'utf8');
  const m = s.match(/const PHYSIQUE_NAMES = \[([\s\S]*?)\];/m);
  const names = (m && (m[1].match(/\"(.*?)\"/g) || []).length) || 0;
  const om = s.match(/const ORIGINAL_MAIN_CHARACTER_PHYSIQUES:[\s\S]*?= \[([\s\S]*?)\];/m);
  const orig = (om && (om[1].match(/id:\s*'[^']+'/g) || []).length) || 0;
  return { generated: names, original: orig, total: names + orig };
}

function listRealms() {
  const file = './gameData.ts';
  const s = fs.readFileSync(file, 'utf8');
  const m = s.match(/export const REALM_DATA: Realm\[\] = \[([\s\S]*?)\];/m);
  const arr = (m && m[1]) || '';
  const entries = (arr.match(/\{[\s\S]*?\}/g) || []);
  return entries.map(e => {
    const id = (e.match(/id:\s*(\d+)/) || [])[1] || null;
    const name = (e.match(/name:\s*'([^']+)'/) || [])[1] || null;
    const qi = (e.match(/breakthroughQi:\s*([^,\n]+)/) || [])[1] || null;
    const lifespan = (e.match(/lifespan:\s*(\d+)/) || [])[1] || null;
    return { id, name, breakthroughQi: qi, lifespan }; 
  });
}

const res = {
  bloodlines: countBloodlines(),
  physiques: countPhysiques(),
  realms: listRealms()
};
console.log(JSON.stringify(res, null, 2));
