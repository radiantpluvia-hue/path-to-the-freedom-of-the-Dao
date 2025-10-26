const fs = require('fs');
const path = require('path');
const MIG = { common:'H', 'common+':'H+', 'common-':'H-', uncommon:'G', rare:'F', epic:'E', legendary:'D', mythic:'C', transcendent:'B' };

function walk(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(f => {
    const fp = path.join(dir, f);
    const st = fs.statSync(fp);
    if (st.isDirectory()) return walk(fp);
    if (fp.endsWith('.json')) {
      const raw = fs.readFileSync(fp, 'utf8');
      try {
        const obj = JSON.parse(raw);
        let changed = false;
        function rec(x) {
          if (!x || typeof x !== 'object') return;
          for (const k of Object.keys(x)) {
            if (k === 'tier' && typeof x[k] === 'string') {
              const key = x[k].toLowerCase();
              if (MIG[key]) { x[k] = MIG[key]; changed = true; }
            } else rec(x[k]);
          }
        }
        rec(obj);
        if (changed) {
          fs.copyFileSync(fp, `${fp}.bak`);
          fs.writeFileSync(fp, JSON.stringify(obj, null, 2), 'utf8');
          console.log('migrated', fp);
        }
      } catch (e) {
        console.warn('skip', fp, e.message);
      }
    }
  });
}

walk(path.join(__dirname, '..', 'data'));
