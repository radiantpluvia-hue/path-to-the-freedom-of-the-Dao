// Node-only story loader. This file lives outside `src/` so bundlers won't include
// `fs`/`path` into browser builds. It's required at runtime by the shim in
// `src/utils/storyLoader.ts` when running under Node.
const fs = require('fs');
const path = require('path');

/**
 * Load story acts from JSON files in the given root directory.
 * Returns a Map<string, StoryAct-like> where keys are act ids.
 */
async function loadActsFromJson(rootDir) {
  const acts = new Map();

  // Helper to safely list files in a directory, returning [{ root, name }]
  const listFiles = (dir) => {
    try {
      const entries = fs.readdirSync(dir);
      return entries.map((name) => ({ root: dir, name }));
    } catch (_e) {
      return [];
    }
  };

  // Prefer the explicit rootDir first for deterministic behavior in tests and tools.
  // If nothing is found there, probe a few reasonable fallbacks.
  /** @type {{root: string, name: string}[]} */
  let files = [];
  if (rootDir) {
    files = listFiles(rootDir);
  }
  if (files.length === 0) {
    // Fallbacks only if the provided root is empty/unreadable
    const candidates = [];
    try { candidates.push(process.cwd()); } catch (_e) { /* ignore */ }
    try { candidates.push(path.resolve(__dirname, '..')); } catch (_e) { /* ignore */ }
    try { candidates.push(path.resolve(__dirname, '..', '..')); } catch (_e) { /* ignore */ }

    const seen = new Set();
    for (const dir of candidates) {
      for (const item of listFiles(dir)) {
        const key = `${item.root}|${item.name}`;
        if (!seen.has(key)) {
          seen.add(key);
          files.push(item);
        }
      }
    }
  }
  if (files.length === 0) return acts; // nothing to do

  // Try to load optional config to decide whether to include sandbox packs.
  let ENABLE_SANDBOX_MODE = false;
  try {
    // attempt to require a release config if available; ignore failures
    const cfg = require(path.join(process.cwd(), 'src', 'config', 'release'));
    ENABLE_SANDBOX_MODE = cfg ? !!cfg.ENABLE_SANDBOX_MODE : false;
  } catch (e) {
    // ignore
  }

  // Include standard act files and sandbox packs found in the repository root.
  // Sandbox packs are now included unconditionally in Node/dev environments so
  // local sandbox files (e.g., sandbox_additional_events.json) are picked up.
  const actFiles = files.filter((f) => {
    const name = typeof f === 'string' ? f : f.name;
    if (/^act\d+(_events)?\.json$/i.test(name)) return true;
    if (/^sandbox.*\.json$/i.test(name)) return true; // always include sandbox files in Node
    if (/^(murim|cultivation|immortal)_events\.json$/i.test(name)) return true;
    return false;
  });

  for (const fItem of actFiles) {
    try {
      const fname = typeof fItem === 'string' ? fItem : fItem.name;
      const froot = typeof fItem === 'string' ? (rootDir || process.cwd()) : fItem.root;
      const content = fs.readFileSync(path.join(froot, fname), 'utf-8');
      const parsed = content ? JSON.parse(content) : null;
      if (parsed && typeof parsed === 'object' && parsed.id) {
        acts.set(parsed.id, parsed);
        continue;
      }
      if (Array.isArray(parsed)) {
        const baseName = path.basename(fname, path.extname(fname));
        const actId = baseName;
        const actObj = {
          id: actId,
          title: `Sandbox Pack: ${baseName}`,
          description: `Auto-generated arc from ${fname}`,
          mainQuests: [],
          sideQuests: [],
          events: parsed
        };
        acts.set(actId, actObj);
        continue;
      }
    } catch (e) {
      // skip invalid files
      // Keeping logs silent by default to avoid noisy test output.
      // Uncomment for local debugging:
      // console.warn(`Failed to load story act from ${typeof fItem === 'string' ? fItem : fItem.name}:`, e);
    }
  }

  return acts;
}

module.exports = { loadActsFromJson };
