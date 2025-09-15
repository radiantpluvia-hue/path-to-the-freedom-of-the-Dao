const fs = require('fs');
const path = require('path');
const Module = require('module');

function loadWithAliases(filePath, buildRoot){
  const src = fs.readFileSync(filePath,'utf8');
  const dir = path.dirname(filePath);
  // Replace require('@/...') -> require('<relative to file>') where @/ maps to buildRoot/src/
  const transformed = src.replace(/require\((['"]?)@\/([^'"\)]+)\1\)/g, (m, q, spec) => {
    const targetBase = path.join(buildRoot, 'src', spec);
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
    let rel = path.relative(dir, targetToUse);
    if(!rel.startsWith('.') && !rel.startsWith('/')) rel = './' + rel;
    rel = rel.split('\\').join('/');
    return `require(${JSON.stringify(rel)})`;
  });
  const m = new Module(filePath);
  m.paths = Module._nodeModulePaths(dir);
  m._compile(transformed, filePath);
  return m.exports;
}

module.exports = { loadWithAliases };
