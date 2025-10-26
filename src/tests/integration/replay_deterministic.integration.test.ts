const pathLib = require('path');
const applyReplay = require(pathLib.resolve(process.cwd(), 'src', 'tools', 'ReplayPlayer')).applyReplay;
const domainShim = require(pathLib.resolve(process.cwd(), 'src', 'utils', 'domainSystem'));
const fs = require('fs');

function deepSort(obj: any): any {
  if (Array.isArray(obj)) return obj.map(deepSort);
  if (obj && typeof obj === 'object') {
    const keys = Object.keys(obj).sort();
    const out: any = {};
    for (const k of keys) out[k] = deepSort(obj[k]);
    return out;
  }
  return obj;
}

describe('deterministic replay integration', () => {
  it('replays fixture with seed and initial state deterministically', () => {
  const fixturesDir = pathLib.resolve(__dirname, '..', 'fixtures', 'replay');
  const initPath = pathLib.join(fixturesDir, 'initial_state.json');
  const fixturePath = pathLib.join(fixturesDir, 'fixture_capture.json');
  const goldenPath = pathLib.join(fixturesDir, 'golden_snapshot.json');

    const init = JSON.parse(fs.readFileSync(initPath, 'utf8'));
    const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
    // inject deterministic RNG into domain shim
    if (typeof fixture.seed === 'number') {
      let s = fixture.seed >>> 0;
      const rng = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
      if (typeof (domainShim as any).setRng === 'function') (domainShim as any).setRng(rng);
    }
    const gs1 = JSON.parse(JSON.stringify(init));
    applyReplay(gs1, fixture as any);

    // run again from the same initial state and seed and compare
    if (typeof fixture.seed === 'number') {
      let s2 = fixture.seed >>> 0;
      const rng2 = () => { s2 = (s2 * 1664525 + 1013904223) % 4294967296; return s2 / 4294967296; };
      if (typeof (domainShim as any).setRng === 'function') (domainShim as any).setRng(rng2);
    }
    const gs2 = JSON.parse(JSON.stringify(init));
    applyReplay(gs2, fixture as any);

    // normalize transient fields
    function normalize(gsObj: any) {
      if (gsObj.world && gsObj.world.flags) delete gsObj.world.flags;
      if (gsObj.world && gsObj.world.territories) {
        for (const tid of Object.keys(gsObj.world.territories)) {
          if (gsObj.world.territories[tid]) gsObj.world.territories[tid].contestedSince = null;
        }
      }
    }
    normalize(gs1); normalize(gs2);

    expect(deepSort(gs1)).toEqual(deepSort(gs2));
  });
});
