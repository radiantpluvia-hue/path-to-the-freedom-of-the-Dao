#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function findJsonFiles(dir) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.git') continue;
      out.push(...findJsonFiles(full));
    } else if (e.isFile() && (e.name.endsWith('.json') || e.name.endsWith('.jsonc'))) {
      out.push(full);
    }
  }
  return out;
}

function extractIdsFromJson(file) {
  try {
    const raw = fs.readFileSync(file, 'utf8');
    // allow trailing commas / comments by stripping simple JS comments
    const cleaned = raw.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    const data = JSON.parse(cleaned);
    const ids = [];
    function walk(node) {
      if (!node) return;
      if (Array.isArray(node)) return node.forEach(walk);
      if (typeof node === 'object') {
        if ('id' in node && typeof node.id === 'string') ids.push({ id: node.id, file });
        for (const k of Object.keys(node)) walk(node[k]);
      }
    }
    walk(data);
    return ids;
  } catch (e) {
    return { error: e.message };
  }
}

function main() {
  console.log('Scanning for JSON files...');
  const files = findJsonFiles(root);
  console.log(`Found ${files.length} JSON files`);

  const idMap = new Map();
  const errors = [];

  for (const f of files) {
    const res = extractIdsFromJson(f);
    if (res && res.error) {
      errors.push({ file: f, error: res.error });
      continue;
    }
    for (const item of res) {
      if (!item.id || item.id.trim() === '') {
        errors.push({ file: f, error: 'missing-empty-id' });
        continue;
      }
      if (!idMap.has(item.id)) idMap.set(item.id, []);
      idMap.get(item.id).push(item.file);
    }
  }

  const duplicates = [];
  for (const [id, files] of idMap.entries()) {
    if (files.length > 1) duplicates.push({ id, files });
  }

  if (errors.length === 0 && duplicates.length === 0) {
    console.log('No missing or duplicate ids found. ✅');
    process.exit(0);
  }

  if (errors.length) {
    console.error('Errors parsing JSON files:');
    for (const e of errors) console.error(` - ${e.file}: ${e.error}`);
  }
  if (duplicates.length) {
    console.error('\nDuplicate ids found:');
    for (const d of duplicates) console.error(` - ${d.id}: ${d.files.join(', ')}`);
  }
  process.exit(1);
}

main();
