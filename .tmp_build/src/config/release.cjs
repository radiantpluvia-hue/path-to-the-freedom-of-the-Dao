"use strict";
// Centralized release gating configuration
// Acts beyond MAX_RELEASED_ACT are considered unreleased for public builds.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENABLE_SANDBOX_MODE = exports.COMING_SOON_LABEL = exports.MAX_RELEASED_ACT = void 0;
exports.isActReleased = isActReleased;
exports.MAX_RELEASED_ACT = 4;
function isActReleased(actId) {
    const n = parseInt(String(actId).replace(/[^0-9]/g, ''), 10);
    return !isNaN(n) ? n <= exports.MAX_RELEASED_ACT : true;
}
exports.COMING_SOON_LABEL = 'Coming soon';
// Enable sandbox/world-mode narrative packs (LifeArc-oriented freeform play)
// This reads a build-time Vite env var in the browser (VITE_ENABLE_SANDBOX_MODE)
// and falls back to a process.env flag on the server (ENABLE_SANDBOX_MODE).
// Note: avoid using `import.meta` directly so Node/Jest (which don't support it)
// won't throw. Vite can be configured to `define` a build-time global like
// `__VITE_ENABLE_SANDBOX_MODE__` (string) which will be available at runtime
// in the browser bundle. Otherwise fall back to process.env.
exports.ENABLE_SANDBOX_MODE = (() => {
    try {
        // Prefer a build-time injected global (Vite `define`) so browser bundles
        // can toggle this without relying on import.meta at runtime.
        // eslint-disable-next-line no-undef
        const globalShim = (typeof globalThis.__VITE_ENABLE_SANDBOX_MODE__ !== 'undefined')
            ? globalThis.__VITE_ENABLE_SANDBOX_MODE__
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
    }
    catch (e) {
        return false;
    }
})();
