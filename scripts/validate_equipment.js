const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '..', 'src', 'data');
const GLOB = /^equipment.*\.ts$/i;

// Optional first arg: specific file to validate (relative to project root or full path)
const ARG_FILE = process.argv[2] || null;

function readFiles() {
  if (ARG_FILE) {
    const p = path.isAbsolute(ARG_FILE) ? ARG_FILE : path.join(process.cwd(), ARG_FILE);
    if (!fs.existsSync(p)) {
      console.error('Specified file not found:', p);
      process.exit(3);
    }
    return [p];
  }
  return fs.readdirSync(DATA_DIR).filter(f => GLOB.test(f)).map(f => path.join(DATA_DIR, f));
}

function findObjects(content) {
  // Naive object extractor: find sequences starting with '{' and ending with '}',
  // but constrained to typical item literal shape by requiring "id:" with a quoted value
  const objs = [];
  const objRegex = /\{[\s\S]*?id:\s*['\"][^'\"]+['\"][\s\S]*?\}/g;
  let m;
  while ((m = objRegex.exec(content)) !== null) {
    objs.push(m[0]);
  }
  return objs;
}

function hasField(objText, fieldName) {
  const re = new RegExp(fieldName + '\\s*:\\s*', 'i');
  return re.test(objText);
}

function validateFile(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const errors = [];

  // If file contains quoted keys (JSON-style), try to extract the array and parse JSON
  if (/"id"\s*:\s*/.test(src)) {
    // extract first top-level array literal
    const eq = src.indexOf('=');
    const start = src.indexOf('[', eq !== -1 ? eq : 0);
    if (start === -1) return { count: 0, errors };
    let i = start;
    let depth = 0;
    let inString = false;
    let stringChar = null;
    while (i < src.length) {
      const ch = src[i];
      if (inString) {
        if (ch === '\\') { i += 2; continue; }
        if (ch === stringChar) { inString = false; stringChar = null; }
        i += 1; continue;
      }
      if (ch === '"' || ch === "'") { inString = true; stringChar = ch; i += 1; continue; }
      if (ch === '[') depth += 1;
      else if (ch === ']') { depth -= 1; if (depth === 0) break; }
      i += 1;
    }
    const arrayText = src.substring(start, i + 1);
    try {
      const items = JSON.parse(arrayText);
      items.forEach((it, idx) => {
        const missing = [];
        ['id', 'name', 'slot', 'tier', 'basePower', 'description'].forEach(f => {
          if (typeof it[f] === 'undefined') missing.push(f);
        });
        if (missing.length) errors.push({ index: idx, missing, snippet: JSON.stringify(it).slice(0,200) });
      });
      return { count: items.length, errors };
    } catch (e) {
      // fall back to text-based detection
    }
  }

  const objs = findObjects(src);
  objs.forEach((o, idx) => {
    const missing = [];
    ['id', 'name', 'slot', 'tier', 'basePower', 'description'].forEach(f => {
      if (!hasField(o, f)) missing.push(f);
    });
    if (missing.length) {
      errors.push({ index: idx, missing, snippet: o.slice(0, 200).replace(/\n/g, ' ') });
    }
  });
  return { count: objs.length, errors };
}

function main() {
  const files = readFiles();
  if (files.length === 0) {
    console.error('No equipment data files found under', DATA_DIR);
    process.exit(1);
  }
  let overallErrors = 0;
  files.forEach(f => {
    const rel = path.relative(process.cwd(), f);
    const res = validateFile(f);
    console.log(`Checked ${rel}: found ${res.count} item(s)`);
    if (res.errors.length) {
      overallErrors += res.errors.length;
      console.error(`  ${res.errors.length} item(s) with missing fields in ${rel}:`);
      res.errors.forEach(e => console.error(`   - item[${e.index}] missing: ${e.missing.join(', ')} snippet: ${e.snippet}`));
    }
  });
  if (overallErrors > 0) {
    console.error(`Validation failed: ${overallErrors} item(s) missing required fields.`);
    process.exit(2);
  }
  console.log('Validation OK — all items include id, name, slot, tier, basePower, description.');
}

main();
    function hasField(objText, fieldName) {
      const re = new RegExp(fieldName + '\\s*:\\s*', 'i');
      return re.test(objText);
    }

    function validateFile(filePath) {
      const src = fs.readFileSync(filePath, 'utf8');
      const objs = findObjects(src);
      const errors = [];
      objs.forEach((o, idx) => {
        const missing = [];
        ['id', 'name', 'slot', 'tier', 'basePower', 'description'].forEach(f => {
          if (!hasField(o, f)) missing.push(f);
        });
        if (missing.length) {
          errors.push({ index: idx, missing, snippet: o.slice(0, 200).replace(/\n/g, ' ') });
        }
      });
      return { count: objs.length, errors };
    }

    function main() {
      const files = readFiles();
      if (files.length === 0) {
        console.error('No equipment data files found under', DATA_DIR);
        process.exit(1);
      }
      let overallErrors = 0;
      files.forEach(f => {
        const rel = path.relative(process.cwd(), f);
        const res = validateFile(f);
        console.log(`Checked ${rel}: found ${res.count} item(s)`);
        if (res.errors.length) {
          overallErrors += res.errors.length;
          console.error(`  ${res.errors.length} item(s) with missing fields in ${rel}:`);
          res.errors.forEach(e => console.error(`   - item[${e.index}] missing: ${e.missing.join(', ')} snippet: ${e.snippet}`));
        }
      });
      if (overallErrors > 0) {
        console.error(`Validation failed: ${overallErrors} item(s) missing required fields.`);
        process.exit(2);
      }
      console.log('Validation OK — all items include id, name, slot, tier, basePower, description.');
    }

    main();
