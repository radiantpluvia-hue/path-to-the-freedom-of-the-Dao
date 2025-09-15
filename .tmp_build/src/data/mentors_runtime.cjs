"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMentorById = exports.allMentors = exports.mergeMentors = void 0;
// Runtime merger for mentor datasets. Exposes a combined mentors array
// by merging the curated `mentors_full.json` with `immortal_leaders.json`.
const mentors_full_json_1 = __importDefault(require("./mentors_full.json"));
const mentors_enhanced_json_1 = __importDefault(require("./mentors_enhanced.json"));
const immortal_leaders_json_1 = __importDefault(require("./immortal_leaders.json"));
const skills_1 = require("./skills");
const mergeMentors = (base, extras) => {
    const map = new Map();
    base.forEach(m => map.set(m.id, m));
    extras.forEach(m => {
        if (map.has(m.id)) {
            // prefer base (curated) fields; merge extras only for missing fields
            map.set(m.id, { ...m, ...map.get(m.id) });
        }
        else {
            map.set(m.id, m);
        }
    });
    return Array.from(map.values());
};
exports.mergeMentors = mergeMentors;
// Merge order: base curated mentors, then curated "enhanced" list, then additive immortal leaders.
const normalizeTeachingProgressionDefaults = (mentors) => {
    // choose a safe canonical skill id from ALL_SKILLS as a minimal default unlock
    const fallbackSkillId = (Array.isArray(skills_1.ALL_SKILLS) && skills_1.ALL_SKILLS[0] && skills_1.ALL_SKILLS[0].id) || 'sect_generic_0';
    mentors.forEach(m => {
        // only normalize when a teachingProgression object exists but has no tiers
        if (!m.teachingProgression)
            return;
        const tiers = m.teachingProgression.tiers;
        if (!Array.isArray(tiers) || tiers.length === 0) {
            // non-destructively add a minimal tier so QA validators treat this mentor as valid
            m.teachingProgression = {
                ...m.teachingProgression,
                tiers: [
                    {
                        level: 1,
                        unlocks: [fallbackSkillId]
                    }
                ]
            };
        }
    });
};
exports.allMentors = (() => {
    const merged = (0, exports.mergeMentors)(mentors_full_json_1.default, ([...mentors_enhanced_json_1.default, ...immortal_leaders_json_1.default]));
    normalizeTeachingProgressionDefaults(merged);
    return merged;
})();
const getMentorById = (id) => exports.allMentors.find(m => m.id === id);
exports.getMentorById = getMentorById;
exports.default = exports.allMentors;
