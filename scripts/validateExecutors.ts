import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function readJSON(p: string) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function collectEventExecutorIds(folder: string) {
  const ids = new Set<string>();
  for (const f of fs.readdirSync(folder)) {
    if (!f.endsWith('.json')) continue;
    const data = readJSON(path.join(folder, f));
    for (const e of data) {
      if (e.executorId) ids.add(e.executorId);
    }
  }
  return ids;
}

function collectRegistryIds(regFolder: string) {
  const ids = new Set<string>();
  for (const f of fs.readdirSync(regFolder)) {
    if (!f.endsWith('.ts')) continue;
    const txt = fs.readFileSync(path.join(regFolder, f), 'utf8');
    // crude parse: look for keys in object literal like '"fn_act1_xxx":' or bare keys
    const regex = /['\"]([a-zA-Z0-9_]+)['\"]\s*:\s*/g;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(txt)) !== null) ids.add(m[1]);
  }
  return ids;
}

const eventFolder = path.resolve(__dirname, '..');
const rootEvents = path.join(eventFolder, 'act1_events.json');
// user repo stores act events at root and src/events/data
const actJsonPaths = [
  path.join(eventFolder, 'act1_events.json'),
  path.join(eventFolder, 'act2_events.json'),
  path.join(eventFolder, 'act3_events.json'),
  path.join(eventFolder, 'act4_events.json'),
  path.join(eventFolder, 'act5_events.json'),
  path.join(eventFolder, 'act6_events.json'),
  path.join(eventFolder, 'act7_events.json'),
].filter(p => fs.existsSync(p));

const eventExecutorIds = new Set<string>();
for (const p of actJsonPaths) {
  const j = readJSON(p);
  // if file is an array or newline-delimited JSON, try both
  if (Array.isArray(j)) {
    for (const e of j) if (e.executorId) eventExecutorIds.add(e.executorId);
  } else if (typeof j === 'object') {
    // maybe file contains object mapping
    for (const key of Object.keys(j)) {
      const e = j[key];
      if (e && e.executorId) eventExecutorIds.add(e.executorId);
    }
  } else if (typeof j === 'string') {
    // ignore
  }
}

const regFolder = path.join(eventFolder, 'src', 'events', 'executors');
const registryIds = fs.existsSync(regFolder) ? collectRegistryIds(regFolder) : new Set<string>();

const missing = Array.from(eventExecutorIds).filter(id => !registryIds.has(id));
console.log('Total event executor ids found:', eventExecutorIds.size);
console.log('Total registry ids found:', registryIds.size);
console.log('Missing in registries:', missing.length);
for (const m of missing) console.log(' -', m);

// ensure scripts folder exists and write result to file for inspection
const outDir = path.join(eventFolder, 'scripts');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'executorValidation.json'), JSON.stringify({eventExecutorCount: eventExecutorIds.size, registryCount: registryIds.size, missing}, null, 2));
console.log('Wrote scripts/executorValidation.json');
