"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadActsFromJson = loadActsFromJson;
const logger_1 = require("./logger");
// When executed in a browser, provide a no-op loader so importing this file doesn't pull
// Node-only modules (fs/path) into the browser bundle. The real loader is used when
// required from Node (server-side/dev scripts) via conditional `require`.
async function loadActsFromJson(rootDir) {
    if (typeof window !== 'undefined') {
        // Browser runtime: try to fetch bundled story packs from /story/ if sandbox is enabled.
        // This allows Netlify/static-hosted builds to include sandbox packs under public/story.
        const acts = new Map();
        try {
            // Use dynamic import for release config so bundlers don't inject a CommonJS require
            const cfgMod = await Promise.resolve().then(() => __importStar(require('../config/release'))).catch(() => null);
            // Default sandbox mode ON: this repository is intended as a narrative sandbox by default
            // unless a release config explicitly disables it. This makes narrative packs available
            // in regular dev/playtest builds without extra flags.
            let ENABLE_SANDBOX_MODE = cfgMod && typeof cfgMod.ENABLE_SANDBOX_MODE !== 'undefined' ? cfgMod.ENABLE_SANDBOX_MODE : true;
            if (!ENABLE_SANDBOX_MODE)
                return acts;
            const fetchJson = async (url) => {
                try {
                    const resp = await fetch(url);
                    if (!resp.ok)
                        return null;
                    return await resp.json();
                }
                catch (e) {
                    // ignore fetch errors for optional assets
                    return null;
                }
            };
            // Allow an alternate global flag to toggle sandbox pack loading in browser dev tools/tests
            try {
                const v = globalThis.__STORY_ALLOW_SANDBOX_EVENTS__;
                if (v === '1' || v === 'true') {
                    ENABLE_SANDBOX_MODE = true;
                }
            }
            catch {
                // ignore
            }
            // We attempt to fetch known sandbox files. If you add additional packs, include them here.
            const candidates = [
                '/story/sandbox_events.json',
                '/story/sandbox_large_events.json',
                // Additional sandbox packs
                '/story/sandbox_additional_events.json',
                // Narrative threads pack (acts as a lightweight freeform arc)
                '/story/narrative_threads.json',
                // Phase 4 multi-world packs (if copied to public/story at build time)
                '/story/murim_events.json',
                '/story/cultivation_events.json',
                '/story/immortal_events.json'
            ];
            // Synchronously wait for both so callers get a filled map (small risk: blocks during init)
            // We intentionally use top-level async IIFE and block via .then to keep the function signature sync.
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            (async () => {
                for (const url of candidates) {
                    const parsed = await fetchJson(url);
                    if (!parsed)
                        continue;
                    if (Array.isArray(parsed)) {
                        const baseName = url.split('/').pop() || url;
                        const actId = baseName.replace(/\.json$/i, '');
                        const actObj = {
                            id: actId,
                            title: `Sandbox Pack: ${actId}`,
                            description: `Auto-generated arc from ${baseName}`,
                            mainQuests: [],
                            sideQuests: [],
                            events: parsed
                        };
                        acts.set(actId, actObj);
                    }
                    else if (parsed && typeof parsed === 'object' && parsed.id) {
                        acts.set(parsed.id, parsed);
                    }
                }
            })();
        }
        catch (e) {
            // If anything goes wrong, return an empty map to preserve browser safety
            logger_1.logger.warn('Browser story loader: failed to fetch bundled story packs', e);
        }
        return acts;
    }
    // Node runtime: delegate to the Node-only implementation under `scripts/` so bundlers
    // don't pick up fs/path during client builds. Use a runtime require wrapper to avoid
    // the literal eval('require') token that many bundlers warn about.
    const nodeRequire = (typeof window === 'undefined' && typeof Function === 'function') ? Function('return require')() : null;
    if (!nodeRequire)
        return new Map();
    try {
        // scripts/storyLoader.node.js is intentionally outside `src/` so it won't be bundled
        // into browser builds. Use process.cwd() as base so the script can locate files.
        const pathMod = await Promise.resolve().then(() => __importStar(require('path')));
        const loaderPath = pathMod.join(process.cwd(), 'scripts', 'storyLoader.node.js');
        const nodeLoader = nodeRequire(loaderPath);
        if (nodeLoader && typeof nodeLoader.loadActsFromJson === 'function') {
            return await nodeLoader.loadActsFromJson(rootDir);
        }
    }
    catch (e) {
        logger_1.logger.warn('Failed to invoke node story loader:', e);
    }
    return new Map();
}
