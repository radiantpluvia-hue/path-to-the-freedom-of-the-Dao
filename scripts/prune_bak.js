#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');

function walk(dir, cb) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (p.includes(path.sep + 'node_modules') || p.includes(path.sep + '.git')) continue;
      walk(p, cb);
    } else {
      cb(p);
    }
  }
}

function findBakFiles(root) {
  const found = [];
  walk(root, (p) => { if (p.endsWith('.bak')) found.push(p); });
  return found;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function usage() {
  console.log('Usage: node scripts/prune_bak.js [--dry-run] [--archive] [--delete] [--gitignore] [--yes]');
  console.log('  --dry-run   : only list .bak files (default)');
  console.log('  --archive   : move .bak files to .bak_archive/<timestamp>/');
  console.log('  --delete    : permanently delete .bak files');
  console.log('  --gitignore : append "*.bak" and ".bak_archive/" to project .gitignore');
  console.log('  --yes       : skip confirmation for destructive ops');
}

const args = new Set(process.argv.slice(2));
if (args.has('--help')) { usage(); process.exit(0); }

const root = process.cwd();
const bakFiles = findBakFiles(root);

if (bakFiles.length === 0) {
  console.log('No .bak files found.');
  process.exit(0);
}

console.log(`Found ${bakFiles.length} .bak files (showing up to 200):`);
bakFiles.slice(0,200).forEach(f => console.log('  ' + path.relative(root, f)));
if (bakFiles.length > 200) console.log('  ...');

if (args.has('--gitignore')) {
  const gitignorePath = path.join(root, '.gitignore');
  let gitignore = '';
  if (fs.existsSync(gitignorePath)) gitignore = fs.readFileSync(gitignorePath, 'utf8');
  const additions = ['*.bak', '.bak_archive/'];
  let changed = false;
  for (const line of additions) {
    if (!gitignore.split(/\r?\n/).includes(line)) {
      gitignore = gitignore + os.EOL + line;
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(gitignorePath, gitignore, 'utf8');
    console.log('Appended .bak entries to .gitignore');
  } else {
    console.log('.gitignore already contains .bak entries');
  }
}

if (!args.has('--archive') && !args.has('--delete')) {
  console.log('\nNo action requested (default dry-run). Use --archive or --delete to remove files.');
  process.exit(0);
}

if (!args.has('--yes')) {
  const readline = require('readline-sync');
  const confirm = readline.question('Proceed with action? (y/N): ');
  if (!/^y(es)?$/i.test(confirm)) {
    console.log('Aborted by user.');
    process.exit(1);
  }
}

if (args.has('--archive')) {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const archiveDir = path.join(root, '.bak_archive', ts);
  ensureDir(archiveDir);
  for (const f of bakFiles) {
    const rel = path.relative(root, f);
    const target = path.join(archiveDir, rel.replace(/[:\\/]/g, '_'));
    ensureDir(path.dirname(target));
    fs.renameSync(f, target);
  }
  console.log(`Archived ${bakFiles.length} files to ${path.relative(root, archiveDir)}`);
}

if (args.has('--delete')) {
  for (const f of bakFiles) {
    try { fs.unlinkSync(f); } catch (e) { console.warn('Failed to delete', f, e.message); }
  }
  console.log(`Deleted ${bakFiles.length} .bak files`);
}

process.exit(0);
