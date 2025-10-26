// Prefer the full domainSystem implementation at project root when running
// under Node (tests). Fall back to the shim exported from src/utils if the
// project-root implementation isn't resolvable.
let Domain = null;
try {
  // Prefer a compiled project-root implementation if present
  try { Domain = require('../../.tmp_build/utils/domainSystem.cjs'); } catch (e) { /* ignore */ }
  if (!Domain) {
    try { Domain = require('../../.tmp_build/src/utils/domainSystem.cjs'); } catch (e) { /* ignore */ }
  }
  // Next try the source-level shims (may resolve via ts-jest runtime)
  if (!Domain) {
    try { Domain = require('../../src/utils/domainSystem'); } catch (e) { /* ignore */ }
  }
  // Finally try the project-root implementation (best-effort)
  if (!Domain) {
    try { Domain = require('../../utils/domainSystem'); } catch (e) { /* ignore */ }
  }
} catch (err) {
  Domain = Domain || null;
}

// Simple deterministic LCG matching tests (if numeric seed provided)
function makeRng(seed) {
  if (typeof seed === 'number') {
    let s = seed >>> 0;
    return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
  }
  try {
    const { getRng } = require('../../src/utils/rng');
    const g = getRng();
    if (typeof g === 'function') return g;
    try { const seeded = require('../../src/utils/seededRng'); if (seeded && typeof seeded.runtimeRng === 'function') return seeded.runtimeRng; } catch (e) { /* ignore */ }
    return Math.random;
  } catch (e) {
    return Math.random;
  }
}

function applyReplay(gs, fixture) {
  const rng = makeRng(typeof fixture?.seed === 'number' ? fixture.seed : undefined);
  const actions = fixture?.actions || [];
  for (const a of actions) {
    if (!a || !a.type) continue;
    switch (a.type) {
      case 'influence':
        try {
          const res = Domain.applyTerritoryInfluence?.(gs, a.tid, a.fid, a.inc);
          // diagnostic for tests
          if (typeof console !== 'undefined') console.log('[ReplayPlayer] applyTerritoryInfluence', { tid: a.tid, fid: a.fid, inc: a.inc, res });
        } catch (e) { if (typeof console !== 'undefined') console.warn('[ReplayPlayer] applyTerritoryInfluence error', e); }
        break;
      case 'decay':
        Domain.decayInfluence?.(gs, a.tid, a.factor);
        break;
      case 'captureAttempt':
        const preview = a.preview;
        if (preview && preview.attackerFactionId) {
          try {
            const res = Domain.applyCaptureTransaction?.(gs, preview);
            if (typeof console !== 'undefined') console.log('[ReplayPlayer] applyCaptureTransaction', { preview, res });
          } catch (e) { if (typeof console !== 'undefined') console.warn('[ReplayPlayer] applyCaptureTransaction error', e); }
        }
        break;
      case 'tick':
        if (typeof Domain.tick === 'function') Domain.tick(gs, a.delta || 1);
        break;
      case 'event':
        if (Domain.resolveEvent && a.eventId) {
          try { Domain.resolveEvent(gs, a.eventId, a.choice); } catch (e) { /* ignore */ }
        }
        break;
      default:
        break;
    }
  }
}

function runReplayFile(filePath, initialStatePath) {
  try {
    const fs = require('fs');
    const path = require('path');
    const abs = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(abs)) throw new Error('Replay file not found: ' + abs);
    const content = fs.readFileSync(abs, 'utf8');
    const fixture = JSON.parse(content);

    let gs = { world: { territories: {}, factions: {} }, player: { yuan: 1000, reputation: { world: 100 } } };
    if (initialStatePath) {
      const absInit = path.resolve(process.cwd(), initialStatePath);
      if (!fs.existsSync(absInit)) throw new Error('Initial state file not found: ' + absInit);
      try { const initContent = fs.readFileSync(absInit, 'utf8'); gs = JSON.parse(initContent); } catch (e) { /* ignore */ }
    }

    if (typeof fixture.seed === 'number') {
      try {
        const seed = fixture.seed >>> 0;
        let s = seed;
        const rng = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
        try { Domain.setRng?.(rng); } catch (_) {}
        try { Domain.rng = rng; } catch (_) {}
      } catch (e) { /* ignore */ }
    }

    applyReplay(gs, fixture);
    console.log('Replay applied. Final state snapshot:');
    console.log(JSON.stringify(gs, null, 2));
  } catch (err) {
    console.error('Replay failed:', err && (err.stack || err.message) || err);
    throw err;
  }
}

module.exports = { applyReplay, runReplayFile };
