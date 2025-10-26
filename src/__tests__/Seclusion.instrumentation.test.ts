import { SeclusionPath } from '@/systems/seclusionPath';
import { runtimeRng, seededFromString, setRuntimeRng } from '@/utils/seededRng';

describe('Seclusion instrumentation and stability', () => {
  it('runs ticks and study without throwing and logs state when enabled', () => {
    // Enable deterministic RNG and instrumentation
    setRuntimeRng(seededFromString('seclusion-test-seed'));
    SeclusionPath.instrumentationEnabled = true;

    const sp = new SeclusionPath();

    // Create a minimal fake gameState
    const gs: any = {
      player: {
        name: 'Test',
        skills: { meditation: { level: 2 }, comprehension: { level: 3 } },
        daoComprehension: 0
      }
    };

    try {
      sp.enterSeclusion(2, false);
      for (let i = 0; i < 20; i++) {
        const eff = sp.tick(gs as any);
        // ensure effect shape
        expect(eff).toHaveProperty('qiGain');
      }
      const study = sp.performStudy(gs as any, 2);
      expect(study).toHaveProperty('xpGained');
      sp.exitSeclusion();
    } catch (e) {
      // Dump state for debugging
      // eslint-disable-next-line no-console
      console.error('Seclusion test failed', e, sp.getState());
      throw e;
    } finally {
      SeclusionPath.instrumentationEnabled = false;
    }
  });
});
