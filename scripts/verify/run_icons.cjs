const path = require('path');
const fs = require('fs');

const dataPath = path.resolve(__dirname, '..', '..', 'src', 'data', 'raceBackgrounds.ts');
if (!fs.existsSync(dataPath)) {
  console.error('raceBackgrounds.ts not found at', dataPath);
  process.exit(2);
}

const content = fs.readFileSync(dataPath, 'utf8');
const iconIds = new Set();
const regex = /previewIcon:\s*'([^']+)'/g;
let m;
while ((m = regex.exec(content))) {
  iconIds.add(m[1]);
}

// Implemented icons list must mirror src/components/ui/Icon.tsx
const implemented = new Set([
  'icon-noble','icon-scholar','icon-commoner','icon-sect','icon-infernal','icon-outcast','icon-woodland','icon-wandering','icon-dragonblood','icon-dragon-scholar','icon-phoenix-reborn','icon-phoenix-flame','icon-celestial-bureau','icon-celestial-fallen','icon-asura-warborn','icon-asura-rage','icon-asura-tactician','icon-monkey-king','icon-monkey-mountain','icon-monkey-trickster','icon-monkey-mystic','icon-monkey-artisan','icon-fox-nine','icon-fox-city','icon-qilin-auspice','icon-qilin-guardian','icon-qilin-blessed'
]);

const missing = [];
for (const id of iconIds) {
  if (!implemented.has(id)) missing.push(id);
}

if (missing.length) {
  console.error('Missing icon implementations for:', missing.join(', '));
  process.exit(1);
}

console.log('All previewIcon ids have implementations (count: ' + iconIds.size + ')');
process.exit(0);
