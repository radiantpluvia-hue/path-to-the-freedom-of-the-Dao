"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const eventsDir = node_path_1.default.resolve(".");
const files = [
    "act1_events.json",
    "act2_events.json",
    "act3_events.json",
    "act4_events.json",
    "act5_events.json",
    "act6_events.json",
    "act7_events.json"
].filter(f => node_fs_1.default.existsSync(node_path_1.default.join(eventsDir, f)));
let ok = true;
for (const f of files) {
    const p = node_path_1.default.join(eventsDir, f);
    const raw = node_fs_1.default.readFileSync(p, "utf-8");
    const data = JSON.parse(raw);
    // Basic structure checks
    const ids = new Set();
    data.forEach((ev, i) => {
        if (!ev.id || !ev.title || !ev.description || !ev.type) {
            console.error(`[${f}] Bad event at index ${i}:`, ev);
            ok = false;
        }
        if (ids.has(ev.id)) {
            console.error(`[${f}] Duplicate id: ${ev.id}`);
            ok = false;
        }
        ids.add(ev.id);
    });
    console.log(`[OK] ${f}: ${data.length} events validated`);
}
if (!ok) {
    process.exitCode = 1;
}
else {
    console.log("All event files validated ✅");
}
