#!/usr/bin/env node
// Simple replay runner: reads a replay JSON and prints actions; future: re-execute actions
const fs = require('fs');
const path = require('path');
if (process.argv.length < 3) {
  console.error('Usage: node replayRunner.js <replay-file>');
  process.exit(2);
}
const file = path.resolve(process.cwd(), process.argv[2]);
if (!fs.existsSync(file)) {
  console.error('File not found:', file);
  process.exit(2);
}
const content = fs.readFileSync(file, 'utf8');
const obj = JSON.parse(content);
console.log('Replaying:', file);
console.log('Seed:', obj.seed);
console.log('Actions:', obj.actions && obj.actions.length);
for (const a of (obj.actions || [])) {
  console.log('-', a.type || JSON.stringify(a));
}
