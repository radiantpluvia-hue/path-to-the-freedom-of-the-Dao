const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', '..');
const buildRoot = path.join(root, '.tmp_build');

function walk(dir){
  if(!fs.existsSync(dir)) return [];
  const out = [];
  for(const it of fs.readdirSync(dir)){
    const p = path.join(dir,it);
    const st = fs.statSync(p);
    if(st.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const files = walk(buildRoot);
for(const f of files){
  if(f.endsWith('.js')){
    try{
      const dest = f.slice(0,-3)+'.cjs';
      fs.copyFileSync(f,dest);
    }catch(e){ /* ignore */ }
  }
}
console.log('Copied .js -> .cjs for', files.filter(f=>f.endsWith('.js')).length, 'files');

module.exports = { run: () => {} };
