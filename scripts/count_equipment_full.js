const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'src', 'data', 'equipment_full.ts');
if (!fs.existsSync(p)) {
  console.error('Not found', p);
  process.exit(1);
}
const s = fs.readFileSync(p, 'utf8');
const count = (s.match(/\"id\":/g) || []).length;
console.log('EQUIPMENT_FULL items:', count);
