const fs = require('fs');
const path = require('path');
const { loadWithAliases } = require('./helpers/require_with_aliases.cjs');

const rel = process.argv[2] || 'src/events/executors/eventExecutors_global.js';
const root = path.join(__dirname,'..');
const buildRoot = path.join(root,'.tmp_build');
const file = path.join(buildRoot, rel);
console.log('Testing file:', file);
if(!fs.existsSync(file)){ console.error('File not found:', file); process.exit(2); }

// Read original source
const src = fs.readFileSync(file,'utf8');
console.log('\n--- Original snippet ---');
console.log(src.split('\n').slice(0,40).join('\n'));

// Use the same replacement logic as require_with_aliases to compute transformed
const dir = path.dirname(file);
const buildRootSrc = buildRoot;
const transformed = src.replace(/require\((['"]?)@\/([^'"\)]+)\1\)/g, (m, q, spec) => {
  const targetBase = path.join(buildRootSrc, 'src', spec);
  const candidates = [
    targetBase + '.cjs',
    targetBase + '.js',
    path.join(targetBase, 'index.cjs'),
    path.join(targetBase, 'index.js')
  ];
  let resolved = null;
  for (const c of candidates) if (fs.existsSync(c)) { resolved = c; break; }
  if (!resolved && fs.existsSync(targetBase) && fs.statSync(targetBase).isDirectory()){
    for (const c of [path.join(targetBase,'index.cjs'), path.join(targetBase,'index.js')]) if(fs.existsSync(c)){ resolved = c; break; }
  }
  const targetToUse = resolved || targetBase;
  let relp = path.relative(dir, targetToUse);
  if(!relp.startsWith('.') && !relp.startsWith('/')) relp = './' + relp;
  relp = relp.split('\\').join('/');
  console.log('Alias spec:', spec, '-> resolved:', targetToUse, '-> rel:', relp);
  return `require(${JSON.stringify(relp)})`;
});

console.log('\n--- Transformed snippet ---');
console.log(transformed.split('\n').slice(0,40).join('\n'));

// Check resolved target exists
// find the first resolved path printed above (simple parse)
const match = transformed.match(/require\((['"])([^'\"]+)\1\)/);
if(match){ const p = path.resolve(dir, match[2]); console.log('\nComputed absolute path for first require:', p, 'exists?', fs.existsSync(p)); }

// Try to load using loadWithAliases to surface the same error
try{
  const exp = loadWithAliases(file, buildRoot);
  console.log('\nLoaded exports keys:', Object.keys(exp).slice(0,40));
}catch(e){
  console.error('\nloadWithAliases failed:', e && e.stack || e);
  process.exit(3);
}
