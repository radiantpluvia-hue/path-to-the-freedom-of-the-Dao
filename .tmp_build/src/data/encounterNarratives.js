"use strict";
// Simple narrative templates for encounter branching
// Each template is a node with id, title, body, and choices. Choices may point to another template
// via nextTemplateId or resolve immediately via consequence: 'combat' | 'peace' | 'reward' | 'escape'
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
exports.ENCOUNTER_NARRATIVES = void 0;
exports.initEncounterNarratives = initEncounterNarratives;
exports.getEncounterTemplate = getEncounterTemplate;
exports.ENCOUNTER_NARRATIVES = {
    'ambush_intro': {
        id: 'ambush_intro',
        title: 'An Ambush on the Road',
        body: 'You round a bend and find several figures blocking the path. They brandish crude weapons and shout for your valuables.',
        choices: [
            { id: 'fight_now', text: 'Stand your ground and fight', consequence: 'combat' },
            { id: 'attempt_neg', text: 'Try to reason / bribe them', consequence: 'peace', nextTemplateId: 'ambush_negotiate' },
            { id: 'slip_past', text: 'Try to slip past silently', consequence: 'escape' }
        ],
        ai: { preferredTechniques: ['quick_strike', 'parry'], openingBias: true }
    },
    'ambush_negotiate': {
        id: 'ambush_negotiate',
        title: 'Negotiation',
        body: 'You offer a modest sum and speak calmly. The leader seems unsure.',
        choices: [
            { id: 'pay', text: 'Pay them off', consequence: 'reward' },
            { id: 'insult', text: 'Insult them and provoke', consequence: 'combat' },
            { id: 'withdraw', text: 'Back away slowly and leave', consequence: 'escape' }
        ]
    }
};
/**
 * Initialize encounter narratives from external JSON data.
 * Call this once at app startup to merge any content pipelines' JSON files.
 */
async function initEncounterNarratives() {
    try {
        // Prefer static ESM import of optional JSON where possible; fall back to dynamic import
        // Always use dynamic import to avoid introducing synchronous CommonJS require() into bundles.
        let extra = null;
        try {
            const mod = await Promise.resolve().then(() => __importStar(require('./encounter_narratives.json')));
            // Support both ESM default export and direct object
            extra = (mod && mod.default) ? mod.default : mod;
        }
        catch (e) {
            extra = null;
        }
        if (extra && typeof extra === 'object') {
            for (const k of Object.keys(extra)) {
                exports.ENCOUNTER_NARRATIVES[k] = { ...(exports.ENCOUNTER_NARRATIVES[k] || {}), ...extra[k] };
            }
        }
    }
    catch (e) {
        // No-op if JSON not present; content may be provided by other means
    }
}
function getEncounterTemplate(id) {
    return exports.ENCOUNTER_NARRATIVES[id] || null;
}
// Bulk-add more small narrative templates used across travel edges
exports.ENCOUNTER_NARRATIVES['roadside_merchant'] = {
    id: 'roadside_merchant',
    title: 'Roadside Merchant',
    body: 'A small merchant barters exotic wares by the roadside. He eyes your gear with interest.',
    choices: [
        { id: 'haggle', text: 'Haggle for a discount', consequence: 'reward' },
        { id: 'ignore', text: 'Ignore and move on', consequence: 'escape' }
    ]
};
exports.ENCOUNTER_NARRATIVES['lonely_monk'] = {
    id: 'lonely_monk',
    title: 'A Lonely Monk',
    body: 'A monk kneels and asks for alms. He humbly requests a word of guidance.',
    choices: [
        { id: 'speak', text: 'Offer a few words of advice', consequence: 'peace' },
        { id: 'decline', text: 'Decline and hurry on', consequence: 'escape' }
    ]
};
exports.ENCOUNTER_NARRATIVES['bandit_camp'] = {
    id: 'bandit_camp',
    title: 'Bandit Camp',
    body: 'You discover a small camp of bandits. They have your trail — this could turn violent.',
    choices: [
        { id: 'launch', text: 'Launch a surprise attack', consequence: 'combat' },
        { id: 'sneak', text: 'Try to sneak past', consequence: 'escape' }
    ],
    ai: { preferredTechniques: ['cur_multi_slash', 'cur_stun_strike'], openingBias: true }
};
exports.ENCOUNTER_NARRATIVES['strange_ruin'] = {
    id: 'strange_ruin',
    title: 'Strange Ruins',
    body: 'Ancient stones whisper on the wind. Something valuable might lurk within.',
    choices: [
        { id: 'enter', text: 'Enter the ruins to explore', consequence: 'reward' },
        { id: 'leave', text: 'Leave it be', consequence: 'escape' }
    ]
};
