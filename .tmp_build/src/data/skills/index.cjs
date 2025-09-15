"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_SKILLS = exports.SCHOOL_SKILLS = exports.FACTION_SKILLS = exports.SECT_SKILLS = exports.MORTAL_WORLD_SKILLS = exports.IMMORTAL_WORLD_SKILLS = void 0;
const immortal_world_skills_1 = __importDefault(require("./immortal_world_skills"));
exports.IMMORTAL_WORLD_SKILLS = immortal_world_skills_1.default;
const mortal_world_skills_1 = __importDefault(require("./mortal_world_skills"));
exports.MORTAL_WORLD_SKILLS = mortal_world_skills_1.default;
const sect_skills_1 = __importDefault(require("./sect_skills"));
exports.SECT_SKILLS = sect_skills_1.default;
const faction_skills_1 = __importDefault(require("./faction_skills"));
exports.FACTION_SKILLS = faction_skills_1.default;
const school_skills_1 = __importDefault(require("./school_skills"));
exports.SCHOOL_SKILLS = school_skills_1.default;
const curated_sutras_1 = __importDefault(require("./curated_sutras"));
// Legacy/placeholders: some mentor unlocks reference a small JSON file
// containing placeholder skill/weapon ids. Include it so tests that
// validate mentor unlock ids see these canonical placeholders.
const all_skills_json_1 = __importDefault(require("./all_skills.json"));
exports.ALL_SKILLS = [
    ...curated_sutras_1.default,
    // include any placeholder/all_skills.json entries first so they are
    // discoverable by tests that validate mentor unlock ids
    ...all_skills_json_1.default,
    ...immortal_world_skills_1.default,
    ...mortal_world_skills_1.default,
    ...sect_skills_1.default,
    ...faction_skills_1.default,
    ...school_skills_1.default
];
exports.default = exports.ALL_SKILLS;
