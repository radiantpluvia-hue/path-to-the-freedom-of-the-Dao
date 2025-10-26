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
exports.TAG_TO_PASSIVE_ID = void 0;
exports.applyAlignmentPassives = applyAlignmentPassives;
// Bridge that maps alignment passive tags to concrete passive ids registered in PassiveRegistry
// and ensures they are applied/removed on the player when alignment changes.
const PassiveRegistry = __importStar(require("./passiveRegistry"));
const alignment_1 = require("./alignment");
// Map alignment passive tags to registered passive ids
exports.TAG_TO_PASSIVE_ID = {
    honor_bound: 'tag_honor_bound',
    sect_favored: 'tag_sect_favored',
    bloodthirsty: 'tag_bloodthirsty',
    forbidden_affinity: 'tag_forbidden_affinity',
    wildcraft: 'tag_wildcraft',
    unpredictable: 'tag_unpredictable',
    lone_wolf: 'tag_lone_wolf',
    pragmatist: 'tag_pragmatist',
};
// Apply alignment-derived passives for the player's current alignment, and remove any
// previously applied alignment passives that no longer match.
function applyAlignmentPassives(player) {
    try {
        const alignmentId = player.alignment?.id ?? 'neutral';
        const tags = alignment_1.ALIGNMENTS[alignmentId]?.passiveTags || [];
        const desiredIds = tags.map((t) => exports.TAG_TO_PASSIVE_ID[t]).filter(Boolean);
        // Track which alignment passives are currently applied
        const applied = player.alignmentPassiveApplied || [];
        // Remove any no-longer-desired alignment passives
        let p = { ...player };
        for (const pid of applied) {
            if (!desiredIds.includes(pid)) {
                p = PassiveRegistry.removePassiveFromPlayer(p, pid);
            }
        }
        // Apply any missing desired passives
        const newApplied = [];
        for (const pid of desiredIds) {
            // Always reapply to allow scaling bonuses (based on alignment axes) to refresh.
            if (applied.includes(pid)) {
                p = PassiveRegistry.removePassiveFromPlayer(p, pid);
            }
            p = PassiveRegistry.applyPassiveToPlayer(p, pid);
            newApplied.push(pid);
        }
        p.alignmentPassiveApplied = newApplied;
        // Keep original tags array on player for legacy consumers
        if (tags.length) {
            p.passives = Array.isArray(p.passives) ? p.passives : [];
            for (const t of tags)
                if (!p.passives.includes(t))
                    p.passives.push(t);
        }
        return p;
    }
    catch (_e) {
        return player;
    }
}
exports.default = { applyAlignmentPassives };
