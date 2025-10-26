// Normalizes leaderCultivation and leaderAge in .tmp_build/src/systems/SectSystem.js
// Keeps mount_hua_sect, buddha_sect, and kunlun_sect unchanged.
const path = require('path');
const fs = require('fs');

const builtPath = path.join(__dirname, '..', '.tmp_build', 'src', 'systems', 'SectSystem.js');
if (!fs.existsSync(builtPath)) {
  console.error('Built file not found:', builtPath);
  process.exit(1);
}

// Require the built file to obtain MAJOR_SECTS/MAJOR_FACTIONS
const builtModule = require(builtPath);
const MAJOR_SECTS = builtModule.MAJOR_SECTS;
if (!Array.isArray(MAJOR_SECTS)) {
  console.error('MAJOR_SECTS not found or not an array');
  process.exit(2);
}

const kunlun = MAJOR_SECTS.find(s => s.id === 'kunlun_sect');
const kunlunAge = kunlun && kunlun.leaderAge ? Number(kunlun.leaderAge) : 256030122;
const targetCultivation = 'Saint';

// Modify a shallow copy
const modified = MAJOR_SECTS.map(sect => {
  if (!sect || !sect.id) return sect;
  if (sect.id === 'mount_hua_sect' || sect.id === 'buddha_sect' || sect.id === 'kunlun_sect') return sect;

  const variance = Math.floor(Math.random() * 2000000);
  const direction = (Math.random() < 0.5) ? -1 : 1;
  const newAge = Math.max(1000000, kunlunAge + direction * variance);

  const out = Object.assign({}, sect);
  out.leaderCultivation = targetCultivation;
  out.leaderAge = String(newAge);
  return out;
});

// Read the file and replace the exports.MAJOR_SECTS block
let src = fs.readFileSync(builtPath, 'utf8');
const regex = /exports\.MAJOR_SECTS\s*=\s*\[[\s\S]*?\];/m;
if (!regex.test(src)) {
  console.error('Could not find exports.MAJOR_SECTS block in the built file.');
  process.exit(3);
}

const replacement = 'exports.MAJOR_SECTS = ' + JSON.stringify(modified, null, 4) + ';';
src = src.replace(regex, replacement);
fs.writeFileSync(builtPath, src, 'utf8');
console.log('Normalized MAJOR_SECTS written to', builtPath);
process.exit(0);
