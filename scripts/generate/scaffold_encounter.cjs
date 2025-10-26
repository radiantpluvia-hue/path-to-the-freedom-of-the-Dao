#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const outDir = path.resolve(__dirname, '..', '..', 'src', 'data');
const outFile = path.join(outDir, 'encounter_narratives.json');

const argv = process.argv.slice(2);
const id = argv[0] || `enc_${Date.now()}`;

const template = {
  id,
  title: 'New Encounter',
  body: 'Describe the encounter here.',
  choices: [
    { id: 'fight', text: 'Fight', consequence: 'combat' },
    { id: 'leave', text: 'Leave', consequence: 'escape' }
  ],
  ai: { preferredTechniques: [], openingBias: false }
};

try {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  let data = {};
  if (fs.existsSync(outFile)) {
    data = JSON.parse(fs.readFileSync(outFile, 'utf8'));
  }
  data[id] = template;
  fs.writeFileSync(outFile, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Scaffolded encounter ${id} into ${outFile}`);
} catch (e) {
  console.error('Failed to scaffold encounter', e);
  process.exit(2);
}
