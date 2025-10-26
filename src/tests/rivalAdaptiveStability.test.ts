import { RivalSystem } from '@/systems/RivalSystem';
import { RivalAISystem } from '@/systems/RivalAISystem';

// Stability test: small noisy updates shouldn't flip the promoted technique immediately
describe('Rival adaptive stability', () => {
  test('small noisy updates do not cause oscillation', () => {
    const ai = new RivalAISystem();
    ai.debug = false;
    const rs = new RivalSystem();
    rs.attachAISystem(ai);

    const rival = rs.generateRival({ minLevel: 5, maxLevel: 5, silent: true });
    rival.techniques = ['t1', 't2', 't3'];
    rs.addRival(rival);

    // Seed learning such that t2 is best
    for (let i = 0; i < 4; i++) {
      ai.recordCombatOutcome(rival.id, 'victory', 3, { hp: 30, qi: 10, techniques: [] }, { hp: 5, qi: 2, techniques: [] }, [], ['t2']);
    }

  // Apply learning
  rs.applyLearningToRival(rival.id);
  const firstHints = (rs.getRival(rival.id)! as any).aiHints?.preferredTechniques || [];

    // Introduce small noisy records favoring t1 only once or twice
    ai.recordCombatOutcome(rival.id, 'victory', 5, { hp: 30, qi: 10, techniques: [] }, { hp: 5, qi: 2, techniques: [] }, [], ['t1']);
    ai.recordCombatOutcome(rival.id, 'defeat', 6, { hp: 10, qi: 2, techniques: [] }, { hp: 40, qi: 10, techniques: [] }, [], ['t1']);

  // Do NOT apply learning yet (simulate threshold not reached)
  const secondHints = (rs.getRival(rival.id)! as any).aiHints?.preferredTechniques || [];

  // They should be identical because we haven't applied learning again
  expect(secondHints).toEqual(firstHints);

    // Now simulate enough records to trigger re-application but weak evidence: t1 gets some use but not enough
    for (let i = 0; i < 2; i++) {
      ai.recordCombatOutcome(rival.id, 'victory', 4, { hp: 30, qi: 10, techniques: [] }, { hp: 5, qi: 2, techniques: [] }, [], ['t1']);
    }

  // Now apply learning via RivalSystem (simulate scheduled application)
  rs.applyLearningToRival(rival.id);

  // Ensure that t2 is still preferred (stability) unless overwhelming evidence
  const finalHints = (rs.getRival(rival.id)! as any).aiHints?.preferredTechniques || [];
  expect(finalHints.indexOf('t2')).toBeLessThan(finalHints.indexOf('t1'));
  });
});
