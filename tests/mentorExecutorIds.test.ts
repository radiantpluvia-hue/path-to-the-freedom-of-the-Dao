import fs from 'fs';
import path from 'path';

function collectExecutorKeys(dir: string): Set<string> {
  const keys = new Set<string>();
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));
  for (const f of files) {
    const content = fs.readFileSync(path.join(dir, f), 'utf8');
    const literalRegex = /['"]([a-zA-Z0-9_\-]+)['"]\s*:/g;
    let m: RegExpExecArray | null;
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

test('mentor recommended executor ids map to registered executor keys', () => {
  const executorsDir = path.resolve(__dirname, '..', 'src', 'events', 'executors');
  const mentorFiles = [
    path.resolve(__dirname, '..', 'src', 'data', 'mentors.json'),
    path.resolve(__dirname, '..', 'src', 'data', 'immortal_leaders.json')
  ];
  const executorKeys = collectExecutorKeys(executorsDir);
  const mentorExecs = collectMentorRecommendedExecutors(mentorFiles);
  const missing = Array.from(mentorExecs).filter(e => !executorKeys.has(e));
  if (missing.length) {
    throw new Error('Missing executor keys referenced by mentors:\n' + missing.join('\n'));
  }
});
