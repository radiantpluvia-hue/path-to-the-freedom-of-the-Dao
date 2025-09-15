const fs = require('fs');
const path = require('path');
const root = path.join(__dirname,'..','..');
const buildRoot = path.join(root,'.tmp_build');
const registryPath = path.join(buildRoot,'src','events','executors','eventExecutors_registry.js');
const registryCjs = registryPath.slice(0,-3)+'.cjs';
console.log('registryPath', registryPath);
console.log('exists .js', fs.existsSync(registryPath));
console.log('registryCjs', registryCjs);
console.log('exists .cjs', fs.existsSync(registryCjs));
try{
  if(fs.existsSync(registryCjs)){
    console.log('requiring cjs...');
    require(registryCjs);
    console.log('required cjs OK');
  } else if(fs.existsSync(registryPath)){
    console.log('requiring js...');
    require(registryPath);
    console.log('required js OK');
  } else {
    console.log('no registry files found');
  }
}catch(e){console.error('require failed:', e && e.message ? e.message : e); process.exit(3);} 
