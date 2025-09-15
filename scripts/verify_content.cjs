const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const root = path.join(__dirname,'..');
const buildRoot = path.join(root,'.tmp_build');
const registryCjs = path.join(buildRoot,'src','events','executors','eventExecutors_registry.cjs');

async function loadRegistry(){
  if(!fs.existsSync(registryCjs)){
    console.error('Compiled registry not found at', registryCjs);
    return null;
  }
  const regDir = path.dirname(registryCjs);
  const transformed = path.join(regDir,'eventExecutors_registry.verify.cjs');
  const bridge = path.join(buildRoot,'__verify_bridge.mjs');
  const tempPkg = path.join(buildRoot,'package.json');
  let wroteTempPkg = false;
  try{
    // write transformed registry with .cjs appended to relative requires
    let src = fs.readFileSync(registryCjs,'utf8');
    src = src.replace(/require\((['\"])\.\/(eventExecutors_[^'\"\)]+)\1\)/g, "require('./$2.cjs')");
    fs.writeFileSync(transformed, src, 'utf8');
    // ensure build root package.json set to commonjs to avoid ESM treating .js files as ESM
    if(!fs.existsSync(tempPkg)){
      fs.writeFileSync(tempPkg, JSON.stringify({ type: 'commonjs' }), 'utf8');
      wroteTempPkg = true;
    }
  // create a CJS loader that patches alias resolution and requires the transformed registry
  const loaderPath = path.join(buildRoot,'__registry_loader.cjs');
  const loaderContent = `const Module = require('module');\nconst path = require('path');\nconst buildRoot = ${JSON.stringify(path.resolve(buildRoot))};\nconst orig = Module._resolveFilename;\nModule._resolveFilename = function(request, parent, isMain, options){\n  if(typeof request === 'string' && request.startsWith('@/')){\n    const rel = request.slice(2).replace(/\\\\/g,'/');\n    const target = path.join(buildRoot, 'src', rel);\n    return orig.call(this, target, parent, isMain, options);\n  }\n  return orig.call(this, request, parent, isMain, options);\n};\nmodule.exports = require(${JSON.stringify(path.resolve(transformed))});\n`;
  fs.writeFileSync(loaderPath, loaderContent, 'utf8');
  // create ESM bridge that requires the loader (which returns the registry)
  const bridgeContent = `import { createRequire } from 'module';\nconst require = createRequire(import.meta.url);\nconst reg = require(${JSON.stringify(path.resolve(loaderPath))});\nexport default reg;\n`;
  fs.writeFileSync(bridge, bridgeContent, 'utf8');
  const mod = await import(pathToFileURL(bridge).href);
    try{ fs.unlinkSync(bridge); }catch(e){}
  try{ fs.unlinkSync(transformed); }catch(e){}
  try{ fs.unlinkSync(loaderPath); }catch(e){}
  try{ if(wroteTempPkg) fs.unlinkSync(tempPkg); }catch(e){}
    return mod.default || mod;
  }catch(e){
    console.error('Failed to load compiled registry:', e && e.stack ? e.stack : e);
    try{ if(fs.existsSync(bridge)) fs.unlinkSync(bridge); }catch(_){}
    try{ if(fs.existsSync(transformed)) fs.unlinkSync(transformed); }catch(_){}
    try{ if(wroteTempPkg && fs.existsSync(tempPkg)) fs.unlinkSync(tempPkg); }catch(_){}
    return null;
  }
}

function readJSON(p){ return JSON.parse(fs.readFileSync(p,'utf8')) }

(async function(){
  const registry = await loadRegistry();
  if(!registry){ console.error('Could not load registry; aborting content verification'); process.exit(2); }

  // collect executor ids from act files
  const acts = ['act1_events.json','act2_events.json','act3_events.json','act4_events.json','act5_events.json','act6_events.json','act7_events.json']
    .map(f=>path.join(root,f)).filter(fs.existsSync);
  let ids = new Set();
  for(const a of acts){
    try{
      const j = readJSON(a);
      if(Array.isArray(j)) for(const e of j) if(e && e.executorId) ids.add(e.executorId);
    }catch(e){ console.error('Failed to read', a, e && e.message ? e.message : e); }
  }
  ids = Array.from(ids);
  console.log('Found', ids.length, 'unique executorIds in acts');

  const missing = [];
  for(const id of ids){
    const found = (registry.getExecutor && typeof registry.getExecutor === 'function' && registry.getExecutor(id)) || registry[id] || registry.default?.[id] || (registry.executors && registry.executors[id]);
    if(!found) missing.push(id);
  }

  if(missing.length){
    console.error('Missing executor implementations for', missing.length, 'ids:');
    missing.slice(0,200).forEach(m=>console.error('-',m));
    process.exit(2);
  }else{
    console.log('All executorIds referenced in act content have implementations in the compiled registry');
    process.exit(0);
  }

})();
