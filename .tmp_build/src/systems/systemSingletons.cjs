"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rivalSystem = void 0;
const RivalSystem_1 = require("./RivalSystem");
const rng_1 = require("../utils/rng");
// Minimal singleton instances used across the project. Other systems may opt to
// construct their own instances in tests; the singleton here is a convenience.
// Defer RNG resolution to call time so replay injection can control it.
// Defer RNG resolution to call-time and prefer the domain helper which already falls back to Math.random
// Use a call-time resolving RNG function so tests or replay can inject determinism.
exports.rivalSystem = new RivalSystem_1.RivalSystem({ rng: () => (0, rng_1.getRng)()() });
exports.default = { rivalSystem: exports.rivalSystem };
