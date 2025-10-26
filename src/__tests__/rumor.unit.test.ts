import { rumorSystem } from '../systems/rumorSystem';
import { worldState } from '../systems/worldState';

describe('RumorSystem basics', () => {
  beforeEach(() => { worldState.reset(); });

  test('postRumor stores and returns rumor object', () => {
    const r = rumorSystem.postRumor({ content: 'A spirit beast was seen', truthiness: 0.8 });
    expect(r).toBeDefined();
    const list = rumorSystem.getRumors();
  expect(list.find((x: any) => x.id === r.id)).toBeDefined();
  });

  test('expireRumors removes expired entries', () => {
    const now = Date.now();
    // post two rumors, one expired
    rumorSystem.postRumor({ id: 'r1', content: 'Old rumor', truthiness: 0.2, expiryMs: now - 1000 });
    rumorSystem.postRumor({ id: 'r2', content: 'Fresh rumor', truthiness: 0.9, expiryMs: now + 1000000 });
    const before = rumorSystem.getRumors({ activeOnly: true });
    expect(before.find((r:any)=>r.id==='r2')).toBeDefined();
    const active = rumorSystem.expireRumors();
    expect(active.find((r:any)=>r.id==='r1')).toBeUndefined();
    expect(active.find((r:any)=>r.id==='r2')).toBeDefined();
  });
});
