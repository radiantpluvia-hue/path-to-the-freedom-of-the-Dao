// Centralized release gating configuration
// Acts beyond MAX_RELEASED_ACT are considered unreleased for public builds.

export const MAX_RELEASED_ACT = 4;

export function isActReleased(actId: string): boolean {
  const n = parseInt(String(actId).replace(/[^0-9]/g, ''), 10);
  return !isNaN(n) ? n <= MAX_RELEASED_ACT : true;
}

export const COMING_SOON_LABEL = 'Coming soon';

// Enable sandbox/world-mode narrative packs (LifeArc-oriented freeform play)
// This reads a build-time Vite env var in the browser (VITE_ENABLE_SANDBOX_MODE)
// and falls back to a process.env flag on the server (ENABLE_SANDBOX_MODE).
// Note: avoid using `import.meta` directly so Node/Jest (which don't support it)
// won't throw. Vite can be configured to `define` a build-time global like
// `__VITE_ENABLE_SANDBOX_MODE__` (string) which will be available at runtime
// in the browser bundle. Otherwise fall back to process.env.
export const ENABLE_SANDBOX_MODE: boolean = (() => {
  try {
    // Prefer a build-time injected global (Vite `define`) so browser bundles
    // can toggle this without relying on import.meta at runtime.
    // eslint-disable-next-line no-undef
    const globalShim = (typeof (globalThis as any).__VITE_ENABLE_SANDBOX_MODE__ !== 'undefined')
      ? (globalThis as any).__VITE_ENABLE_SANDBOX_MODE__
      : undefined;

    if (typeof globalShim !== 'undefined') {
      const v = String(globalShim || '');
      return v === 'true' || v === '1';
    }

    // Node runtime: read from process.env
    if (typeof process !== 'undefined' && process.env) {
      return process.env.ENABLE_SANDBOX_MODE === 'true' || process.env.ENABLE_SANDBOX_MODE === '1';
    }

    return false;
  } catch (e) {
    return false;
  }
})();