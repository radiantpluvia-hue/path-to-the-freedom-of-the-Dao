// Node script to validate: (1) all event executorIds are present in executor registries, and (2) all mentor unlock ids exist in ALL_SKILLS
const fs = require('fs');
const path = require('path');

function readJSON(p) { return JSON.parse(fs.readFileSync(p,'utf8')); }

const projectRoot = path.resolve(__dirname, '..');

// Collect event executor ids from root act JSON files
const actFiles = ['act1_events.json','act2_events.json','act3_events.json','act4_events.json','act5_events.json','act6_events.json','act7_events.json']
  .map(f => path.join(projectRoot,f)).filter(p => fs.existsSync(p));

const eventExecutorIds = new Set();
for (const p of actFiles) {
  try {
    const j = readJSON(p);
    if (Array.isArray(j)) {
      for (const e of j) if (e && e.executorId) eventExecutorIds.add(e.executorId);
    } else if (typeof j === 'object') {
      Object.values(j).forEach(v => { if (v && v.executorId) eventExecutorIds.add(v.executorId); });
    }
  } catch (e) {
    console.error('Failed reading',p,e.message);
  }
}

// Collect registry ids from src/events/executors and utils
const registryDirs = [
  path.join(projectRoot,'src','events','executors'),
  path.join(projectRoot,'utils')
];
const registryIds = new Set();
for (const d of registryDirs) {
  if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d)) {
    if (!f.endsWith('.ts') && !f.endsWith('.js')) continue;
    const txt = fs.readFileSync(path.join(d,f),'utf8');
    const regex = /['\"]([a-zA-Z0-9_\-:]+)['\"]\s*:\s*/g;
    let m;
    while ((m = regex.exec(txt))) registryIds.add(m[1]);
  }
}

// Mentors unlock validation
let ALL_SKILLS = [];
try {
  const skillsModule = require(path.join(projectRoot,'src','data','skills','index.js'));
  ALL_SKILLS = skillsModule.ALL_SKILLS || skillsModule.default || [];
} catch (e) {
  // try JSON import
  try { ALL_SKILLS = readJSON(path.join(projectRoot,'src','data','skills','all_skills.json')); } catch (e2) { ALL_SKILLS = []; }
}
const skillIds = new Set(ALL_SKILLS.map(s => s && s.id).filter(Boolean));

let mentorFiles = [];
const candidates = [path.join(projectRoot,'src','data','mentors_enhanced.json'), path.join(projectRoot,'src','data','mentors.json'), path.join(projectRoot,'src','data','immortal_leaders.json')];
mentorFiles = candidates.filter(p=>fs.existsSync(p));

const missing = { executors: [], skills: [] };

// Check executor ids
for (const id of eventExecutorIds) {
  if (!registryIds.has(id)) missing.executors.push(id);
}

// Check mentor unlocks
for (const mf of mentorFiles) {
  const j = readJSON(mf);
  for (const m of j) {
    const tiers = m.teachingProgression && m.teachingProgression.tiers ? m.teachingProgression.tiers : [];
    for (const t of tiers) {
      const unlocks = Array.isArray(t.unlocks) ? t.unlocks : (t.unlocks ? [t.unlocks] : []);
      for (const u of unlocks) {
        if (!skillIds.has(u)) missing.skills.push(`${m.id} -> ${u}`);
      }
    }
  }
}

console.log('Event executors found:', eventExecutorIds.size);
console.log('Registry keys found (heuristic):', registryIds.size);
console.log('Missing executor ids:', missing.executors.length);

if (missing.executors.length) {
  console.error('Missing executor ids referenced by events:\n', missing.executors.join('\n'));
}

console.log('Missing mentor unlocks:', missing.skills.length);
if (missing.skills.length) {
  console.error('Missing mentor unlock skill ids:\n', missing.skills.slice(0,200).join('\n'));
}

const out = { eventExecutorCount: eventExecutorIds.size, registryCount: registryIds.size, missingExecutors: missing.executors, missingSkillUnlocks: missing.skills };
fs.writeFileSync(path.join(projectRoot,'scripts','validator_report.json'), JSON.stringify(out,null,2));
process.exit((missing.executors.length || missing.skills.length) ? 2 : 0);
