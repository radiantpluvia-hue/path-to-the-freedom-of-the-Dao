import { findShortestPath } from '@/utils/travelPath';

describe('travelPath', () => {
  test('finds shortest path and durations', () => {
    const nodes = [{ id: 'a' }, { id: 'b' }, { id: 'c' }] as any;
    const edges = [
      { from: 'a', to: 'b', durationSeconds: 5, durationTicks: 1 },
      { from: 'b', to: 'c', durationSeconds: 10, durationTicks: 2 },
      { from: 'a', to: 'c', durationSeconds: 20, durationTicks: 5 }
    ] as any;
    const res = findShortestPath(nodes, edges, 'a', 'c');
    expect(res).not.toBeNull();
    expect(res!.path.join(',')).toBe('a,b,c');
    expect(res!.totalDurationSeconds).toBe(15);
    expect(res!.totalDurationTicks).toBe(3);
  });
});
