const fs = require('fs');
const path = require('path');

const workspace = process.cwd();
const targets = [
  '.eslintrc.json',
  '.eslint-output.json',
  'tsconfig.cjs.json',
  'tsconfig.executors.json',
  'tsconfig.jest.json',
  'tsconfig.json',
  'tsconfig.node.json'
].map(p => path.join(workspace, p));

function makeBak(file) {
  const bak = file + '.bak';
  if (!fs.existsSync(bak)) {
    try { fs.copyFileSync(file, bak); } catch (e) { /* ignore */ }
  }
}

function stripCommentsAndTrailingCommas(s) {
  if (!s) return s;
  if (s.charCodeAt(0) === 0xFEFF) s = s.slice(1);
  s = s.replace(/\/\*[\s\S]*?\*\//g, '');
  s = s.replace(/(^|\n)\s*\/\/.*(?=\n|$)/g, '\n');
  s = s.replace(/,\s*(?=[}\]])/g, '');
  return s;
}

function tryParse(raw) {
  try { return { ok: true, value: JSON.parse(raw) }; } catch (e) { return { ok: false, err: e }; }
}

const changed = [];
const failed = [];

for (const file of targets) {
  if (!fs.existsSync(file)) { failed.push({ file, reason: 'missing' }); continue; }
  let raw;
  try { raw = fs.readFileSync(file, 'utf8'); } catch (e) { failed.push({ file, reason: 'read-failed' }); continue; }

  // Special-case: .eslint-output.json is not JSON (it's an ESLint human report). Replace with empty object.
  if (path.basename(file) === '.eslint-output.json') {
    makeBak(file);
    try { fs.writeFileSync(file, JSON.stringify({}, null, 2) + '\n', 'utf8'); changed.push({ file, reason: 'replaced-nonjson-with-object' }); } catch (e) { failed.push({ file, reason: 'write-failed', error: String(e) }); }
    continue;
  }

  // Try parsing as-is
  let parsed = tryParse(raw);
  if (parsed.ok) { changed.push({ file, reason: 'already-valid' }); continue; }

  // Clean comments/trailing commas
  const cleaned = stripCommentsAndTrailingCommas(raw);
  parsed = tryParse(cleaned);
  if (parsed.ok) {
    try { makeBak(file); fs.writeFileSync(file, JSON.stringify(parsed.value, null, 2) + '\n', 'utf8'); changed.push({ file, reason: 'cleaned-and-pretty' }); } catch (e) { failed.push({ file, reason: 'write-failed', error: String(e) }); }
    continue;
  }

  // If still fails, attempt control-char strip
  const aggressive = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  parsed = tryParse(aggressive);
  if (parsed.ok) {
    try { makeBak(file); fs.writeFileSync(file, JSON.stringify(parsed.value, null, 2) + '\n', 'utf8'); changed.push({ file, reason: 'aggressive-clean' }); } catch (e) { failed.push({ file, reason: 'write-failed', error: String(e) }); }
    continue;
  }

  failed.push({ file, reason: 'parse-failed' });
}

console.log(JSON.stringify({ changed, failed }, null, 2));
