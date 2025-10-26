import { RivalSystem } from './RivalSystem';
import { getRng } from '../utils/rng';

// Minimal singleton instances used across the project. Other systems may opt to
// construct their own instances in tests; the singleton here is a convenience.
// Defer RNG resolution to call time so replay injection can control it.
// Defer RNG resolution to call-time and prefer the domain helper which already falls back to Math.random
// Use a call-time resolving RNG function so tests or replay can inject determinism.
export const rivalSystem = new RivalSystem({ rng: () => getRng()() });

export default { rivalSystem };
