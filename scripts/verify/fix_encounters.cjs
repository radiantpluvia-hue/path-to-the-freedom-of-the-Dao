#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '..', '..', 'src', 'data', 'encounter_narratives.json');
if (!fs.existsSync(file)) {
  console.error('No encounter_narratives.json found to fix.');
  process.exit(0);
}

let data = JSON.parse(fs.readFileSync(file, 'utf8'));
let changed = false;
for (const k of Object.keys(data)) {
  const t = data[k];
  if (!t.id) { t.id = k; changed = true; }
  if (!Array.isArray(t.choices)) { t.choices = []; changed = true; }
  for (const c of t.choices) {
    if (!c.id) { c.id = `choice_${Math.random().toString(36).slice(2,8)}`; changed = true; }
    if (!c.text) { c.text = 'Option'; changed = true; }
    if (!c.consequence) { c.consequence = 'peace'; changed = true; }
    if (!c.reward) c.reward = null;
  }
  if (!Array.isArray(t.loot)) { t.loot = []; changed = true; }
}

if (changed) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  console.log('Fixed and updated encounter_narratives.json');
} else {
  console.log('No changes required.');
}
