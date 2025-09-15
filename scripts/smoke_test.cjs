// Simple smoke test harness for event executors (Acts 1-4)
const fs = require('fs');
const path = require('path');
// We'll attempt to load TypeScript modules at runtime using ts-node. If available,
// use dynamic import() (file:// URL) because the project uses "type": "module" and
// compiled .ts files are ESM; require() will fail. If ts-node isn't available or
// dynamic import fails, fall back to a non-executing textual presence check.
let registry = null;
const registryTsPath = path.join(__dirname,'..','src','events','executors','eventExecutors_registry.ts');

function readJSON(p){return JSON.parse(fs.readFileSync(p,'utf8'))}
const root = path.join(__dirname,'..');
const acts = ['act1_events.json','act2_events.json','act3_events.json','act4_events.json'].map(f=>path.join(root,f)).filter(fs.existsSync);
let ids = new Set();
for(const a of acts){
  const j = readJSON(a);
  if(Array.isArray(j)) for(const e of j) if(e && e.executorId) ids.add(e.executorId);
}

// Pick a small sample of executor ids (first 20)
ids = Array.from(ids).slice(0,20);

const makeInitialState = () => ({
  player: {
    name: 'Tester',
    realm: 1,
    level: 1,
    stats: { hp: 100, qi: 0, atk: 10, def: 5, speed: 5 },
    manuals: [],
    inventory: [],
    reputation: {},
  },
  world: { year: 1, day: 1, flags: {}, factions: {} },
  __meta: { eventsRan: [] }
});

let failures = [];

async function runExecutionChecks(){
  for(const id of ids){
    const exec = registry.getExecutor ? registry.getExecutor(id) : (registry[id] || (()=>{}));
    if(!exec){ failures.push(`Missing executor function for id ${id}`); continue; }
    try{
      const s0 = makeInitialState();
      const s1 = await exec(s0);
      if(!s1 || !s1.__meta || !Array.isArray(s1.__meta.eventsRan) || !s1.__meta.eventsRan.includes(id)){
        failures.push(`Executor ${id} did not record eventsRan properly`);
      }
      const s2 = await exec(s1, 'sample_choice');
      if(!s2){ failures.push(`Executor ${id} returned falsy state on second run`); }
    }catch(e){ failures.push(`Executor ${id} threw: ${e && e.message ? e.message : String(e)}`); }
  }
}

async function runFallbackTextualChecks(){
  const src = path.join(__dirname,'..','src','events','executors');
  const files = fs.readdirSync(src).filter(f=>f.endsWith('.ts')||f.endsWith('.js'));
  const allText = files.map(f=>fs.readFileSync(path.join(src,f),'utf8')).join('\n');
  for(const id of ids){ if(!allText.includes(id)) failures.push(`Executor id ${id} not found in source files`); }
}

(async function main(){
  try{
    try{
      require('ts-node/register');
      // import as ESM using file:// URL so Node handles module type correctly
      const { pathToFileURL } = require('url');
      const mod = await import(pathToFileURL(registryTsPath).href);
      registry = mod.default || mod;
    }catch(e){
      console.warn('Could not load TypeScript runtime or import registry as ESM. Falling back to non-execution registry checks.');
      registry = null;
    }

    if(registry){
      await runExecutionChecks();
    } else {
      await runFallbackTextualChecks();
    }

    console.log('Smoke test run for', ids.length, 'executors');
    if(failures.length){
      console.error('Failures:'); failures.slice(0,200).forEach(f=>console.error('-',f)); process.exit(2);
    } else { console.log('All smoke checks passed'); process.exit(0); }
  }catch(e){ console.error('Smoke test failed:', e && e.message ? e.message : e); process.exit(2); }
})();
