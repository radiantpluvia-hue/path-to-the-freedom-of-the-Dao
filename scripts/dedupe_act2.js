const fs = require('fs');
const path = 'c:\\Users\\xbo4k.ZLOVE.000\\Downloads\\xianxia game\\act2_events.json';
try {
  const raw = fs.readFileSync(path, 'utf8');
  const arr = JSON.parse(raw);
  const map = new Map();
  const out = [];
  for (const e of arr) {
    if (!e || !e.id) continue;
    if (!map.has(e.id)) {
      map.set(e.id, true);
      out.push(e);
    }
  }
  fs.writeFileSync(path, JSON.stringify(out, null, 2) + '\n');
  console.log('DEDUPED_COUNT', out.length);
} catch (err) {
  console.error('ERROR', err && err.message);
  process.exit(1);
}
