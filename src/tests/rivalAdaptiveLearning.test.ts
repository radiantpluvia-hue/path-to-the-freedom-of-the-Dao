import { RivalSystem } from '@/systems/RivalSystem';
import { RivalAISystem } from '@/systems/RivalAISystem';

describe('Rival adaptive learning integration', () => {
  test('effective techniques are promoted onto rival after multiple combats', () => {
    const ai = new RivalAISystem();
    const rs = new RivalSystem();
    rs.attachAISystem(ai);

    // Create a stable rival with 4 candidate techniques
    const rival = rs.generateRival({ minLevel: 5, maxLevel: 5, silent: true });
    rival.techniques = ['t1', 't2', 't3', 't4'];
    rs.addRival(rival);

    // Simulate combat records where 't3' and 't1' are successful most often
    for (let i = 0; i < 5; i++) {
      ai.recordCombatOutcome(rival.id, 'victory', 4, { hp: 50, qi: 20, techniques: [] }, { hp: 10, qi: 5, techniques: [] }, [], ['t3']);
    }

    for (let i = 0; i < 2; i++) {
      ai.recordCombatOutcome(rival.id, 'victory', 4, { hp: 60, qi: 20, techniques: [] }, { hp: 15, qi: 5, techniques: [] }, [], ['t1']);
    }

    // Ensure learning data exists
    const learning = ai.getLearningData(rival.id);
    expect(learning).not.toBeNull();
    expect(learning?.totalCombats).toBeGreaterThanOrEqual(7);

    // Apply learning to rival via RivalSystem helper
    rs.applyLearningToRival(rival.id);

    const updated = rs.getRival(rival.id)! as any;
    // The AI hints should include t3 as top effective technique
    expect(updated.aiHints).toBeDefined();
    expect(Array.isArray(updated.aiHints.preferredTechniques)).toBeTruthy();
    expect(updated.aiHints.preferredTechniques[0]).toBe('t3');
    // t1 should also be present in the hints
    expect(updated.aiHints.preferredTechniques.includes('t1')).toBeTruthy();
  });
});
