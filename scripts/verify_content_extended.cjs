const path = require('path');
const fs = require('fs');
const buildRoot = path.join(__dirname,'..','.tmp_build','src','data');
function load(name){
  const candidates = [];
  candidates.push(path.join(buildRoot, name + '.cjs'));
  candidates.push(path.join(buildRoot, name + '.js'));
  candidates.push(path.join(buildRoot, name, 'index.cjs'));
  candidates.push(path.join(buildRoot, name, 'index.js'));
  for(const p of candidates){ if(p && fs.existsSync(p)) return require(p); }
  throw new Error('Missing compiled data module: '+name+' (tried '+candidates.join(', ')+')');
}

function unwrap(mod){ return (mod && mod.default) || mod; }

// Robust loading: inspect returned module shapes like report_missing_unlocks.cjs
function loadDataModule(name){
  const mod = unwrap(load(name));
  // mod may be { ALL_SKILLS: [...] } or { default: { ALL_SKILLS: [...] } } or the array itself
  if(!mod) return mod;
  if(Array.isArray(mod)) return mod;
  if(mod.ALL_SKILLS) return mod.ALL_SKILLS;
  if(mod.default && Array.isArray(mod.default)) return mod.default;
  if(mod.default && mod.default.ALL_SKILLS) return mod.default.ALL_SKILLS;
  return mod;
}

const skills = loadDataModule('skills/index');
const mentors = unwrap(load('mentors_runtime'));
const codex = unwrap(load('codexEntries'));
const tai = unwrap(load('taiYungLore'));
const physiques = unwrap(load('physiques'));
const races = unwrap(load('raceBackgrounds'));

let errors = [];

// 1) Mentor unlock IDs -> ALL_SKILLS
const skillIds = new Set((skills||[]).map(s=>s.id));
for(const m of mentors){
  if(!m.teachingProgression || !Array.isArray(m.teachingProgression.tiers)) continue;
  for(const t of m.teachingProgression.tiers){
    if(!Array.isArray(t.unlocks)) continue;
    for(const u of t.unlocks){
      if(!skillIds.has(u)) errors.push(`Mentor ${m.id || m.name} unlock ${u} not found in ALL_SKILLS`);
    }
  }
}

// 2) Codex/lore references - check entries have ids and any 'related' fields map
function asArray(x){ if(!x) return []; if(Array.isArray(x)) return x; if(typeof x === 'object') return Object.values(x); return []; }
function collectIds(coll){ const arr = asArray(coll); return new Set(arr.map(c=>c && c.id).filter(Boolean)); }
const codexIds = collectIds(codex);
const taiIds = collectIds(tai);

for(const e of asArray(codex)){
  if(e && e.related && Array.isArray(e.related)){
    for(const r of e.related){ if(!(codexIds.has(r) || taiIds.has(r))) errors.push(`Codex entry ${e.id} has unknown related id ${r}`); }
  }
}

// 3) Race/physique mapping
const physiqueIds = new Set(asArray(physiques).map(p=>p && p.id).filter(Boolean));
for(const rb of asArray(races)){
  if(!rb) continue;
  if(rb.defaultPhysique && !physiqueIds.has(rb.defaultPhysique)) errors.push(`Race ${rb.id} defaultPhysique ${rb.defaultPhysique} missing`);
  if(Array.isArray(rb.physiqueOptions)){
    for(const p of rb.physiqueOptions) if(!physiqueIds.has(p)) errors.push(`Race ${rb.id} physique option ${p} missing`);
  }
}

if(errors.length){
  console.error('Extended content verification found', errors.length, 'issues:');
  errors.slice(0,200).forEach(e=>console.error('-', e));
  process.exit(2);
}else{
  console.log('Extended content verification passed: mentor unlocks, codex/lore references, race/physique mappings OK');
  process.exit(0);
}
