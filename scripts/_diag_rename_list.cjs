const fs = require('fs');
const path = require('path');
const root = path.join(__dirname,'..');
const buildRoot = path.join(root,'.tmp_build');
const src = path.join(buildRoot,'src','events','executors');
let moved = [];
function renameJsToCjs(dir){
  if(!fs.existsSync(dir)) return;
  for(const it of fs.readdirSync(dir)){
    const p = path.join(dir,it);
    const st = fs.statSync(p);
    if(st.isDirectory()) renameJsToCjs(p);
    else if(st.isFile() && p.endsWith('.js')){
      const dest = p.slice(0,-3)+'.cjs';
      try{ fs.renameSync(p,dest); moved.push({from:dest,to:p}); }catch(e){console.error('rename failed',p,e.message)}
    }
  }
}
renameJsToCjs(src);
console.log('After rename:'); console.log(fs.readdirSync(src));
for(const m of moved){ try{ fs.renameSync(m.from,m.to); }catch(e){console.error('restore failed',m.from,e.message)} }
console.log('Restored'); console.log(fs.readdirSync(src));
