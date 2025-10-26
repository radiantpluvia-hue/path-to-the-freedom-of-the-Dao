// Fix sect leader ages in .tmp_build/src/systems/SectSystem.js
// Rule: map numeric realm id -> REALM_ORDER index -> get lifespanBonus from src/data/cultivationRealms.ts
// leaderAge = max(40, Math.floor(lifespanBonus * 0.6))

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const cultPath = path.join(ROOT, 'src', 'data', 'cultivationRealms.ts');
const builtPath = path.join(ROOT, '.tmp_build', 'src', 'systems', 'SectSystem.js');

function extractRealmOrder(text) {
  const m = text.match(/export const REALM_ORDER\s*=\s*\[([\s\S]*?)\];/);
  if (!m) return null;
  const inner = m[1];
  const keys = [];
  const re = /'([^']+)'/g;
  let mm;
  while ((mm = re.exec(inner)) !== null) {
    keys.push(mm[1]);
  }
  return keys;
}

function extractLifespanBonuses(text) {
  // find each key: key: { ... lifespanBonus: NUMBER,
  const re = /([a-z0-9_]+)\s*:\s*\{([\s\S]*?)\n\s*\},?/g;
  const map = {};
  let m;
  while ((m = re.exec(text)) !== null) {
    const key = m[1];
    const block = m[2];
    const lbm = block.match(/lifespanBonus\s*:\s*([0-9]+)/);
    if (lbm) map[key] = Number(lbm[1]);
  }
  return map;
}

try {
  const cultText = fs.readFileSync(cultPath, 'utf8');
  const realmOrder = extractRealmOrder(cultText);
  if (!realmOrder) throw new Error('Could not find REALM_ORDER in ' + cultPath);
  const bonuses = extractLifespanBonuses(cultText);

  const builtText = fs.readFileSync(builtPath, 'utf8');
  const m = builtText.match(/exports\.MAJOR_SECTS\s*=\s*(\[[\s\S]*?\]);/);
  if (!m) throw new Error('Could not find exports.MAJOR_SECTS block in ' + builtPath);
  const arrText = m[1];
  let sects;
  try {
    sects = JSON.parse(arrText);
  } catch (e) {
    // Try to make it JSON-safe: remove trailing commas
    const fixed = arrText.replace(/,\s*\]/g, ']');
    sects = JSON.parse(fixed);
  }

  let changed = 0;
  for (const s of sects) {
    const realmNum = Number(s.realm);
    if (isNaN(realmNum)) continue;
    const realmKey = realmOrder[realmNum];
    if (!realmKey) continue;
    const lifespan = bonuses[realmKey];
    let newAge;
    if (!lifespan || lifespan === 0) {
      // default human-ish
      newAge = 40;
    } else {
      newAge = Math.max(40, Math.floor(lifespan * 0.6));
    }
    const newAgeStr = String(newAge);
    if (s.leaderAge !== newAgeStr) {
      s.leaderAge = newAgeStr;
      changed++;
    }
  }

  const newArrText = JSON.stringify(sects, null, 4);
  const newBuilt = builtText.replace(/exports\.MAJOR_SECTS\s*=\s*\[[\s\S]*?\];/, 'exports.MAJOR_SECTS = ' + newArrText + ';');
  fs.writeFileSync(builtPath, newBuilt, 'utf8');
  console.log('Updated leaderAge for', changed, 'sects in', builtPath);
} catch (err) {
  console.error(err);
  process.exit(1);
}
