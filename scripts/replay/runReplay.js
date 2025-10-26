#!/usr/bin/env node
const path = require('path');
const rp = require('./ReplayPlayer.cjs');
if (process.argv.length < 3) {
  console.error('Usage: node runReplay.js <replay-file>');
  process.exit(2);
}
rp.runReplayFile(process.argv[2]);
