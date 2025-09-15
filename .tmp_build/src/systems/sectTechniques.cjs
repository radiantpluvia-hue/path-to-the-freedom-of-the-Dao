"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PHILOSOPHY_MAP = exports.SECT_TECHNIQUE_MAP = void 0;
exports.getTechniquesForSect = getTechniquesForSect;
const SectSystem_1 = require("./SectSystem");
// Generate per-sect personalized technique manuals (lightweight Skill objects)
exports.SECT_TECHNIQUE_MAP = {};
const BASE_MOVES = ['Palm', 'Saber', 'Thrust', 'Strike', 'Slash', 'Step', 'Thump', 'Gouge', 'Sweep'];
// Philosophies per sect id — short phrases that capture each sect's teaching focus. These
// will be woven into manual lore text and influence mechanics selection.
exports.PHILOSOPHY_MAP = {
    'azure_cloud_sect': 'Purity of purpose and righteous ascendancy',
    'blood_moon_sect': 'Power through sacrifice and forbidden truth',
    'eternal_dao_academy': 'Comprehend the Dao to reshape reality',
    'dragon_emperor_palace': 'Honor bloodline and imperial might',
    'void_emperor_sect': 'Walk the void between worlds',
    'mount_hua_sect': 'Balance swordcraft with inner clarity',
    'buddha_sect': 'Compassion breeds true power',
    'starlight_sect': 'Harmony with celestial cycles',
    'upper_north_sect': 'Endurance carved by the harsh north',
    'lower_south_sect': 'Adapt and flow with the land',
    'darkness_sect': 'Embrace shadow to understand light',
};
function makeSkillId(sectId, idx) {
    return `${sectId}_manual_${idx}`;
}
function generateForSect(sect) {
    const techniques = [];
    // number of manuals: prefer 3-5 depending on realm
    const count = Math.min(5, Math.max(3, Math.floor((sect.realm || 1) / 2) + 2));
    for (let i = 0; i < count; i++) {
        const idx = i + 1;
        const id = makeSkillId(sect.id, idx);
        const base = sect.benefits && Array.isArray(sect.benefits.techniques) && sect.benefits.techniques[i]
            ? sect.benefits.techniques[i]
            : BASE_MOVES[(i + sect.id.length) % BASE_MOVES.length];
        const name = `${sect.name} Manual — ${base} Technique ${idx}`;
        // tier scales with sect realm but clamped
        const tier = Math.min(8, Math.max(2, Math.ceil((sect.realm || 1) / 1.5) + i % 3));
        const power = Math.round(40 + tier * 8 + i * 6);
        const cooldown = Math.max(1, 5 - Math.floor(tier / 3));
        const ap = Math.max(0, Math.ceil(tier / 2));
        const qi = tier >= 6 ? Math.ceil(tier / 2) : 0;
        // Create some deterministic passive IDs to associate with manuals (these are lightweight references
        // to passive effects which can be implemented elsewhere). Naming pattern: `${sect.id}_passive_${idx}`
        const passiveId = `${sect.id}_passive_${idx}`;
        const philosophy = exports.PHILOSOPHY_MAP[sect.id] || sect.description || '';
        const description = `A sect manual from ${sect.name}: the ${base} sequence ${idx} is taught to disciples to embody the school's flavor and rhythm. Philosophy: ${philosophy}.`;
        const unlock = {
            sectId: sect.id,
            minRep: Math.max(0, Math.floor((sect.reputation || 0) / 10)) // simple deterministic proxy; many sects may be 0
        };
        const trainingCost = {
            gold: 100 + tier * 25 + i * 10,
            xp: 20 + tier * 5 + i * 2,
        };
        // Choose a small mechanics payload influenced by sect type and manual index
        const mechanics = [];
        // simple deterministic rules for variety
        if (sect.type === 'righteous') {
            // righteous sects favor chains and disciplined multi-hit sequences
            mechanics.push({ type: 'chain', chainLength: 2 + (i % 3), description: 'A disciplined sequence of linked strikes.' });
            if (i % 2 === 0)
                mechanics.push({ type: 'multiHit', hits: 2 + (i % 2), description: 'Strikes multiple times following the chain.' });
        }
        else if (sect.type === 'demonic' || sect.type === 'hidden') {
            // darker sects favor conditional high-damage or sacrifice mechanics
            mechanics.push({ type: 'conditional', condition: i % 2 === 0 ? 'target_below_30_hp' : 'on_kill', description: 'Unleashes extra force when the condition is met.' });
        }
        else if (sect.type === 'ancient') {
            mechanics.push({ type: 'multiHit', hits: 3 + (i % 2), description: 'A ritualistic multi-strike that simulates cosmic patterns.' });
        }
        else {
            mechanics.push({ type: 'chain', chainLength: 1 + (i % 2), description: 'A simple flowing technique.' });
        }
        techniques.push({ id, name, tier, power, cooldown, cost: { ap, qi }, description, passives: [passiveId], unlock, trainingCost, mechanics });
    }
    return techniques;
}
// Build map for all major sects
for (const sect of SectSystem_1.MAJOR_SECTS) {
    const list = generateForSect(sect);
    exports.SECT_TECHNIQUE_MAP[sect.id] = list;
    // Attach ids back to sect benefits (avoid duplicates)
    const existing = Array.isArray(sect.benefits?.techniques) ? [...sect.benefits.techniques] : [];
    const newIds = list.map(s => s.id);
    const merged = [...new Set([...newIds, ...existing])];
    if (!sect.benefits)
        sect.benefits = {};
    sect.benefits.techniques = merged;
}
function getTechniquesForSect(sectId) {
    return exports.SECT_TECHNIQUE_MAP[sectId] || [];
}
exports.default = exports.SECT_TECHNIQUE_MAP;
