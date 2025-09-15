const path = require('path');
const fs = require('fs');

function runCheckAsCjs(argv){
  const script = Array.isArray(argv) ? argv[0] : argv;
  if(!script){ console.error('Usage: node run_check_as_cjs.cjs <script>'); process.exit(2); }
  const root = path.join(__dirname,'..','..');
  const buildRoot = path.join(root,'.tmp_build');
  module.paths.unshift(buildRoot);
  try{
    const target = path.join(root, script);
    if(!fs.existsSync(target)){
      console.error('Script not found:', target); process.exit(2);
    }
    require(target);
  }catch(e){ console.error(e && e.stack ? e.stack : e); process.exit(1); }
}

if(require.main === module){ runCheckAsCjs(process.argv.slice(2)); }

module.exports = { runCheckAsCjs };
