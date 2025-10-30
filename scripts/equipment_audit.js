const fs = require('fs');
const path = require('path');

function extractArrayLiteral(content) {
  const eq = content.indexOf('=');
  const start = content.indexOf('[', eq);
  if (start === -1) return null;
  let i = start; let depth = 0; let inString = false; let stringChar = null;
  while (i < content.length) {
    const ch = content[i];
    if (inString) {
      if (ch === '\\') { i += 2; continue; }
      if (ch === stringChar) { inString = false; stringChar = null; }
      i++; continue;
    }
    if (ch === '"' || ch === "'") { inString = true; stringChar = ch; i++; continue; }
    if (ch === '[') depth++; else if (ch === ']') { depth--; if (depth === 0) return content.substring(start, i+1); }
    i++;
  }
  return null;
}

function parseArray(text) {
  try { const fn = new Function('return ' + text + ';'); return fn(); } catch (e) { return null; }
}

const p = path.join(__dirname, '..', 'src', 'data', 'equipment_full.ts');
const src = fs.readFileSync(p, 'utf8');
const arrText = extractArrayLiteral(src);
if (!arrText) { console.error('no array literal found'); process.exit(2); }
const arr = parseArray(arrText);
if (!arr) { console.error('failed to parse array'); process.exit(2); }

console.log('Total items:', arr.length);
const defaults = [];
for (const it of arr) {
  const missing = [];
  if (!it.tier || it.tier === 'F') missing.push('tier');
  if (!it.description || it.description === '') missing.push('description');
  if (typeof it.basePower === 'undefined' || it.basePower === 0) missing.push('basePower');
  if (missing.length) defaults.push({ id: it.id, missing });
}

console.log('Items with auto-filled defaults (sample up to 200):', defaults.length);
console.log(defaults.slice(0,200).map(d => `${d.id}: ${d.missing.join(', ')}`).join('\n'));
