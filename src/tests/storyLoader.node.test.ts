
import { loadActsFromJson } from '../utils/storyLoader';
import fs from 'fs';
import os from 'os';
import path from 'path';

describe('Node story loader', () => {
  it('loads sandbox acts from repository root in Node runtime', async () => {
    // Use a temp directory to ensure isolation and deterministic file discovery
    // Use the absolute workspace root to guarantee the loader sees the sandbox file
    // Copy the repository sandbox file into a temp directory and load from there.
    const repoSandboxPath = path.resolve(__dirname, '../../sandbox_additional_events.json');
    if (!fs.existsSync(repoSandboxPath)) {
      throw new Error('Repository sandbox_additional_events.json not found at: ' + repoSandboxPath);
    }
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sx-story-'));
    const destPath = path.join(tmpDir, 'sandbox_additional_events.json');
    fs.copyFileSync(repoSandboxPath, destPath);

    // Bypass shim and call the Node-only loader directly so Jest/jsdom doesn't
    // force the browser code path. This ensures we exercise the fs-based loader.
    const nodeLoaderPath = path.resolve(process.cwd(), 'scripts', 'storyLoader.node.js');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nodeLoader = require(nodeLoaderPath);
    const acts = await (nodeLoader && typeof nodeLoader.loadActsFromJson === 'function'
      ? nodeLoader.loadActsFromJson(tmpDir)
      : loadActsFromJson(tmpDir));
  const actKeys = Array.from(acts.keys()) as any[];
  const hasSandbox = actKeys.some((k: any) => /sandbox_additional_events/i.test(k) || /^sandbox/.test(k));
    if (!hasSandbox) {
      throw new Error('Sandbox act not found. Loaded act keys (temp dir): ' + JSON.stringify(actKeys));
    }
    // Optionally assert events array exists for that act
  const act = Array.from(acts.values() as any[]).find((a: any) => a && a.events && Array.isArray(a.events) && a.events.length > 0 && (a.id && /^sandbox/i.test(a.id)));
    expect(act).toBeDefined();
    // Cleanup
    try { fs.unlinkSync(destPath); fs.rmdirSync(tmpDir); } catch (e) { /* ignore */ }
  });
});
