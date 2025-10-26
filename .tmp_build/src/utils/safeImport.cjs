"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeImport = safeImport;
async function safeImport(importer) {
    try {
        const m = await importer();
        // Prefer default export when present
        return m.default || m;
    }
    catch (e) {
        return null;
    }
}
