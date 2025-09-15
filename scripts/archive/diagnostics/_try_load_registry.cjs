const fs = require('fs');
const path = require('path');
const root = path.join(__dirname,'..','..');
const buildRoot = path.join(root,'.tmp_build');
const registryJs = path.join(buildRoot,'src','events','executors','eventExecutors_registry.js');
const registryCjs = registryJs.slice(0,-3)+'.cjs';
console.log('registryJs exists?', fs.existsSync(registryJs), registryJs);
console.log('registryCjs exists?', fs.existsSync(registryCjs), registryCjs);
let pkgType = null;
try{ const pkg = JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')); pkgType = pkg && pkg.type; }catch(e){console.error('pkg parse failed', e && e.message)}
console.log('package.json type:', pkgType);
(async()=>{
  if(pkgType === 'module'){
    try{
      const { pathToFileURL } = require('url');
      const abs = path.resolve(registryJs);
      console.log('attempting dynamic import of', abs);
      const mod = await import(pathToFileURL(abs).href);
      console.log('import succeeded:', Object.keys(mod).slice(0,10));
      return;
    }catch(e){
      console.error('dynamic import failed:');
      console.error(e && e.stack ? e.stack : e);
    }
    try{
      // ensure .cjs copy exists
      const srcdir = path.join(buildRoot,'src');
      // copy .js -> .cjs if needed
      function ensure(dir){ if(!fs.existsSync(dir)) return; for(const it of fs.readdirSync(dir)){ const p=path.join(dir,it); const st=fs.statSync(p); if(st.isDirectory()) ensure(p); else if(p.endsWith('.js')){ const dest=p.slice(0,-3)+'.cjs'; if(!fs.existsSync(dest)) fs.copyFileSync(p,dest); } } }
      ensure(srcdir);
      console.log('after ensure, registryCjs exists?', fs.existsSync(registryCjs));
      const absCjs = path.resolve(registryCjs);
      console.log('attempting require of', absCjs);
      const r = require(absCjs);
      console.log('require cjs succeeded, keys:', Object.keys(r).slice(0,10));
      return;
    }catch(e){ console.error('require cjs failed:', e && e.stack ? e.stack : e); }
  } else {
    try{ console.log('attempting require js', registryJs); const r=require(registryJs); console.log('require js ok', Object.keys(r).slice(0,10)); return;}catch(e){ console.error('require js failed:', e && e.stack ? e.stack : e); }
  }
  console.log('All attempts failed');
})();
