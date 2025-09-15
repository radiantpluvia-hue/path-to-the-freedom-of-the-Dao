import { mergeMentors } from '../src/data/mentors_runtime';

test('mergeMentors prefers base entries and shallow-merges extras', () => {
  const base = [
    { id: 'm1', displayName: 'Base One', portrait: 'b1' },
    { id: 'm2', displayName: 'Base Two', portrait: 'b2' }
  ];
  const extras = [
    { id: 'm2', displayName: 'Extra Two', extraField: 'x' },
    { id: 'm3', displayName: 'Extra Three' }
  ];

  const merged = mergeMentors(base as any, extras as any);
  // m1 should be unchanged (from base)
  const m1 = merged.find((m: any) => m.id === 'm1');
  const m2 = merged.find((m: any) => m.id === 'm2');
  const m3 = merged.find((m: any) => m.id === 'm3');

  expect(m1.displayName).toBe('Base One');
  // m2 should prefer base fields and include extras shallow-merged
  expect(m2.displayName).toBe('Base Two');
  expect(m2.extraField).toBe('x');
  // m3 should be present from extras
  expect(m3.displayName).toBe('Extra Three');
});
