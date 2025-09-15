"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FORMATION_CATALOG = void 0;
exports.getFormationById = getFormationById;
const skills_1 = require("./skills");
// generate 50 formations
exports.FORMATION_CATALOG = (() => {
    const formations = [];
    const total = 50;
    const roots = ['Heavenly', 'Earthly', 'Shadow', 'Dragon', 'Phoenix', 'Star', 'Azure', 'Gloom'];
    for (let i = 1; i <= total; i++) {
        // ensure tier is 1..10
        const rawTier = (Math.floor((i - 1) / (total / 10)) + 1);
        const tier = Math.min(10, Math.max(1, rawTier));
        const root = roots[i % roots.length];
        const id = `formation_${i}`;
        const tierName = (0, skills_1.getUITierLabel)(tier) || 'Grade';
        const name = `${tierName} ${root} Array ${i}`;
        // stronger multipliers to reflect grand cultivation arrays
        const atkMult = 1 + (tier - 1) * 0.15;
        const defMult = 1 + Math.max(0, (tier - 2)) * 0.10;
        const speedMult = 1 + (tier >= 4 ? 0.08 : 0);
        const disablesPassives = i % 7 === 0; // some arrays disrupt passive imprints
        const desc = `${name}: an arranged cultivation array woven with ${root.toLowerCase()} intent. It reshapes qi flow to ${atkMult > 1 ? 'amplify attacks' : 'stabilize the body'}.`;
        formations.push({ id, name, tier, description: desc, atkMult, defMult, speedMult, disablesPassives });
    }
    return formations;
})();
function getFormationById(id) {
    return exports.FORMATION_CATALOG.find(f => f.id === id);
}
