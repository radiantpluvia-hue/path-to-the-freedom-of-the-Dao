#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { chooseByAffinity, simulateEventSelection, seededRng } = require('../src/utils/eventSimulator');

function usage() {
  console.log('Usage: node scripts/simulateEvent.cjs <template.json> <affinitiesCommaSeparated> [trials]');
  process.exit(1);
}

if (process.argv.length < 4) usage();
const tplPath = path.resolve(process.argv[2]);
const affinities = process.argv[3].split(',').map(s => Number(s.trim()));
const trials = Number(process.argv[4] || 1000);

let data;
try { data = JSON.parse(fs.readFileSync(tplPath, 'utf8')); } catch (e) { console.error('Failed to read template:', e.message); process.exit(2); }
const event = Array.isArray(data) ? data[0] : (data.events && data.events[0]);
if (!event) { console.error('No event found in template'); process.exit(3); }

affinities.forEach((a, i) => {
  const counts = simulateEventSelection(event, a, trials, seededRng(1000 + i));
  console.log(`Affinity ${a}:`);
  console.log(counts);
});
