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

try{
  const skillsMod = unwrap(load('skills/index'));
  const skills = (skillsMod && (skillsMod.ALL_SKILLS || skillsMod.default && skillsMod.default.ALL_SKILLS)) || skillsMod;
  const mentors = unwrap(load('mentors_runtime'));

  const skillIds = new Set((skills||[]).map(s=>s && s.id).filter(Boolean));

  const missing = [];
  for(const m of mentors||[]){
    const mid = m.id || m.name || '<unknown_mentor>';
    if(!m.teachingProgression || !Array.isArray(m.teachingProgression.tiers)) continue;
    for(const t of m.teachingProgression.tiers||[]){
      if(!Array.isArray(t.unlocks)) continue;
      for(const u of t.unlocks){
        const present = skillIds.has(u);
        if(!present) missing.push({ mentor: mid, mentorName: m.name || null, unlock: u, present });
      }
    }
  }

  // also check which of the sample ids exist (quick sanity)
  const samples = ['sect_generic_0','heaven_splitter','void_dragon_saber','starfall_sword_dance','purifying_sutra'];
  const samplePresence = {};
  for(const s of samples) samplePresence[s] = !!skillIds.has(s);

  const out = { skillCount: (skills||[]).length, missingCount: missing.length, missing, samplePresence };
  const reportDir = path.join(__dirname,'..','.tmp_build','reports');
  try{ fs.mkdirSync(reportDir, { recursive: true }); }catch(e){}
  fs.writeFileSync(path.join(reportDir,'missing_mentor_unlocks.json'), JSON.stringify(out, null, 2));

  console.log('Compiled skills module path checked under:', buildRoot);
  console.log('ALL_SKILLS count:', out.skillCount);
  console.log('Missing mentor unlocks count:', out.missingCount);
  if(out.missingCount>0){
    console.log('First 40 missing entries:');
    out.missing.slice(0,40).forEach(x=>console.log('-', x.mentor, '->', x.unlock));
  } else {
    console.log('No missing mentor unlocks found.');
  }
  console.log('\nSample skill presence:', samplePresence);
  console.log('\nWrote report to .tmp_build/reports/missing_mentor_unlocks.json');
  process.exit(out.missingCount?2:0);
}catch(err){
  console.error('Error while running report:', err && err.stack || err);
  process.exit(3);
}
