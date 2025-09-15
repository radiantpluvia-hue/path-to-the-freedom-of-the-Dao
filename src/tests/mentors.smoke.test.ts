import allMentors from '@/data/mentors_runtime';

test('mentors_runtime merge smoke', () => {
  expect(Array.isArray(allMentors)).toBe(true);
  expect(allMentors.length).toBeGreaterThan(10);
  // sample mentor has id and teachingProgression (if present)
  const some = allMentors.find(m => !!(m && (m.id || m.name)));
  expect(some).toBeDefined();
});
