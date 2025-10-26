'use strict';
const fs = require('fs');
const path = require('path');
const filePath = path.resolve(__dirname, '../src/data/cultivationRealms.ts');
let src = fs.readFileSync(filePath, 'utf8');

function extractRealmOrder(text) {
  const m = text.match(/export const REALM_ORDER = \[([\s\S]*?)\];/);
  if (!m) return [];
  const body = m[1];
  const matches = [...body.matchAll(/'([^']+)'/g)];
  return matches.map(m => m[1]);
}

const order = extractRealmOrder(src);
if (!order.length) {
  console.error('Could not find REALM_ORDER in file');
  process.exit(1);
}

// Compute qiRequirement by smooth exponential scaling from mortal=8000
const base = 8000;
const qiFor = {};
for (let i = 0; i < order.length; i++) {
  // scale factor: 10^(i/10) produces ~10x every 10 steps
  const qi = Math.round(base * Math.pow(10, i / 10));
  qiFor[order[i]] = qi;
}

// Also handle any realms present in CULTIVATION_REALMS but not in order (leave them as-is)

// Replace occurrences of "qiRequirement: 0" for keys that we computed
let replacements = 0;
for (const [realm, qi] of Object.entries(qiFor)) {
  // Replace first occurrence of "<realm>: { ... qiRequirement: 0" with the qi
  // We use a regex that searches for the property block starting with the key
  const re = new RegExp("(" + realm.replace(/[-\\^$*+?.()|[\]{}]/g,'\\$&') + "\\s*:\\s*\\{[\\s\\S]*?qiRequirement\\s*:\\s*)0(\\s*,)");
  const before = src;
  src = src.replace(re, (m0, p1, p2) => {
    replacements++;
    return p1 + qi + p2;
  });
}

fs.writeFileSync(filePath, src, 'utf8');
console.log('Wrote', replacements, 'qiRequirement replacements to', filePath);
