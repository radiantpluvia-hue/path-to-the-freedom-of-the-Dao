import { mentorTeachingsLoader } from '@/data/mentorTeachingsLoader';

describe('Mentor reward deep scaling', () => {
  test('nested numeric fields scale while coefficients <= 1 remain', () => {
    const mentorId = 'fang_yuan';
    const teachings = mentorTeachingsLoader.getTeachingsForMentor(mentorId);
    expect(teachings.length).toBeGreaterThan(0);

    const t = teachings.find(tt => typeof (tt.reward?.qi) === 'number') || teachings[0];
    const low = mentorTeachingsLoader.getTeachingByIdScaled(t.id, 'mortal')!;
    const high = mentorTeachingsLoader.getTeachingByIdScaled(t.id, 'chaos_saint')!;

    // top-level numeric > 1
    Object.entries(t.reward || {}).forEach(([k, v]) => {
      if (typeof v === 'number' && v > 1) {
        expect((high.reward as any)[k]).toBeGreaterThanOrEqual((low.reward as any)[k]);
      }
      if (typeof v === 'number' && v <= 1) {
        expect((high.reward as any)[k]).toBeCloseTo((low.reward as any)[k]);
      }
    });

    // nested example if present
    const nested = (t.reward as any)?.spiritStones;
    if (nested && typeof nested === 'object') {
      const lowNested = (low.reward as any).spiritStones;
      const highNested = (high.reward as any).spiritStones;
      Object.entries(nested).forEach(([k, v]) => {
        if (typeof v === 'number' && v > 1) {
          expect(highNested[k]).toBeGreaterThanOrEqual(lowNested[k]);
        }
        if (typeof v === 'number' && v <= 1) {
          expect(highNested[k]).toBeCloseTo(lowNested[k]);
        }
      });
    }
  });
});