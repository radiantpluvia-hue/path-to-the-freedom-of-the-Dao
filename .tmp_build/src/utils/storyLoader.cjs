"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadActsFromJson = loadActsFromJson;
// When executed in a browser, provide a no-op loader so importing this file doesn't pull
// Node-only modules (fs/path) into the browser bundle. The real loader is used when
// required from Node (server-side/dev scripts) via conditional `require`.
function loadActsFromJson(rootDir) {
    if (typeof window !== 'undefined') {
        // Browser runtime: return empty map (StorySystem will use defaults)
        return new Map();
    }
    // Node runtime: perform actual file system reads
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const path = require('path');
    const acts = new Map();
    const files = fs.readdirSync(rootDir);
    const actFiles = files.filter((f) => /^act\d+(_events)?\.json$/i.test(f));
    for (const fname of actFiles) {
        try {
            const content = fs.readFileSync(path.join(rootDir, fname), 'utf-8');
            const parsed = JSON.parse(content);
            if (parsed && parsed.id) {
                acts.set(parsed.id, parsed);
            }
        }
        catch (e) {
            // skip invalid files
            console.warn(`Failed to load story act from ${fname}:`, e);
        }
    }
    return acts;
}
