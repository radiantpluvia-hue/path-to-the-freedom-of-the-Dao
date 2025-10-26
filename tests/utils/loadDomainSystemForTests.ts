// Test-only helper: attempts to locate the project's domainSystem implementation
// in a variety of likely locations and via require.cache. Exported functions are
// only used by Jest/node test code; the file is placed under `tests/` to avoid
// bundling into browser artifacts.

export function loadDomainSystem(): any {
  // prefer compiled tmp build path
  const tries = [
    '.tmp_build/utils/domainSystem.cjs',
    '.tmp_build/src/utils/domainSystem.cjs',
    '.tmp_build/utils/domainSystem.js',
    'src/utils/domainSystem',
    'utils/domainSystem',
  ];
  const nodeRequire: any = (typeof window === 'undefined' && typeof require === 'function') ? Function('return require')() : null;
  if (!nodeRequire) return null;
  try {
    for (const p of tries) {
      try {
        const abs = nodeRequire('path').resolve(process.cwd(), p);
        try {
          const mod = nodeRequire(abs);
          if (mod) return mod;
        } catch (_) {
          // ignore
        }
      } catch (_) { /* ignore path resolve issues */ }
      try {
        const mod = nodeRequire(p);
        if (mod) return mod;
      } catch (_) { /* ignore */ }
    }
  } catch (_) { /* ignore */ }

  // fallback: search require.cache for any domain-like module
  try {
    const cache = (nodeRequire && (nodeRequire as any).cache) || require.cache || {};
    for (const k of Object.keys(cache)) {
      const key = String(k).toLowerCase();
      if (key.indexOf('domain') !== -1 && (key.indexOf('domainsystem') !== -1 || key.indexOf('domainsystem') !== -1)) {
        const exp = (cache as any)[k] && (cache as any)[k].exports;
        if (exp && (typeof exp.applyCaptureTransaction === 'function' || typeof exp.applyTerritoryInfluence === 'function')) return exp;
      }
    }
  } catch (_) { /* ignore */ }
  return null;
}

export function testLogger(...args: any[]) {
  try {
    if (typeof process !== 'undefined' && process && process.env && process.env.JEST_WORKER_ID) {
      // eslint-disable-next-line no-console
      console.log('[test.loadDomain]', ...args);
    }
  } catch (_) {}
}

export default { loadDomainSystem, testLogger };
