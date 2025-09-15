import { MentorTeachingSystem } from '@/systems/MentorTeachingSystem';
import allMentors from '@/data/mentors_runtime';

test('MentorTeachingSystem basic smoke', () => {
  expect(typeof MentorTeachingSystem).toBe('function');
  expect(Array.isArray(allMentors)).toBe(true);
  const sample = allMentors.find(m => m && (m.id || m.name));
  expect(sample).toBeDefined();
});
