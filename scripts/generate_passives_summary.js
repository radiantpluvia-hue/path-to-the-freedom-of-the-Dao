const fs = require('fs');
const path = require('path');

const skillsPath = path.join(__dirname, '..', 'src', 'data', 'skills', 'all_skills.json');
const outDir = path.join(__dirname, '..', 'docs');
const outPath = path.join(outDir, 'passives_summary.md');

const tierEffects = {
  S: 'cultivationSpeed: +90% (S-tier)\nExtra: +5 ATK, +3 DEF, aura: +2 Qi/tick (default)',
  A: 'cultivationSpeed: +30% (A-tier)\nExtra: +3 ATK, +1 DEF (default)',
  B: 'cultivationSpeed: +12% (B-tier)\nExtra: +2 DEF (default)',
  C: 'cultivationSpeed: +5% (C-tier)\nExtra: +1 DEF (default)'
};

function main() {
  if (!fs.existsSync(skillsPath)) {
    console.error('skills file not found at', skillsPath);
    process.exit(1);
  }
  const raw = fs.readFileSync(skillsPath, 'utf8');
  const skills = JSON.parse(raw);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const lines = [];
  lines.push('# Passives Summary');
  lines.push('Generated from `src/data/skills/all_skills.json`.');
  lines.push('');
  lines.push('| id | name | tier | description | effectSummary |');
  lines.push('|---|---|---:|---|---|');

  skills.forEach(s => {
    const tier = (s.tier || 'C').toUpperCase();
    const effect = tierEffects[tier] || tierEffects.C;
    const esc = (v) => String(v || '').replace(/\|/g, '\\|').replace(/\n/g, '<br/>');
    lines.push(`| ${esc(s.id)} | ${esc(s.name)} | ${esc(tier)} | ${esc(s.description)} | ${esc(effect)} |`);
  });

  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
  console.log('Wrote', outPath);
}

if (require.main === module) main();

module.exports = { main };
