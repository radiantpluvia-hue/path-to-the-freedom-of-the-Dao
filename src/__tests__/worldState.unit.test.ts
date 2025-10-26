import { worldState } from '../systems/worldState';

describe('worldState basic operations', () => {
  beforeEach(() => {
    worldState.reset();
  });

  test('default regions exist and are readable', () => {
    const s = worldState.getState();
    expect(s.qiMap).toBeDefined();
    expect(s.qiMap.central).toBeDefined();
    expect(s.qiMap.north).toBeDefined();
  });

  test('mutateRegion updates qiDensity and persists in snapshot', () => {
    const before = worldState.getRegion('central');
    expect(before).not.toBeNull();
    const updated = worldState.mutateRegion('central', r => { r.qiDensity = 80; r.corrupted = true; });
    expect(updated!.qiDensity).toBe(80);
    const readback = worldState.getRegion('central');
    expect(readback!.qiDensity).toBe(80);
    expect(readback!.corrupted).toBe(true);
  });

  test('advanceTime adjusts hour and day', () => {
    const t1 = worldState.getTime();
    const later = worldState.advanceTime(1000 * 60 * 60 * 5); // +5 hours
    expect(later.hour).toBe((t1.hour + 5) % 24);
  });

  test('event log push and get', () => {
    const entry = worldState.pushEvent({ id: 'test1', type: 'demo' });
    expect(entry.id).toBe('test1');
    const log = worldState.getEventLog();
    expect(log.find((e: any) => e.id === 'test1')).toBeDefined();
  });
});
