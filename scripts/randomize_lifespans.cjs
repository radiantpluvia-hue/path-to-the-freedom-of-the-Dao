'use strict';
const fs = require('fs');
const path = require('path');
const filePath = path.resolve(__dirname, '../src/data/cultivationRealms.ts');
let src = fs.readFileSync(filePath, 'utf8');

function extractAllRealmKeys(text) {
  // find keys in the main CULTIVATION_REALMS and in Object.assign fallback
  const keys = new Set();
  const mainMatch = text.match(/export const CULTIVATION_REALMS[\s\S]*?=\s*\{([\s\S]*?)\};/);
  if (mainMatch) {
    const body = mainMatch[1];
    const m = [...body.matchAll(/(^|\s)([a-z0-9_]+)\s*:\s*\{/gmi)];
    m.forEach(x => keys.add(x[2]));
  }
  // Object.assign keys
  const assignMatch = text.match(/Object\.assign\(CULTIVATION_REALMS,\s*\{([\s\S]*?)\}\)/m);
  if (assignMatch) {
    const body = assignMatch[1];
    const m = [...body.matchAll(/(^|\s)'?([a-z0-9_]+)'?\s*:\s*\{/gmi)];
    m.forEach(x => keys.add(x[2]));
  }
  return Array.from(keys);
}

const keys = extractAllRealmKeys(src);
if (!keys.length) {
  console.error('No realm keys found');
  process.exit(1);
}

let replacements = 0;
const changes = [];
for (const realm of keys) {
  // find lifespanBonus in that realm block
  const re = new RegExp('(' + realm.replace(/[-\\^$*+?.()|[\]{}]/g,'\\$&') + "\\s*:\\s*\\{[\\s\\S]*?lifespanBonus\\s*:\\s*)([0-9]+)(\\s*,)", 'm');
  const m = src.match(re);
  if (m) {
    const oldVal = parseInt(m[2], 10);
    const maxNew = Math.max(10, Math.floor(oldVal / 10));
    // choose random between 10 and maxNew inclusive
    const newVal = Math.floor(Math.random() * (maxNew - 10 + 1)) + 10;
    src = src.replace(re, (s, p1, p2, p3) => {
      replacements++;
      changes.push({ realm, oldVal, newVal });
      return p1 + newVal + p3;
    });
  }
}

fs.writeFileSync(filePath, src, 'utf8');
console.log('Randomized', replacements, 'lifespanBonus entries. Sample changes:');
console.log(changes.slice(0, 20));
