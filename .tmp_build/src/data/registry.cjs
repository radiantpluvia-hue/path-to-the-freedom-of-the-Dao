"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Registry = void 0;
exports.getWeapons = getWeapons;
exports.getRelics = getRelics;
exports.getWeaponById = getWeaponById;
exports.getRelicById = getRelicById;
exports.getPassives = getPassives;
exports.getPassiveById = getPassiveById;
exports.getActiveAbilities = getActiveAbilities;
exports.getActiveAbilityById = getActiveAbilityById;
exports.getFormations = getFormations;
exports.getFormationById = getFormationById;
exports.getManuals = getManuals;
exports.getManualById = getManualById;
exports.loadGeneratedPassivesNow = loadGeneratedPassivesNow;
const weapons_1 = require("./weapons");
const relics_1 = require("./relics");
const passives_1 = require("./passives");
const more_active_abilities_1 = require("./skills/more_active_abilities");
const formations_1 = require("./formations");
const manuals_1 = require("./manuals");
// Simple, safe registry getters. Consumers should import from this file to avoid
// using project root alias imports and to have a single place to control exposures.
function getWeapons() {
    return weapons_1.WEAPONS;
}
function getRelics() {
    return relics_1.RELICS;
}
function getWeaponById(id) {
    return weapons_1.WEAPONS.find((w) => w.id === id) || null;
}
// Legacy alias expected by some tests
function getRelicById(id) {
    return relics_1.RELICS.find((r) => r.id === id) || null;
}
function getPassives() {
    return passives_1.PASSIVES;
}
function getPassiveById(id) {
    return passives_1.PASSIVES.find((p) => p.id === id) || null;
}
function getActiveAbilities() {
    return more_active_abilities_1.ACTIVE_ABILITIES;
}
function getActiveAbilityById(id) {
    return more_active_abilities_1.ACTIVE_ABILITIES.find((a) => a.id === id) || null;
}
function getFormations() {
    return formations_1.FORMATIONS;
}
function getFormationById(id) {
    return formations_1.FORMATIONS.find((f) => f.id === id) || null;
}
function getManuals() {
    return manuals_1.ALL_MANUALS;
}
function getManualById(id) {
    return manuals_1.ALL_MANUALS.find((m) => m.id === id) || undefined;
}
// Synchronously merge generated passives/abilities into the static arrays.
// Tests call this during Jest setup to ensure generated content is available
// via the Registry getters (which read PASSIVES / ACTIVE_ABILITIES).
async function loadGeneratedPassivesNow() {
    try {
        // Prefer dynamic import to satisfy lint rules and work in ESM/bundlers
        const gp = await Promise.resolve().then(() => __importStar(require('./generated/passives.generated')));
        const ga = await Promise.resolve().then(() => __importStar(require('./generated/activeAbilities.generated')));
        const generatedPassives = (gp && (gp.GENERATED_PASSIVES || gp.default)) || [];
        const generatedAbilities = (ga && (ga.default || ga.GENERATED_ABILITIES)) || [];
        // Merge passives if not already present
        for (const p of generatedPassives) {
            try {
                if (!passives_1.PASSIVES.find((x) => x.id === p.id))
                    passives_1.PASSIVES.push(p);
            }
            catch (e) { /* ignore malformed entries */ }
        }
        // Merge active abilities
        for (const a of generatedAbilities) {
            try {
                if (!more_active_abilities_1.ACTIVE_ABILITIES.find((x) => x.id === a.id))
                    more_active_abilities_1.ACTIVE_ABILITIES.push(a);
            }
            catch (e) { /* ignore malformed entries */ }
        }
    }
    catch (_err) {
        // swallow: generated content is optional
    }
}
exports.default = {
    getWeapons,
    getWeaponById,
    getPassives,
    getPassiveById,
    getActiveAbilities,
    getActiveAbilityById,
    getFormations,
    getFormationById,
    getManuals,
    getManualById,
};
// Named export alias for legacy callers
// legacy alias removed - use getRelics()/getRelicById for relic-specific lookups
// Minimal Registry object for legacy bootstrap and systems that expect a Registry API.
exports.Registry = {
    _map: {},
    register(namespace, data) {
        this._map[namespace] = data;
    },
    get(namespace) {
        return this._map[namespace];
    }
};
