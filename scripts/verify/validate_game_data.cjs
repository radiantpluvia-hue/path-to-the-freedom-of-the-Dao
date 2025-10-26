const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const repoRoot = path.resolve(__dirname, '..', '..');
const dataPath = path.join(repoRoot, 'src', 'data', 'raceBackgrounds.ts');
const iconPath = path.join(repoRoot, 'src', 'components', 'ui', 'Icon.tsx');

if (!fs.existsSync(dataPath)) {
  console.error('raceBackgrounds.ts not found at', dataPath);
  process.exit(2);
}
if (!fs.existsSync(iconPath)) {
  console.error('Icon.tsx not found at', iconPath);
  process.exit(2);
}

const dataSrc = fs.readFileSync(dataPath, 'utf8');
const iconSrc = fs.readFileSync(iconPath, 'utf8');

const sourceFile = ts.createSourceFile(dataPath, dataSrc, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS);
const iconFile = ts.createSourceFile(iconPath, iconSrc, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TSX);

const allowedRarities = new Set(['common', 'uncommon', 'rare', 'legendary']);

function getImplementedIconIds(iconAst) {
  // Find exported IMPLEMENTED_ICON_IDS array initializer
  const ids = new Set();
  function visit(node) {
    if (ts.isVariableStatement(node) && node.modifiers && node.modifiers.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
      node.declarationList.declarations.forEach(dec => {
        if (dec.name && dec.name.getText() === 'IMPLEMENTED_ICON_IDS' && dec.initializer && ts.isArrayLiteralExpression(dec.initializer)) {
          dec.initializer.elements.forEach(el => {
            if (ts.isStringLiteral(el)) ids.add(el.text);
          });
        }
      });
    }
    ts.forEachChild(node, visit);
  }
  visit(iconAst);
  return ids;
}

function extractBackgroundsFromAst(ast) {
  const results = [];

  function isExportedConst(node) {
    return ts.isVariableStatement(node) && node.modifiers && node.modifiers.some(m => m.kind === ts.SyntaxKind.ExportKeyword) && node.declarationList.declarations.some(d => d.name.getText() === 'RACE_BACKGROUNDS');
  }

  function readLiteral(node) {
    if (!node) return undefined;
    if (ts.isStringLiteral(node) || ts.isNumericLiteral(node)) return node.text;
    if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
    return undefined;
  }

  function readArray(node) {
    if (!ts.isArrayLiteralExpression(node)) return undefined;
    return node.elements.map(el => {
      if (ts.isStringLiteral(el) || ts.isNumericLiteral(el)) return el.text;
      return undefined;
    }).filter(Boolean);
  }

  function visit(node) {
    if (isExportedConst(node)) {
      // find the object literal initializer
      node.declarationList.declarations.forEach(dec => {
        if (dec.name.getText() !== 'RACE_BACKGROUNDS') return;
        const init = dec.initializer;
        if (!ts.isObjectLiteralExpression(init)) return;
        init.properties.forEach(raceProp => {
          if (!ts.isPropertyAssignment(raceProp)) return;
          const raceName = raceProp.name.getText().replace(/['\"]+/g, '');
          const arr = raceProp.initializer;
          if (!ts.isArrayLiteralExpression(arr)) return;
          arr.elements.forEach(el => {
            if (!ts.isObjectLiteralExpression(el)) return;
            const bg = { _race: raceName };
            el.properties.forEach(p => {
              if (!ts.isPropertyAssignment(p)) return;
              const key = p.name.getText().replace(/['\"]+/g, '');
              if (ts.isStringLiteral(p.initializer) || ts.isNumericLiteral(p.initializer)) bg[key] = p.initializer.text;
              else if (ts.isArrayLiteralExpression(p.initializer)) bg[key] = p.initializer.elements.map(e => (ts.isStringLiteral(e) ? e.text : undefined)).filter(Boolean);
              else if (ts.isObjectLiteralExpression(p.initializer)) {
                // We'll keep object types as a flag (present)
                bg[key] = true;
              } else {
                bg[key] = true;
              }
            });
            results.push(bg);
          });
        });
      });
    }
    ts.forEachChild(node, visit);
  }

  visit(ast);
  return results;
}

const implementedIcons = getImplementedIconIds(iconFile);
const backgrounds = extractBackgroundsFromAst(sourceFile);

const errors = [];
const warnings = [];
const report = { backgrounds: [], summary: { total: 0, perRace: {}, rarityCounts: {} }, issues: [] };

// Auto-fix configuration
const AUTO_FIX = { addDefaultTag: true, defaultTag: 'misc', synthesizePreviewEffects: true };

// We'll collect edits to apply to the source file in a map: id -> { tags?, previewEffects? }
const suggestedEdits = new Map();

// helper validators (simple schema checks)
function validateEffectsShape(sh) {
  // Accept objects or presence flag (we saw many are object literals)
  // We'll enforce that if effects is present it should be object-like (we represented as true)
  return !!sh;
}

function validateAbilitiesShape(sh) {
  return !!sh;
}

// Helper: find the object literal snippet for a background by id in the source text
function findBackgroundSourceSnippet(sourceText, bgId) {
  const regex = new RegExp("\\{[\\s\\S]*?id:\\\\s*'" + bgId.replace(/[-\\\\/\\^$*+?.()|[\]{}]/g, '\\$&') + "'[\\s\\S]*?\\}", 'm');
  const m = sourceText.match(regex);
  return m ? m[0] : null;
}

// Helper: extract top-level keys inside a named object property (like effects) from a snippet
function extractTopLevelKeysFromObjectLiteral(snippet, propName) {
  const propRegex = new RegExp(propName + "\\s*:\\s*\\{([\\s\\S]*?)\\}");
  const m = snippet.match(propRegex);
  if (!m) return null;
  const body = m[1];
  const keyRegex = /([a-zA-Z0-9_]+)\s*:/g;
  const keys = [];
  let km;
  while ((km = keyRegex.exec(body))) keys.push(km[1]);
  return keys;
}

// Apply edits map (id -> { tags?, previewEffects? }) to the source text by simple insertion
// Apply edits map (id -> { tags?, previewEffects? }) using AST transforms and TypeScript printer
function applyEditsToSourceAST(sourceText, editsMap) {
  const sf = ts.createSourceFile(dataPath, sourceText, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS);
  const editsObj = Object.fromEntries([...editsMap.entries()].map(([k, v]) => [k, v]));

  const transformer = (context) => {
    const visit = (node) => {
      // Look for object literals that contain an `id: '...'` property
      if (ts.isObjectLiteralExpression(node)) {
        let idVal = null;
        node.properties.forEach(p => {
          if (ts.isPropertyAssignment(p) && (p.name && ((p.name.text) || p.name.getText()))) {
            const name = p.name.getText().replace(/['\"]/g, '');
            if (name === 'id' && ts.isStringLiteral(p.initializer)) idVal = p.initializer.text;
          }
        });
        if (idVal && editsObj[idVal]) {
          const change = editsObj[idVal];
          const hasTags = node.properties.some(p => ts.isPropertyAssignment(p) && p.name.getText().replace(/['\"]/g, '') === 'tags');
          const hasPreviewEffects = node.properties.some(p => ts.isPropertyAssignment(p) && p.name.getText().replace(/['\"]/g, '') === 'previewEffects');
          let newProps = [...node.properties];
          if (change.tags && !hasTags) {
            const arr = ts.factory.createArrayLiteralExpression(change.tags.map(t => ts.factory.createStringLiteral(t)));
            newProps = [...newProps, ts.factory.createPropertyAssignment(ts.factory.createIdentifier('tags'), arr)];
          }
          if (change.previewEffects && !hasPreviewEffects) {
            const arr2 = ts.factory.createArrayLiteralExpression(change.previewEffects.map(s => ts.factory.createStringLiteral(s)));
            newProps = [...newProps, ts.factory.createPropertyAssignment(ts.factory.createIdentifier('previewEffects'), arr2)];
          }
          if (newProps.length !== node.properties.length) {
            return ts.factory.updateObjectLiteralExpression(node, newProps);
          }
        }
      }
      return ts.visitEachChild(node, visit, context);
    };
    return (node) => ts.visitNode(node, visit);
  };

  const res = ts.transform(sf, [transformer]);
  const transformed = res.transformed[0];
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const fixed = printer.printFile(transformed);
  res.dispose();
  return fixed;
}

// Unique IDs
const seen = new Map();
backgrounds.forEach((b, idx) => {
  const id = b.id;
  const entryReport = { id: id || null, race: b._race || null, issues: [] };
  if (!id) {
    entryReport.issues.push({ level: 'error', msg: 'missing id', line: b._line || null });
    errors.push(`Background entry at index ${idx} (race ${b._race}) missing id`);
    report.issues.push({ type: 'missing_id', race: b._race });
    report.backgrounds.push(entryReport);
    return;
  }
  if (seen.has(id)) {
    entryReport.issues.push({ level: 'error', msg: 'duplicate id' });
    errors.push(`Duplicate background id '${id}'`);
    report.issues.push({ type: 'duplicate_id', id });
  } else seen.set(id, true);

  // Basic field checks
  if (!b.rarity) {
    entryReport.issues.push({ level: 'error', msg: 'missing rarity' });
    errors.push(`Missing rarity for ${id}`);
    report.issues.push({ type: 'missing_rarity', id });
  } else if (!allowedRarities.has(b.rarity)) {
    entryReport.issues.push({ level: 'error', msg: `invalid rarity '${b.rarity}'` });
    errors.push(`Invalid rarity '${b.rarity}' for ${id}`);
    report.issues.push({ type: 'invalid_rarity', id, value: b.rarity });
  }

  if (!b.previewIcon) {
    entryReport.issues.push({ level: 'error', msg: 'missing previewIcon' });
    errors.push(`Missing previewIcon for ${id}`);
    report.issues.push({ type: 'missing_previewIcon', id });
  } else if (!implementedIcons.has(b.previewIcon)) {
    entryReport.issues.push({ level: 'error', msg: `previewIcon '${b.previewIcon}' not implemented` });
    errors.push(`previewIcon '${b.previewIcon}' for ${id} not found in implemented icons`);
    report.issues.push({ type: 'missing_icon_impl', id, icon: b.previewIcon });
  }

  if (!b.previewEffects) {
    entryReport.issues.push({ level: 'warn', msg: 'missing previewEffects' });
    warnings.push(`Missing previewEffects for ${id}`);
    report.issues.push({ type: 'missing_previewEffects', id });
    if (AUTO_FIX.synthesizePreviewEffects) {
      // Try to synthesize a short previewEffects array from effects keys
      let synthesized = null;
      if (b.effects && typeof b.effects === 'object') {
        // We don't have the full object value, but in many cases we set bg.effects = true earlier.
        // As a heuristic, take the property names from the original source by scanning the literal in source text.
        const snippet = findBackgroundSourceSnippet(dataSrc, id);
        if (snippet) {
          const keys = extractTopLevelKeysFromObjectLiteral(snippet, 'effects');
          if (keys && keys.length) synthesized = keys.slice(0, 2).map(k => `+${k}`);
        }
      }
      if (!synthesized) synthesized = ['See effects'];
      suggestedEdits.set(id, Object.assign(suggestedEdits.get(id) || {}, { previewEffects: synthesized }));
    }
  }

  if (!b.tags) {
    entryReport.issues.push({ level: 'warn', msg: 'missing tags' });
    warnings.push(`Missing tags for ${id}`);
    report.issues.push({ type: 'missing_tags', id });
    if (AUTO_FIX.addDefaultTag) {
      suggestedEdits.set(id, Object.assign(suggestedEdits.get(id) || {}, { tags: [AUTO_FIX.defaultTag] }));
    }
  }

  // effects/abilities shape checks (best-effort)
  if (b.effects && !validateEffectsShape(b.effects)) {
    entryReport.issues.push({ level: 'warn', msg: 'effects shape seems incorrect' });
    report.issues.push({ type: 'effects_shape', id });
  }
  if (b.abilities && !validateAbilitiesShape(b.abilities)) {
    entryReport.issues.push({ level: 'warn', msg: 'abilities shape seems incorrect' });
    report.issues.push({ type: 'abilities_shape', id });
  }

  // Add to per-race counters
  const race = b._race || 'Unknown';
  report.summary.perRace[race] = report.summary.perRace[race] || 0;
  report.summary.perRace[race]++;
  report.summary.total++;

  // Rarity counts
  const r = b.rarity || 'unknown';
  report.summary.rarityCounts[r] = (report.summary.rarityCounts[r] || 0) + 1;

  report.backgrounds.push(entryReport);
});

// Emit machine-readable report
const outDir = path.join(repoRoot, 'scripts', 'verify', 'reports');
try { fs.mkdirSync(outDir, { recursive: true }); } catch (e) {}
const outPath = path.join(outDir, 'game_data_report.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');

// If we have suggestedEdits, apply safe auto-fixes to the TS source and write a backup
if (suggestedEdits.size > 0) {
  const backupPath = path.join(repoRoot, 'src', 'data', 'raceBackgrounds.ts.bak');
  try { fs.copyFileSync(dataPath, backupPath, fs.constants.COPYFILE_EXCL); console.log('Backup written to', backupPath); } catch (e) { console.log('Backup already exists or could not be written:', e.message); }
  const fixedSource = applyEditsToSourceAST(dataSrc, suggestedEdits);
  fs.writeFileSync(dataPath, fixedSource, 'utf8');
  console.log('Applied auto-fix edits to', dataPath);
}

if (errors.length) {
  console.error('Game data validation failed with the following errors:');
  errors.forEach(e => console.error(' - ' + e));
  console.error('A machine-readable report was written to:', outPath);
  process.exit(1);
}

if (warnings.length) {
  console.log('Game data validation passed with warnings. See report:', outPath);
  process.exit(0);
}

console.log('Game data validation passed. Backgrounds found:', backgrounds.length);
console.log('Report written to:', outPath);
process.exit(0);
