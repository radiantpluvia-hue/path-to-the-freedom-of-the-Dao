const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const IGNORED_PATHS = ['node_modules', '.git', 'dist', 'build', 'storybook', '.storybook', 'src/tests'];
let modifiedFiles = 0;

function shouldIgnore(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  if (!rel.startsWith('src/')) return false; // we only operate on src by default
  if (/\.stories?\./.test(rel)) return true;
  return IGNORED_PATHS.some(p => rel.includes(p));
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (IGNORED_PATHS.includes(e.name)) continue;
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
  // Match catch, optional paren with var name, then empty body (only whitespace/newlines)
  const re = /catch\s*(?:\(\s*([^)]+?)\s*\))?\s*\{\s*\}/gm;
  let changed = false;
  src = src.replace(re, (match, varName) => {
    const name = varName ? varName.trim() : 'e';
    changed = true;
    return `catch (${name}) { void ${name}; }`;
  });

  if (changed) {
    fs.writeFileSync(filePath, src, 'utf8');
    console.log('Patched', path.relative(ROOT, filePath));
    modifiedFiles++;
  }
}

console.log('Scanning src/ for empty catch blocks...');
walk(path.join(ROOT, 'src'));
console.log('Done. Modified files:', modifiedFiles);
process.exit(0);
