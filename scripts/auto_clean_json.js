const fs = require('fs');
const path = require('path');
const glob = require('glob');

const workspace = process.cwd();
const ignoreDirs = ['node_modules', '.git', 'tmp', 'reports', '.tmp_build', 'dist', 'build'];

function isIgnored(file) {
  return ignoreDirs.some(d => file.includes(path.sep + d + path.sep));
}

function makeBak(file) {
  const bak = file + '.bak';
  if (!fs.existsSync(bak)) {
    try { fs.copyFileSync(file, bak); } catch (e) { /* ignore */ }
  }
}

function stripControlChars(s) {
  // keep common whitespace \r\n\t and printable characters
  return s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

function stripCommentsAndTrailingCommas(s) {
  // remove BOM
  if (s.charCodeAt(0) === 0xFEFF) s = s.slice(1);
  // remove block comments
  s = s.replace(/\/\*[\s\S]*?\*\//g, '');
  // remove line comments
  s = s.replace(/(^|\n)\s*\/\/.*(?=\n|$)/g, '\n');
  // remove trailing commas before } or ]
  s = s.replace(/,\s*(?=[}\]])/g, '');
  return s;
}

function tryParse(raw) {
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch (e) {
    return { ok: false, err: e };
  }
}

const pattern = '**/*.+(json|jsonc)';
const files = glob.sync(pattern, { cwd: workspace, nodir: true, absolute: true });

const toProcess = files.filter(f => !isIgnored(f) && !f.endsWith('.bak'));

const changed = [];
const failed = [];

for (const file of toProcess) {
  let raw;
  try { raw = fs.readFileSync(file, 'utf8'); } catch (e) { failed.push({ file, reason: 'read-failed' }); continue; }
  if (raw.trim().length === 0) {
    // empty file — write a safe placeholder based on heuristics
    makeBak(file);
    if (file.includes(path.sep + 'data' + path.sep + 'events') || file.includes(path.sep + 'events' + path.sep) || file.includes(path.sep + 'public' + path.sep + 'story')) {
      fs.writeFileSync(file, '/* placeholder */\n[]', 'utf8');
      changed.push({ file, reason: 'empty->events-array' });
      continue;
    } else if (file.includes(path.sep + 'data' + path.sep + 'mentors') || file.includes(path.sep + 'data' + path.sep + 'quests') || file.includes(path.sep + 'src' + path.sep + 'data')) {
      fs.writeFileSync(file, '{}', 'utf8');
      changed.push({ file, reason: 'empty->object' });
      continue;
    } else {
      fs.writeFileSync(file, '{}', 'utf8');
      changed.push({ file, reason: 'empty->object-generic' });
      continue;
    }
  }

  // Try parsing raw first
  let parsed = tryParse(raw);
  if (parsed.ok) continue; // valid JSON already

  // attempt cleaning
  let cleaned = stripControlChars(raw);
  cleaned = stripCommentsAndTrailingCommas(cleaned);

  parsed = tryParse(cleaned);
  if (parsed.ok) {
    try {
      makeBak(file);
      // write cleaned content (preserve newline at end)
      fs.writeFileSync(file, cleaned.replace(/\r?\n$/, '') + '\n', 'utf8');
      changed.push({ file, reason: 'cleaned-comments-trailing-commas' });
      continue;
    } catch (e) {
      failed.push({ file, reason: 'write-failed', error: String(e) });
      continue;
    }
  }

  // If still failing, try a final aggressive fallback: remove any non-ascii control sequences and try again
  let aggressive = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  parsed = tryParse(aggressive);
  if (parsed.ok) {
    try { makeBak(file); fs.writeFileSync(file, aggressive.replace(/\r?\n$/, '') + '\n', 'utf8'); changed.push({ file, reason: 'aggressive-clean' }); continue; } catch (e) { failed.push({ file, reason: 'write-failed', error: String(e) }); continue; }
  }

  // leave file untouched but record failure (bak may exist)
  failed.push({ file, reason: 'parse-failed' });
}

console.log(JSON.stringify({ total: toProcess.length, changed, failed }, null, 2));
