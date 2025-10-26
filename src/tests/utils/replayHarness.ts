import * as fs from 'fs';
import * as path from 'path';

export type ReplayRecord = {
  seed?: number | string;
  actions?: any[];
  error?: any;
};

export async function withReplay(name: string, body: (rec: { push: (a: any) => void }) => Promise<void> | void) {
  const rec: ReplayRecord = { actions: [] };
  const wrapper = { push: (a: any) => rec.actions!.push(a) };
  try {
    await Promise.resolve(body(wrapper));
  } catch (err) {
    const e: any = err;
    rec.error = String(e && (e.stack || e.message || e));
    try {
      const out = path.resolve(process.cwd(), 'test-replays');
      if (!fs.existsSync(out)) fs.mkdirSync(out);
      const file = path.join(out, `${Date.now()}-${name.replace(/[^a-z0-9_-]/gi, '_')}.json`);
      fs.writeFileSync(file, JSON.stringify(rec, null, 2), 'utf8');
      // eslint-disable-next-line no-console
      console.log('Wrote replay to', file);
    } catch (e) {
      // ignore write errors
    }
    throw err;
  }
}
