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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const url_1 = require("url");
const __dirname = path.dirname((0, url_1.fileURLToPath)(import.meta.url));
function readJSON(p) {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function collectEventExecutorIds(folder) {
    const ids = new Set();
    for (const f of fs.readdirSync(folder)) {
        if (!f.endsWith('.json'))
            continue;
        const data = readJSON(path.join(folder, f));
        for (const e of data) {
            if (e.executorId)
                ids.add(e.executorId);
        }
    }
    return ids;
}
function collectRegistryIds(regFolder) {
    const ids = new Set();
    for (const f of fs.readdirSync(regFolder)) {
        if (!f.endsWith('.ts'))
            continue;
        const txt = fs.readFileSync(path.join(regFolder, f), 'utf8');
        // crude parse: look for keys in object literal like '"fn_act1_xxx":' or bare keys
        const regex = /['\"]([a-zA-Z0-9_]+)['\"]\s*:\s*/g;
        let m;
        while ((m = regex.exec(txt)) !== null)
            ids.add(m[1]);
    }
    return ids;
}
const eventFolder = path.resolve(__dirname, '..');
const rootEvents = path.join(eventFolder, 'act1_events.json');
// user repo stores act events at root and src/events/data
const actJsonPaths = [
    path.join(eventFolder, 'act1_events.json'),
    path.join(eventFolder, 'act2_events.json'),
    path.join(eventFolder, 'act3_events.json'),
    path.join(eventFolder, 'act4_events.json'),
    path.join(eventFolder, 'act5_events.json'),
    path.join(eventFolder, 'act6_events.json'),
    path.join(eventFolder, 'act7_events.json'),
].filter(p => fs.existsSync(p));
const eventExecutorIds = new Set();
for (const p of actJsonPaths) {
    const j = readJSON(p);
    // if file is an array or newline-delimited JSON, try both
    if (Array.isArray(j)) {
        for (const e of j)
            if (e.executorId)
                eventExecutorIds.add(e.executorId);
    }
    else if (typeof j === 'object') {
        // maybe file contains object mapping
        for (const key of Object.keys(j)) {
            const e = j[key];
            if (e && e.executorId)
                eventExecutorIds.add(e.executorId);
        }
    }
    else if (typeof j === 'string') {
        // ignore
    }
}
const regFolder = path.join(eventFolder, 'src', 'events', 'executors');
const registryIds = fs.existsSync(regFolder) ? collectRegistryIds(regFolder) : new Set();
const missing = Array.from(eventExecutorIds).filter(id => !registryIds.has(id));
console.log('Total event executor ids found:', eventExecutorIds.size);
console.log('Total registry ids found:', registryIds.size);
console.log('Missing in registries:', missing.length);
for (const m of missing)
    console.log(' -', m);
// ensure scripts folder exists and write result to file for inspection
const outDir = path.join(eventFolder, 'scripts');
if (!fs.existsSync(outDir))
    fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'executorValidation.json'), JSON.stringify({ eventExecutorCount: eventExecutorIds.size, registryCount: registryIds.size, missing }, null, 2));
console.log('Wrote scripts/executorValidation.json');
