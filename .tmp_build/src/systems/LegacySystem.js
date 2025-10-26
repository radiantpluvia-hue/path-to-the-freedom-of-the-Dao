"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegacySystem = void 0;
class LegacySystem {
    constructor(engine) {
        this.engine = engine;
    }
    addRemnant(remnant) {
        this.engine.legacyRemnants.push(remnant);
    }
    getActiveRemnants() {
        return this.engine.legacyRemnants.filter((r) => r.active);
    }
    inheritRemnantsForNewLife() {
        // Return a shallow copy of active remnants to be applied to a new reincarnation
        return this.getActiveRemnants().map((r) => ({ ...r }));
    }
    recordPastLifeSummary(life) {
        this.engine.pastLives.push(life);
    }
}
exports.LegacySystem = LegacySystem;
exports.default = LegacySystem;
