"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
function collectExecutorKeys(dir) {
    const keys = new Set();
    const files = fs_1.default.readdirSync(dir).filter(f => f.endsWith('.ts'));
    const keyRegex = /['"]([a-zA-Z0-9_\-]+)['"]\s*:\s*makeStub|['"]([a-zA-Z0-9_\-]+)['"]\s*:\s*\(/g;
    for (const f of files) {
        const content = fs_1.default.readFileSync(path_1.default.join(dir, f), 'utf8');
        let m;
        while ((m = keyRegex.exec(content))) {
            const key = m[1] || m[2];
            if (key)
                keys.add(key);
        }
        // also detect quoted keys in object-literal style
        const literalRegex = /['"]([a-zA-Z0-9_\-]+)['"]\s*:/g;
        while ((m = literalRegex.exec(content))) {
            keys.add(m[1]);
        }
    }
    return keys;
}
function collectMentorRecommendedExecutors(mentorFiles) {
    const res = new Set();
    for (const mf of mentorFiles) {
        const content = fs_1.default.readFileSync(mf, 'utf8');
        const json = JSON.parse(content);
        json.forEach((m) => {
            (m.recommendedExecutorIds || []).forEach((id) => res.add(id));
        });
    }
    return res;
}
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
const executorsDir = path_1.default.resolve(__dirname, '..', 'src', 'events', 'executors');
const mentorFiles = [
    path_1.default.resolve(__dirname, '..', 'src', 'data', 'mentors.json'),
    path_1.default.resolve(__dirname, '..', 'src', 'data', 'immortal_leaders.json')
];
const executorKeys = collectExecutorKeys(executorsDir);
const mentorExecs = collectMentorRecommendedExecutors(mentorFiles);
const missing = Array.from(mentorExecs).filter(e => !executorKeys.has(e));
const out = { totalMentorExecutors: mentorExecs.size, totalRegisteredExecutors: executorKeys.size, missing };
fs_1.default.writeFileSync(path_1.default.resolve(__dirname, 'mentorExecutorValidation.json'), JSON.stringify(out, null, 2));
console.log('Wrote scripts/mentorExecutorValidation.json');
if (missing.length)
    process.exitCode = 2;
