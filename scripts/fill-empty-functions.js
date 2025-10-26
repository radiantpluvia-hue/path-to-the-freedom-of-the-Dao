const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const IGNORED_DIRS = ['node_modules', '.git', 'dist', '.tmp_build', '.storybook', 'stories'];

function shouldIgnore(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  // skip tests and stories
  if (!rel.startsWith('src/')) return true;
  if (/src\/(test|tests|__tests__|tests?)/.test(rel)) return true;
  if (/\.stories?\./.test(rel)) return true;
  return IGNORED_DIRS.some(d => rel.includes(`/${d}/`));
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (IGNORED_DIRS.includes(e.name)) continue;
      walk(full);
    } else if (e.isFile()) {
      if (shouldProcessFile(full)) processFile(full);
    }
  }
}

function shouldProcessFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext !== '.ts' && ext !== '.tsx' && ext !== '.js' && ext !== '.jsx') return false;
  if (shouldIgnore(filePath)) return false;
  return true;
}

function processFile(filePath) {
  let src = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Replace arrow empty bodies: `=> {}` -> `=> { void 0; }`
  const arrowRe = /=>\s*\{\s*\}/g;
  if (arrowRe.test(src)) {
    src = src.replace(arrowRe, '=> { void 0; }');
    changed = true;
  }

  // Replace small async arrow empty: `async () => {}` (covered by previous regex but keep for safety)
  const asyncArrowRe = /async\s*\([\s\S]*?\)\s*=>\s*\{\s*\}/g;
  if (asyncArrowRe.test(src)) {
    src = src.replace(asyncArrowRe, match => match.replace(/\{\s*\}/, '{ void 0; }'));
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, src, 'utf8');
    console.log('Patched', path.relative(ROOT, filePath));
  }
}

console.log('Scanning src/ for empty arrow functions...');
walk(path.join(ROOT, 'src'));
console.log('Done.');
process.exit(0);
