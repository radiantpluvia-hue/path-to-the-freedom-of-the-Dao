const fs = require('fs');
const path = require('path');
const Module = require('module');

const root = path.join(__dirname,'..');
const buildRoot = path.join(root,'.tmp_build');
const registryCjs = path.join(buildRoot,'src','events','executors','eventExecutors_registry.cjs');

if(!fs.existsSync(buildRoot)){
  console.error('.tmp_build not found, run npm run build:node first');
  process.exit(2);
}

// Patch resolver to map '@/...' imports into compiled .tmp_build/src paths
const origResolve = Module._resolveFilename;
Module._resolveFilename = function(request, parent, isMain){
  try{
    if(typeof request === 'string' && request.startsWith('@/')){
      const spec = request.slice(2);
      const candidates = [
        path.join(buildRoot,'src', spec + '.cjs'),
        path.join(buildRoot,'src', spec + '.js'),
        path.join(buildRoot,'src', spec, 'index.cjs'),
        path.join(buildRoot,'src', spec, 'index.js')
      ];
      for(const c of candidates) if(fs.existsSync(c)) return c;
    }
  }catch(e){}
  return origResolve.apply(this, arguments);
};

let registry = null;
try{
  if(fs.existsSync(registryCjs)) registry = require(registryCjs);
  else {
    console.error('Compiled registry not found at', registryCjs);
    process.exit(2);
  }
}catch(e){
  console.error('Failed to require compiled registry:', e && e.stack || e);
  process.exit(2);
}

function readJSON(p){ return JSON.parse(fs.readFileSync(path.join(root,p),'utf8')); }
const acts = ['act1_events.json','act2_events.json','act3_events.json','act4_events.json','act5_events.json','act6_events.json','act7_events.json'].map(f=>path.join(root,f)).filter(fs.existsSync);
let ids = new Set();
for(const a of acts){
  const j = JSON.parse(fs.readFileSync(a,'utf8'));
  if(Array.isArray(j)) for(const e of j) if(e && e.executorId) ids.add(e.executorId);
}
ids = Array.from(ids).slice(0,50);

const makeInitialState = () => ({ player: { name: 'Tester', realm:1, level:1, stats:{hp:100,qi:0,atk:10,def:5,speed:5}, manuals:[], inventory:[], reputation:{} }, world:{ year:1, day:1, flags:{}, factions:{} }, __meta:{ eventsRan: [] } });

const failures = [];
for(const id of ids){
  const exec = registry.getExecutor ? registry.getExecutor(id) : (registry[id] || null);
  if(!exec){ failures.push(`Missing executor function for id ${id}`); continue; }
  try{
    const s0 = makeInitialState();
    const s1 = exec(s0);
    if(!s1 || !s1.__meta || !Array.isArray(s1.__meta.eventsRan) || !s1.__meta.eventsRan.includes(id)){
      failures.push(`Executor ${id} did not record eventsRan properly`);
    }
    const s2 = exec(s1, 'sample_choice');
    if(!s2) failures.push(`Executor ${id} returned falsy state on second run`);
  }catch(e){ failures.push(`Executor ${id} threw: ${e && e.message ? e.message : String(e)}`); }
}

console.log('Compiled CJS smoke test run for', ids.length, 'executors');
if(failures.length){ console.error('Failures:'); failures.slice(0,200).forEach(f=>console.error('-',f)); process.exit(2); }
else { console.log('All compiled smoke checks passed'); process.exit(0); }
