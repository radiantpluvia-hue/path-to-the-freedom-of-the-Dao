const path = require('path');
const fs = require('fs');
const skillsPath = path.join(__dirname,'..','..','.tmp_build','src','data','skills','index.cjs');
if(!fs.existsSync(skillsPath)){
  console.error('Compiled skills not found at', skillsPath); process.exit(2);
}
const skills = require(skillsPath);
const all = (skills && skills.ALL_SKILLS) || skills.default || skills;
console.log('ALL_SKILLS length:', (all && all.length) || 0);
const samples = ['sect_generic_0','heaven_splitter','void_dragon_saber','starfall_sword_dance','purifying_sutra'];
for(const s of samples){
  console.log(s, 'present?', !!(all && all.find(x=>x.id===s)));
}
console.log('First 10 skill ids:', (all||[]).slice(0,10).map(s=>s.id));

module.exports = { inspect: () => {} };
