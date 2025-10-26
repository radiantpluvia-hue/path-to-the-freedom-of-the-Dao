"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeavenlyDaoSystem = void 0;
const registry_1 = require("../data/registry");
class HeavenlyDaoSystem {
    constructor(engine) {
        this.engine = engine;
    }
    /**
     * Apply a named Dao technique to a player. This is intentionally conservative and
     * data-driven: techniques are looked up from the `daos` registry when available
     * and fallback to safe defaults when not present.
     */
    applyTechnique(player, techniqueId, opts) {
        const daos = registry_1.Registry.get('daos') || {};
        const daoReversal = daos['dao_reversal'] || {};
        switch ((techniqueId || '').toString()) {
            case 'reverse_pulse_sutra': {
                // heal a fraction of maxHp, with a backlash chance
                const healBase = Math.max(1, Math.floor((player.maxHp || 100) * 0.3));
                const successChance = 0.8; // base
                const roll = Math.random();
                if (roll <= successChance) {
                    const healed = Math.min(player.maxHp - (player.hp || 0), healBase);
                    player.hp = Math.min(player.maxHp, (player.hp || 0) + healed);
                    return { ok: true, message: 'Reverse Pulse Sutra succeeded', healed };
                }
                else {
                    const backlash = Math.max(1, Math.floor((player.maxHp || 100) * 0.2));
                    player.hp = Math.max(0, (player.hp || 0) - backlash);
                    return { ok: false, message: 'Reverse Pulse backfired', backlash };
                }
            }
            case 'temporal_echo': {
                // temporal echo is expensive: consume a portion of daoHeart if present
                const cost = Math.max(1, Math.floor((player.daoHeart || 0) * 0.5));
                if ((player.daoHeart || 0) < 1)
                    return { ok: false, message: 'Insufficient Dao Heart', cost: 0 };
                player.daoHeart = Math.max(0, (player.daoHeart || 0) - cost);
                // Placeholder effect: grant a small comprehension bump
                player.daoComprehension = (player.daoComprehension || 0) + 1;
                return { ok: true, message: 'Temporal Echo applied (placeholder)', cost };
            }
            case 'still_flow_meditation': {
                // Apply a temporary buff to daoComprehension and reduce emotion recovery rate via a buff record
                player.daoComprehension = (player.daoComprehension || 0) + 5;
                // record a simple buff entry so other systems can read it
                const buff = {
                    id: 'still_flow_meditation',
                    name: 'Still Flow Meditation',
                    description: 'Temporarily increases Dao Comprehension',
                    duration: 10,
                    durationType: 'ticks',
                    effects: { daoComprehension: 5, emotionRecoveryMultiplier: 0.7 },
                    source: 'dao',
                    sourceId: 'still_flow_meditation',
                    stackable: false,
                    appliedAt: Date.now(),
                    appliedTick: 0
                };
                player.activeBuffs = player.activeBuffs || [];
                player.activeBuffs.push(buff);
                return { ok: true, message: 'Still Flow Meditation applied', cost: 0 };
            }
            default: {
                return { ok: false, message: `Unknown technique ${techniqueId}` };
            }
        }
    }
    isTechniqueAvailable(techniqueId) {
        const daos = registry_1.Registry.get('daos') || {};
        // quick heuristic: check if any dao defines the technique key
        for (const k of Object.keys(daos)) {
            const dao = daos[k] || {};
            if (dao.techniques && Object.prototype.hasOwnProperty.call(dao.techniques, techniqueId))
                return true;
            if (dao.techniques && Array.isArray(dao.techniques) && dao.techniques.find((t) => t.id === techniqueId))
                return true;
        }
        return false;
    }
    addInsight(insight) {
        this.engine.heavenlyDaoInsights.push(insight);
    }
    evaluateTribulationRisk(player) {
        // Simple risk calc using karma and dao insights
        const base = Math.max(0, (player.karma || 0) * -0.001);
        const insightFactor = this.engine.heavenlyDaoInsights.reduce((s, i) => s + (i.comprehension || 0), 0) / Math.max(1, this.engine.heavenlyDaoInsights.length || 1);
        return Math.min(2, Math.max(0, base + (100 - insightFactor) * 0.01));
    }
    triggerHeavenlyIntervention(player) {
        const risk = this.evaluateTribulationRisk(player);
        if (risk > 1.2) {
            // simple intervention narrative
            return 'The Heavens tremble — a minor tribulation descends.';
        }
        return null;
    }
}
exports.HeavenlyDaoSystem = HeavenlyDaoSystem;
exports.default = HeavenlyDaoSystem;
