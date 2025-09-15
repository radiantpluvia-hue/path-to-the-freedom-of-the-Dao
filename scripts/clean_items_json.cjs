const fs = require('fs');
const path = 'c:\\Users\\xbo4k.ZLOVE.000\\Downloads\\xianxia game\\data\\items.json';
const backup = path + '.bak';
try {
  const raw = fs.readFileSync(path, 'utf8');
  // Find all JSON arrays in the file text using regex (non-greedy)
  const arrs = [];
  const re = /\[([\s\S]*?)\]/g;
  let m;
  while ((m = re.exec(raw)) !== null) {
    const text = '[' + m[1] + ']';
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) arrs.push(parsed);
    } catch (e) {
      // ignore parse errors for partial arrays
    }
  }

  if (arrs.length === 0) {
    console.error('No JSON arrays found or parseable in', path);
    process.exit(1);
  }

  // Merge arrays
  const merged = [];
  const seen = new Map();
  for (const a of arrs) {
    for (const obj of a) {
      if (!obj || !obj.id) continue;
      if (!seen.has(obj.id)) {
        seen.set(obj.id, true);
        merged.push(obj);
      }
    }
  }

  // Backup original
  fs.copyFileSync(path, backup);
  fs.writeFileSync(path, JSON.stringify(merged, null, 2) + '\n');
  console.log('WROTE', path, 'BACKUP', backup, 'ENTRIES', merged.length);
} catch (err) {
  console.error('ERROR', err && err.message);
  process.exit(1);
}
