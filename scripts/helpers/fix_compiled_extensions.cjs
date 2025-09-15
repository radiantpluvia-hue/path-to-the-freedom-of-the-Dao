const fs = require('fs');
const path = require('path');
const root = path.join(__dirname,'..','..');
const buildRoot = path.join(root,'.tmp_build');
const start = path.join(buildRoot,'src');
if(!fs.existsSync(start)){
  console.error('No build src found at', start); process.exit(2);
}
const changed = [];
function renameRec(dir){
  for(const it of fs.readdirSync(dir)){
    const p = path.join(dir,it);
    const st = fs.statSync(p);
    if(st.isDirectory()) renameRec(p);
    else if(st.isFile() && p.endsWith('.js')){
      const dest = p.slice(0,-3)+'.cjs';
      try{ fs.renameSync(p,dest); changed.push({from:p,to:dest}); }catch(e){ console.error('rename failed',p,e.message); }
    }
  }
}
try{ renameRec(start); console.log('Renamed', changed.length, '.js files to .cjs'); }catch(e){ console.error('Error during rename', e && e.message); process.exit(3); }
console.log('Done');

module.exports = { run: () => {} };
