"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const seclusionPath_1 = require("@/systems/seclusionPath");
const seededRng_1 = require("@/utils/seededRng");
describe('Seclusion instrumentation and stability', () => {
    it('runs ticks and study without throwing and logs state when enabled', () => {
        // Enable deterministic RNG and instrumentation
        (0, seededRng_1.setRuntimeRng)((0, seededRng_1.seededFromString)('seclusion-test-seed'));
        seclusionPath_1.SeclusionPath.instrumentationEnabled = true;
        const sp = new seclusionPath_1.SeclusionPath();
        // Create a minimal fake gameState
        const gs = {
            player: {
                name: 'Test',
                skills: { meditation: { level: 2 }, comprehension: { level: 3 } },
                daoComprehension: 0
            }
        };
        try {
            sp.enterSeclusion(2, false);
            for (let i = 0; i < 20; i++) {
                const eff = sp.tick(gs);
                // ensure effect shape
                expect(eff).toHaveProperty('qiGain');
            }
            const study = sp.performStudy(gs, 2);
            expect(study).toHaveProperty('xpGained');
            sp.exitSeclusion();
        }
        catch (e) {
            // Dump state for debugging
            // eslint-disable-next-line no-console
            console.error('Seclusion test failed', e, sp.getState());
            throw e;
        }
        finally {
            seclusionPath_1.SeclusionPath.instrumentationEnabled = false;
        }
    });
});
