// Smoke test that runs against compiled JS output under .tmp_build
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname,'..');
const buildRoot = path.join(root,'.tmp_build');
const registryPath = path.join(buildRoot,'src','events','executors','eventExecutors_registry.js');
let registry = null;

function ensureCjsCopies(dir){
  if(!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for(const it of items){
    const p = path.join(dir,it);
    const st = fs.statSync(p);
    if(st.isDirectory()) ensureCjsCopies(p);
    else if(st.isFile() && p.endsWith('.js')){
      const dest = p.slice(0,-3)+'.cjs';
      try{ fs.copyFileSync(p,dest); }catch(e){ /* ignore */ }
    }
  }
}

async function loadCompiledRegistry(){
  if(!fs.existsSync(buildRoot)){
    console.warn('Compiled build root not found at', buildRoot);
    return null;
  }
  const registryJs = registryPath;
  const registryCjs = registryPath.slice(0,-3)+'.cjs';

  // If the project uses ESM modules, try dynamic import first.
  let pkgType = null;
  try{ const pkg = JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')); pkgType = pkg && pkg.type; }catch(e){}

  if(pkgType === 'module'){
    try{
      const { pathToFileURL } = require('url');
      const abs = path.resolve(registryJs);
      const fileUrl = pathToFileURL(abs).href;
      // If a .cjs copy exists, prefer using the CJS bridge path (avoid dynamic import of .js files that may contain CommonJS require() calls)
      if(fs.existsSync(registryCjs)){
        // Create a transformed registry file that appends .cjs to relative requires for
        // eventExecutors_* modules so CommonJS resolution finds the .cjs files.
        const regDir = path.dirname(registryCjs);
        const transformedName = 'eventExecutors_registry.eval.cjs';
        const transformedPath = path.join(regDir, transformedName);
        try{
          // Ensure the build root has a package.json forcing CommonJS so .js files
          // inside the compiled tree are treated as CommonJS by the loader.
          const tempPkg = path.join(buildRoot,'package.json');
          let wroteTempPkg = false;
          try{
            if(!fs.existsSync(tempPkg)){
              fs.writeFileSync(tempPkg, JSON.stringify({ type: 'commonjs' }), 'utf8');
              wroteTempPkg = true;
            }
          }catch(e){ /* ignore */ }

          // Create .js copies of any .cjs files so bare require('./foo') can resolve to foo.js
          const createdJs = [];
          function ensureJsCopies(dir){
            if(!fs.existsSync(dir)) return;
            const items = fs.readdirSync(dir);
            for(const it of items){
              const p = path.join(dir,it);
              const st = fs.statSync(p);
              if(st.isDirectory()) ensureJsCopies(p);
              else if(st.isFile() && p.endsWith('.cjs')){
                const dest = p.slice(0,-4)+'.js';
                try{ fs.copyFileSync(p,dest); createdJs.push(dest); }catch(e){ /* ignore */ }
              }
            }
          }
          try{ ensureJsCopies(path.join(buildRoot,'src')); }catch(e){}

          let src = fs.readFileSync(registryCjs,'utf8');
          // Replace require('./eventExecutors_xyz') -> require('./eventExecutors_xyz.cjs')
          src = src.replace(/require\((['"])\.\/(eventExecutors_[^'"\)]+)\1\)/g, "require('./$2.cjs')");
          // Replace alias requires like require('@/systems') -> relative path to compiled .tmp_build/src/systems/index.cjs (or .cjs/.js)
          src = src.replace(/require\((['"])@\/([^'"\)]+)\1\)/g, (m, q, spec) => {
            try{
              const targetBase = path.join(buildRoot, 'src', spec);
              const candidates = [
                targetBase + '.cjs',
                targetBase + '.js',
                path.join(targetBase, 'index.cjs'),
                path.join(targetBase, 'index.js')
              ];
              let resolved = null;
              for(const c of candidates) if(fs.existsSync(c)) { resolved = c; break; }
              const targetToUse = resolved || targetBase;
              let rel = path.relative(regDir, targetToUse);
              if(!rel.startsWith('.') && !rel.startsWith('/')) rel = './' + rel;
              rel = rel.split('\\').join('/');
              return `require(${JSON.stringify(rel)})`;
            }catch(e){ return m; }
          });
          fs.writeFileSync(transformedPath, src, 'utf8');

          const bridgePath = path.join(buildRoot,'__registry_bridge.mjs');
          const absTransformed = path.resolve(transformedPath);
          const bridgeContent = `import { createRequire } from 'module';\nconst require = createRequire(import.meta.url);\nconst reg = require(${JSON.stringify(absTransformed)});\nexport default reg;\n`;
          fs.writeFileSync(bridgePath, bridgeContent, 'utf8');
          const bridgeUrl = pathToFileURL(bridgePath).href;
          const mod = await import(bridgeUrl);
          try{ fs.unlinkSync(bridgePath); }catch(e){}
          try{ fs.unlinkSync(transformedPath); }catch(e){}
          try{ if(wroteTempPkg) fs.unlinkSync(tempPkg); }catch(e){}
          try{ for(const f of createdJs) if(fs.existsSync(f)) fs.unlinkSync(f); }catch(e){}
          return mod.default || mod;
        }catch(e){ console.error('Failed to import transformed CJS registry via ESM bridge:', e && e.stack ? e.stack : e); try{ if(fs.existsSync(transformedPath)) fs.unlinkSync(transformedPath); }catch(_){} try{ if(fs.existsSync(path.join(buildRoot,'__registry_bridge.mjs'))) fs.unlinkSync(path.join(buildRoot,'__registry_bridge.mjs')); }catch(_){} }
      }
    }catch(eImport){
      console.error('Unexpected error preparing to import registry:', eImport && eImport.stack ? eImport.stack : eImport);
    }
  } else {
    // Not a module project; try requiring compiled artifacts (create .cjs copies as safe fallback)
    try{
      ensureCjsCopies(path.join(buildRoot,'src'));
      const absCjs = path.resolve(registryCjs);
      const absJs = path.resolve(registryJs);
      if(fs.existsSync(absCjs)) return require(absCjs);
      if(fs.existsSync(absJs)) return require(absJs);
    }catch(e){ console.error('Failed to require compiled registry:', e && e.stack ? e.stack : e); }
  }
  return null;
}

function readJSON(p){return JSON.parse(fs.readFileSync(p,'utf8'))}
const acts = ['act1_events.json','act2_events.json','act3_events.json','act4_events.json'].map(f=>path.join(root,f)).filter(fs.existsSync);
let ids = new Set();
for(const a of acts){
  const j = readJSON(a);
  if(Array.isArray(j)) for(const e of j) if(e && e.executorId) ids.add(e.executorId);
}
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

;(async function(){
  const failures = [];
  registry = await loadCompiledRegistry();

  if(registry){
    for(const id of ids){
      const exec = registry.getExecutor ? registry.getExecutor(id) : (registry[id] || (()=>{}));
      if(!exec){ failures.push(`Missing executor function for id ${id}`); continue; }
      try{
                    const bridgeContent = `import { createRequire } from 'module';\nconst require = createRequire(import.meta.url);\nconst reg = require(${JSON.stringify(absTransformed)});\nexport default reg;\n`;
        const s2 = exec(s1, 'sample_choice');
        if(!s2){ failures.push(`Executor ${id} returned falsy state on second run`); }
      }catch(e){ failures.push(`Executor ${id} threw: ${e && e.message ? e.message : String(e)}`); }
    }
  } else {
    failures.push('No compiled registry available to run executors');
  }

  console.log('Compiled smoke test run for', ids.length, 'executors');
  if(failures.length){ console.error('Failures:'); failures.slice(0,200).forEach(f=>console.error('-',f)); process.exit(2); }
  else { console.log('All compiled smoke checks passed'); process.exit(0); }
})();
