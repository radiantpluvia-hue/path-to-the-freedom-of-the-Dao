import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

function collectExecutorKeys(dir: string): Set<string> {
  const keys = new Set<string>();
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));
  const keyRegex = /['"]([a-zA-Z0-9_\-]+)['"]\s*:\s*makeStub|['"]([a-zA-Z0-9_\-]+)['"]\s*:\s*\(/g;
  for (const f of files) {
    const content = fs.readFileSync(path.join(dir, f), 'utf8');
    let m: RegExpExecArray | null;
    while ((m = keyRegex.exec(content))) {
      const key = m[1] || m[2];
      if (key) keys.add(key);
    }
    // also detect quoted keys in object-literal style
    const literalRegex = /['"]([a-zA-Z0-9_\-]+)['"]\s*:/g;
    while ((m = literalRegex.exec(content))) {
      keys.add(m[1]);
    }
  }
  return keys;
}

function collectMentorRecommendedExecutors(mentorFiles: string[]): Set<string> {
  const res = new Set<string>();
  for (const mf of mentorFiles) {
    const content = fs.readFileSync(mf, 'utf8');
    const json = JSON.parse(content);
    json.forEach((m: any) => {
      (m.recommendedExecutorIds || []).forEach((id: string) => res.add(id));
    });
  }
  return res;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const executorsDir = path.resolve(__dirname, '..', 'src', 'events', 'executors');
const mentorFiles = [
  path.resolve(__dirname, '..', 'src', 'data', 'mentors.json'),
  path.resolve(__dirname, '..', 'src', 'data', 'immortal_leaders.json')
];

const executorKeys = collectExecutorKeys(executorsDir);
const mentorExecs = collectMentorRecommendedExecutors(mentorFiles);

const missing = Array.from(mentorExecs).filter(e => !executorKeys.has(e));

const out = { totalMentorExecutors: mentorExecs.size, totalRegisteredExecutors: executorKeys.size, missing };
fs.writeFileSync(path.resolve(__dirname, 'mentorExecutorValidation.json'), JSON.stringify(out, null, 2));
console.log('Wrote scripts/mentorExecutorValidation.json');
if (missing.length) process.exitCode = 2;
